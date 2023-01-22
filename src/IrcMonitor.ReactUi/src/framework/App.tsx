import { Menu as MenuIcon } from "@mui/icons-material";
import { AppBar, Container, IconButton, Typography } from "@mui/material";
import { gapi } from "gapi-script";
import React, { useEffect } from "react";
import GoogleLogin, { GoogleLoginResponse, GoogleLoginResponseOffline } from "react-google-login";
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
  useEffect(() => {
    function start() {
      gapi.client.init({
        clientId: config.GOOGLE_CLIENT_ID,
        scope: ""
      });
    }

    gapi.load("client:auth2", start);
  }, []);

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
            <GoogleLogin
              clientId={config.GOOGLE_CLIENT_ID}
              buttonText="Google Login"
              redirectUri="https://localhost:3000/"
              onSuccess={(response: GoogleLoginResponse | GoogleLoginResponseOffline) => {
                console.log("Success", response);
              }}
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
          </MenuArea>
        </MenuItemsContainer>
      </AppBar>
      <PageContainer>{props.children}</PageContainer>
    </Container>
  );
};
