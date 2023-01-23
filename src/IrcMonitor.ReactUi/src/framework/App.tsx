import { Menu as MenuIcon } from "@mui/icons-material";
import { AppBar, Container, IconButton, Typography } from "@mui/material";
import { CredentialResponse, GoogleOAuthProvider } from "@react-oauth/google";
import { userActions } from "actions/userActions";
import { AuthApi } from "api";
import { UserMenu } from "components/UserMenu";
import { gapi } from "gapi-script";
import React, { useEffect } from "react";
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

  const handleGooleAuth = (response: CredentialResponse) => {
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

  return (
    <GoogleOAuthProvider clientId={config.GOOGLE_CLIENT_ID}>
      <Container maxWidth="lg">
        <AppBar position="static">
          <MenuItemsContainer>
            <MenuArea>
              <IconButton
                size="large"
                edge="start"
                color="inherit"
                aria-label="menu"
                sx={{ mr: 2 }}
              >
                <MenuIcon />
              </IconButton>
              <Typography variant="h6" component="div" marginTop={"auto"} marginBottom={"auto"}>
                Home
              </Typography>
            </MenuArea>

            <MenuArea>
              <UserMenu
                handleGoogleAuth={handleGooleAuth}
                user={user}
                handleLogOut={handleLogOut}
              />
            </MenuArea>
          </MenuItemsContainer>
        </AppBar>
        <PageContainer>{props.children}</PageContainer>
      </Container>
    </GoogleOAuthProvider>
  );
};
