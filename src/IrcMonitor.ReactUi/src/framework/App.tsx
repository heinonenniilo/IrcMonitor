import { Menu as MenuIcon } from "@mui/icons-material";
import { AppBar, Container, IconButton, Typography } from "@mui/material";
import { userActions } from "actions/userActions";
import { AuthApi } from "api";
import { gapi } from "gapi-script";
import React, { useEffect } from "react";
import GoogleLogin, { GoogleLoginResponse } from "react-google-login";
import { useDispatch, useSelector } from "react-redux/es/exports";
import { getUserInfo } from "reducers/userReducer";
import styled from "styled-components";
import config from "../config.json";

const PageContainer = styled.div`
  width: "100";
  height: "100%";
  display: "flex";
  flex-direction: column;
`;

interface AppProps {
  children: React.ReactNode;
}

const MenuItemsContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`;

const MenuArea = styled.div`
  display: flex;
  flex-direction: row;
`;

export const App: React.FC<AppProps> = (props) => {
  const dispatch = useDispatch();

  const user = useSelector(getUserInfo);
  useEffect(() => {
    function start() {
      gapi.client.init({
        clientId: config.GOOGLE_CLIENT_ID,
        scope: ""
      });
    }

    gapi.load("client:auth2", start);
  }, []);

  const handleGooleAuth = (response: GoogleLoginResponse) => {
    dispatch(userActions.storeGoogleAuthInfo(response));

    const api = new AuthApi();
    api.authGoogleAuth({ handleGoogleLoginCommand: { tokenId: response.tokenId } }).then((res) => {
      dispatch(userActions.storeAccessToken(res));
    });
  };
  return (
    <Container>
      <AppBar position="static">
        <MenuItemsContainer>
          <MenuArea>
            <IconButton size="large" edge="start" color="inherit" aria-label="menu" sx={{ mr: 2 }}>
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" component="div" marginTop={"auto"} marginBottom={"auto"}>
              Home
            </Typography>
          </MenuArea>

          <MenuArea>
            {user && user.loggedIn ? (
              <Typography variant="h6" marginTop={"auto"} marginBottom={"auto"}>
                {`${user.firstName} ${user.lastName}`}
              </Typography>
            ) : (
              <GoogleLogin
                clientId={config.GOOGLE_CLIENT_ID}
                buttonText="Google Login"
                redirectUri="https://localhost:3000/"
                onSuccess={handleGooleAuth}
                onFailure={(response) => {
                  console.log("Failure", response);
                }}
                onAutoLoadFinished={(res) => {
                  console.log("auto load", res);
                }}
                onScriptLoadFailure={(res) => {
                  console.log("Script load failure", res);
                }}
              />
            )}
          </MenuArea>
        </MenuItemsContainer>
      </AppBar>
      <PageContainer>{props.children}</PageContainer>
    </Container>
  );
};
