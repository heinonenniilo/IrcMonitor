import { AppBar, IconButton, MenuItem } from "@mui/material";
import { CredentialResponse } from "@react-oauth/google";
import React from "react";
import { User } from "reducers/userReducer";
import styled from "styled-components";
import { Menu as MenuIcon } from "@mui/icons-material";
import { UserMenu } from "./UserMenu";
import { routes } from "utilities/routes";

export interface MenuBarProps {
  handleGoogleAuth: (response: CredentialResponse) => void;
  handleLogOut: () => void;
  handleNavigateTo: (route: string) => void;
  user: User | undefined;
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

export const MenuBar: React.FC<MenuBarProps> = ({
  handleGoogleAuth,
  handleLogOut,
  user,
  handleNavigateTo
}) => {
  // TODO Implement better handling of navigation.
  return (
    <AppBar position="static">
      <MenuItemsContainer>
        <MenuArea>
          <IconButton size="large" edge="start" color="inherit" aria-label="menu" sx={{ mr: 2 }}>
            <MenuIcon />
          </IconButton>
          <MenuItem
            onClick={() => {
              handleNavigateTo(routes.main);
            }}
          >
            Home
          </MenuItem>
          <MenuItem
            onClick={() => {
              handleNavigateTo(routes.browse);
            }}
          >
            Browse
          </MenuItem>
        </MenuArea>

        <MenuArea>
          <UserMenu handleGoogleAuth={handleGoogleAuth} user={user} handleLogOut={handleLogOut} />
        </MenuArea>
      </MenuItemsContainer>
    </AppBar>
  );
};
