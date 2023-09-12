import { Container } from "@mui/material";
import { useGoogleLogin } from "@react-oauth/google";
import { userActions } from "actions/userActions";
import { UserVm } from "api";
import { MenuBar } from "components/MenuBar";
import { gapi } from "gapi-script";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux/es/exports";
import { useNavigate } from "react-router";
import { getIsReLogging, getUserInfo, getUserVm } from "reducers/userReducer";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { CookiesProvider, useCookies } from "react-cookie";
import { useApiHook } from "hooks/useApiHook";
import { routes } from "utilities/routes";

interface AppProps {
  children: React.ReactNode;
}

const userInfoCookieName = "userInfo";

export const tokenRefetchLimitInMinutes = 5;

export const App: React.FC<AppProps> = (props) => {
  const dispatch = useDispatch();
  const user = useSelector(getUserInfo);
  const userVm = useSelector(getUserVm);
  const navigate = useNavigate();
  const [cookies, setCookie] = useCookies([userInfoCookieName]);
  const apiHook = useApiHook();
  const isReLogginIn = useSelector(getIsReLogging);

  // Set user info from cookies, when the app loads
  useEffect(() => {
    const userInf = cookies.userInfo as UserVm;
    if (userInf !== undefined && userInf?.email && !userVm) {
      dispatch(userActions.storeUserInfo(userInf));
    }
  }, [cookies, dispatch, userVm]);
  useEffect(() => {
    function start() {
      gapi.client.init({
        clientId: process.env.REACT_APP_GOOGLE_APP_ID,
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

  useEffect(() => {
    if (userVm) {
      let date = new Date();
      date.setTime(date.getTime() + 24 * 60 * 60 * 1000); // 24 hours
      setCookie(userInfoCookieName, userVm, { expires: date });
    }
  }, [userVm, setCookie]);

  const loginWithGoogleAuthCode = useGoogleLogin({
    onSuccess: (code) => {
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

  const handleLogOut = () => {
    setCookie(userInfoCookieName, undefined);
    dispatch(userActions.clearUserInfo());
    handleNavigate(routes.main);
  };

  const handleNavigate = (route: string) => {
    navigate(route);
  };

  return (
    <CookiesProvider>
      <LocalizationProvider dateAdapter={AdapterMoment}>
        <Container maxWidth={"xl"} sx={{ top: 0 }}>
          <MenuBar
            user={user}
            handleLogOut={handleLogOut}
            handleNavigateTo={handleNavigate}
            handleLoginWithGoogleAuthCode={loginWithGoogleAuthCode}
          />
        </Container>
        <Container
          maxWidth="xl"
          sx={{
            display: "flex",
            flexDirection: "column",
            width: "100%",
            height: "100%",
            marginTop: "124px"
          }}
        >
          {props.children}
        </Container>
      </LocalizationProvider>
    </CookiesProvider>
  );
};
