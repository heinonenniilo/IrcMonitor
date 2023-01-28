import { AppBar, IconButton, MenuItem } from "@mui/material";
import { CredentialResponse } from "@react-oauth/google";
import React from "react";
import { getChannels, User } from "reducers/userReducer";
import styled from "styled-components";
import { Menu as MenuIcon } from "@mui/icons-material";
import { UserMenu } from "./UserMenu";
import { routes } from "utilities/routes";
import { useDispatch, useSelector } from "react-redux";
import { SelectChannel } from "./SelectChannel";
import { userActions } from "actions/userActions";
import { AuthorizedComponent } from "framework/AuthorizedComponent";
import { RoleNames } from "enums/RoleEnums";

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
  padding-top: 16px;
  padding-bottom: 16px;
`;

export const MenuBar: React.FC<MenuBarProps> = ({
  handleGoogleAuth,
  handleLogOut,
  user,
  handleNavigateTo
}) => {
  // TODO Implement better handling of navigation.

  const channels = useSelector(getChannels);

  const dispatch = useDispatch();

  const handleSelectChannel = (channelId: string | undefined) => {
    dispatch(userActions.selectChannel(channelId));
  };

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
          <AuthorizedComponent requiredRole={RoleNames.Viewer}>
            <MenuItem
              onClick={() => {
                handleNavigateTo(routes.browse);
              }}
            >
              Browse
            </MenuItem>
          </AuthorizedComponent>
        </MenuArea>

        <MenuArea>
          <AuthorizedComponent requiredRole={RoleNames.Viewer}>
            <MenuItem>
              <SelectChannel channels={channels} onSelectChannel={handleSelectChannel} />
            </MenuItem>
          </AuthorizedComponent>
          <UserMenu handleGoogleAuth={handleGoogleAuth} user={user} handleLogOut={handleLogOut} />
        </MenuArea>
      </MenuItemsContainer>
    </AppBar>
  );
};
