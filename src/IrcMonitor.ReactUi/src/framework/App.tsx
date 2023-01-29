import { Container } from "@mui/material";
import { CredentialResponse, GoogleOAuthProvider } from "@react-oauth/google";
import { userActions } from "actions/userActions";
import { AuthApi, UserVm } from "api";
import { MenuBar } from "components/MenuBar";
import { gapi } from "gapi-script";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux/es/exports";
import { useNavigate } from "react-router";
import { getGoogleAccessToken, getUserInfo } from "reducers/userReducer";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import config from "../config.json";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { CookiesProvider, useCookies } from "react-cookie";
import { useApiHook } from "hooks/useApiHook";
import { routes } from "utilities/routes";

interface AppProps {
  children: React.ReactNode;
}

const userInfoCookieName = "userInfo";

export const App: React.FC<AppProps> = (props) => {
  const dispatch = useDispatch();
  const user = useSelector(getUserInfo);
  const navigate = useNavigate();
  const [cookies, setCookie] = useCookies([userInfoCookieName]);
  const apiHook = useApiHook();

  const googleIdToken = useSelector(getGoogleAccessToken);

  useEffect(() => {
    const userInf = cookies.userInfo as UserVm;

    if (userInf !== undefined && userInf?.email) {
      dispatch(userActions.storeUserInfo(userInf));
    }
  }, [cookies, dispatch]);
  useEffect(() => {
    function start() {
      gapi.client.init({
        clientId: config.GOOGLE_CLIENT_ID,
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
    if (!googleIdToken) {
      return;
    }
    const api = new AuthApi();
    api.authGoogleAuth({ handleGoogleLoginCommand: { tokenId: googleIdToken } }).then((res) => {
      dispatch(userActions.storeUserInfo(res));
      setCookie(userInfoCookieName, res);
    });
  }, [googleIdToken, dispatch, setCookie]);

  const handleGoogleAuth = (response: CredentialResponse) => {
    console.log(response);
    dispatch(userActions.storeGoogleAccessToken(response.credential));
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
      <GoogleOAuthProvider clientId={config.GOOGLE_CLIENT_ID}>
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
      </GoogleOAuthProvider>
    </CookiesProvider>
  );
};
