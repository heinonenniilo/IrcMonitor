import { Container } from "@mui/material";
import { CredentialResponse, GoogleOAuthProvider } from "@react-oauth/google";
import { userActions } from "actions/userActions";
import { AuthApi, Configuration, IrcApi } from "api";
import { MenuBar } from "components/MenuBar";
import { gapi } from "gapi-script";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux/es/exports";
import { useNavigate } from "react-router";
import { getAccessToken, getUserInfo } from "reducers/userReducer";
import styled from "styled-components";
import config from "../config.json";

const PageContainer = styled.div`
  width: 100;
  height: 100%;
  display: flex;
  flex-direction: column;
  margin-top: 16px;
`;

interface AppProps {
  children: React.ReactNode;
}

export const App: React.FC<AppProps> = (props) => {
  const dispatch = useDispatch();
  const user = useSelector(getUserInfo);
  const navigate = useNavigate();
  const accessToken = useSelector(getAccessToken);

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
    if (accessToken) {
      // TODO implement properly
      console.log("TOKEN", accessToken);
      const api = new IrcApi(new Configuration({ apiKey: `Bearer ${accessToken}` })); // Why isn't access token working?

      api.ircGetIrcChannels({ exclude: undefined }).then((res) => {
        if (res.channels) {
          dispatch(userActions.storeUserChannels(res.channels));
        }
      });
    }
  }, [accessToken, dispatch]);

  const handleGoogleAuth = (response: CredentialResponse) => {
    const api = new AuthApi();
    api
      .authGoogleAuth({ handleGoogleLoginCommand: { tokenId: response.credential } })
      .then((res) => {
        dispatch(userActions.storeUserInfo(res));
      });
  };

  const handleLogOut = () => {
    dispatch(userActions.clearUserInfo());
  };

  const handleNavigate = (route: string) => {
    navigate(route);
  };

  return (
    <GoogleOAuthProvider clientId={config.GOOGLE_CLIENT_ID}>
      <Container maxWidth={"xl"}>
        <MenuBar
          user={user}
          handleGoogleAuth={handleGoogleAuth}
          handleLogOut={handleLogOut}
          handleNavigateTo={handleNavigate}
        />
        <Container maxWidth="xl">
          <PageContainer>{props.children}</PageContainer>
        </Container>
      </Container>
    </GoogleOAuthProvider>
  );
};
