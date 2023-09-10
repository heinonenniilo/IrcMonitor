import { Container } from "@mui/material";
import { CredentialResponse } from "@react-oauth/google";
import { userActions } from "actions/userActions";
import { UserVm } from "api";
import { MenuBar } from "components/MenuBar";
import { gapi } from "gapi-script";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux/es/exports";
import { useNavigate } from "react-router";
import { getGoogleAccessToken, getIsReLogging, getUserInfo, getUserVm } from "reducers/userReducer";
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

  const googleTokenInfo = useSelector(getGoogleAccessToken);

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
      api.ircGetIrcChannels({ exclude: undefined }).then((res) => {
        if (res.channels) {
          dispatch(userActions.storeUserChannels(res.channels));
        }
      });
    }
  }, [dispatch, apiHook.ircApi]);

  useEffect(() => {
    if (navigate && isReLogginIn) {
      navigate(routes.main);
    }
  }, [isReLogginIn, navigate]);

  useEffect(() => {
    if (!googleTokenInfo || !apiHook.authApi || !googleTokenInfo.triggerLogIn) {
      return;
    }
    dispatch(userActions.setIsLoggingIn(true));
    apiHook.authApi
      .authGoogleAuth({ handleGoogleLoginCommand: { tokenId: googleTokenInfo.accessToken } })
      .then((res) => {
        dispatch(userActions.storeUserInfo(res));
      })
      .finally(() => {
        dispatch(userActions.setIsLoggingIn(false));
      });
  }, [googleTokenInfo, dispatch, apiHook.authApi]);

  useEffect(() => {
    if (userVm) {
      console.log("Setting cookies");
      setCookie(userInfoCookieName, userVm);
    }
  }, [userVm, setCookie]);

  const handleGoogleAuth = (response: CredentialResponse) => {
    dispatch(userActions.storeGoogleAccessToken(response.credential, true));
  };

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
            handleGoogleAuth={handleGoogleAuth}
            handleLogOut={handleLogOut}
            handleNavigateTo={handleNavigate}
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
