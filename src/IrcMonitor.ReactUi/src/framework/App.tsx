import { Alert, Box, Container } from "@mui/material";
import { googleLogout, useGoogleLogin } from "@react-oauth/google";
import { userActions } from "actions/userActions";
import { MenuBar } from "framework/MenuBar";
import { gapi } from "gapi-script";
import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { getIsReLogging, getUserInfo } from "reducers/userReducer";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { useApiHook } from "hooks/useApiHook";
import { routes } from "utilities/routes";

interface AppProps {
  children: React.ReactNode;
}

export const App: React.FC<AppProps> = (props) => {
  const dispatch = useDispatch();
  const user = useSelector(getUserInfo);
  const navigate = useNavigate();
  const apiHook = useApiHook();
  const { authApi } = apiHook;
  const restoreUserRequest = useRef<AbortController>();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState(false);
  const isReLogginIn = useSelector(getIsReLogging);

  // Restore the server-managed session once when the app loads.
  useEffect(() => {
    const controller = new AbortController();
    restoreUserRequest.current = controller;
    authApi
      .authGetUserRaw({ signal: controller.signal })
      .then(async (response) => {
        // The endpoint returns no content when there is no saved session.
        if (response.raw.status === 204) return;
        const userVm = await response.value();
        if (!controller.signal.aborted && userVm?.email) {
          dispatch(userActions.storeUserInfo(userVm));
        }
      })
      .catch((err) => {
        if (!controller.signal.aborted && err.response?.status !== 401) {
          console.error(err);
        }
      });
    return () => controller.abort();
  }, [authApi, dispatch]);
  useEffect(() => {
    function start() {
      gapi.client.init({
        clientId: import.meta.env.VITE_GOOGLE_APP_ID,
        scope: ""
      });
    }
    gapi.load("client:auth2", start);
  }, []);

  useEffect(() => {
    if (apiHook.ircApi) {
      const api = apiHook.ircApi;
      dispatch(userActions.setIsLoadingChannels(true));
      api
        .ircGetIrcChannels({ exclude: undefined })
        .then((res) => {
          if (res.channels) {
            dispatch(userActions.setIsLoadingChannels(false));
            dispatch(userActions.storeUserChannels(res.channels));
          }
        })
        .catch((err) => {
          console.error(err);
        })
        .finally(() => {
          dispatch(userActions.setIsLoadingChannels(false));
        });
    }
  }, [dispatch, apiHook.ircApi]);

  useEffect(() => {
    if (navigate && isReLogginIn) {
      navigate(routes.main);
    }
  }, [isReLogginIn, navigate]);

  const loginWithGoogleAuthCode = useGoogleLogin({
    onSuccess: (code) => {
      restoreUserRequest.current?.abort();
      dispatch(userActions.setIsLoggingIn(true));
      apiHook.authApi
        .authGoogleAuthCode({
          handleGoogleAuthorizationCodeCommand: { authorizationCode: code.code, email: user?.email }
        })
        .then((res) => {
          dispatch(userActions.storeUserInfo(res));
        })
        .finally(() => {
          dispatch(userActions.setIsReLoggingIn(false));
          dispatch(userActions.setIsLoggingIn(false));
        });
    },
    hint: user?.email,
    flow: "auth-code"
  });

  const handleLogOut = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    setLogoutError(false);
    restoreUserRequest.current?.abort();
    try {
      await authApi.authLogout();
      dispatch(userActions.clearUserInfo());
      dispatch(userActions.setIsReLoggingIn(false));
      dispatch(userActions.setIsLoggingIn(false));
      googleLogout();
      handleNavigate(routes.main);
    } catch (err) {
      console.error(err);
      setLogoutError(true);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleNavigate = (route: string) => {
    navigate(route);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterMoment}>
      <Container maxWidth={"xl"} sx={{ top: 0 }}>
        <MenuBar
          isLoggingOut={isLoggingOut}
          handleLogOut={handleLogOut}
          handleNavigateTo={handleNavigate}
          handleLoginWithGoogleAuthCode={loginWithGoogleAuthCode}
        />
      </Container>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          marginTop: "80px"
        }}
      >
        {logoutError && <Alert severity="error">Unable to log out. Please try again.</Alert>}
        {props.children}
      </Box>
    </LocalizationProvider>
  );
};
