import { Menu as MenuIcon } from "@mui/icons-material";
import { AppBar, Box, Button, Container, Grid, IconButton, Typography } from "@mui/material";
import React from "react";
import styled from "styled-components";

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
            <Button color="inherit">Login</Button>
          </MenuArea>
        </MenuItemsContainer>
      </AppBar>
      <PageContainer>{props.children}</PageContainer>
    </Container>
  );
};
