import { AppBar, Container, IconButton, MenuItem } from "@mui/material";
import React, { useEffect } from "react";
import { getChannels, getIsReLogging, getSelectecChannel, User } from "reducers/userReducer";
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
  handleLoginWithGoogleAuthCode: () => void;
  handleLogOut: () => void;
  handleNavigateTo: (route: string) => void;
  user: User | undefined;
}

const MenuItemsContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  width: 100%;
  max-width: 100%;
`;

const MenuArea = styled.div`
  display: flex;
  flex-direction: row;
  padding-top: 16px;
  padding-bottom: 16px;
`;

const selectedChannelLocalStorageKey = "selectedChannel";

export const MenuBar: React.FC<MenuBarProps> = ({
  handleLogOut,
  user,
  handleNavigateTo,
  handleLoginWithGoogleAuthCode
}) => {
  // TODO Implement better handling of navigation.

  const channels = useSelector(getChannels);
  const isReLoggingIn = useSelector(getIsReLogging);
  const selectedChannel = useSelector(getSelectecChannel);

  const dispatch = useDispatch();

  useEffect(() => {
    if (channels && channels.length > 0 && !selectedChannel) {
      const valueInLocalStorage = localStorage.getItem(selectedChannelLocalStorageKey);

      if (valueInLocalStorage && channels.some((c) => c.guid === valueInLocalStorage)) {
        dispatch(userActions.selectChannel(valueInLocalStorage));
      }
    }
  }, [channels, selectedChannel, dispatch]);

  const handleSelectChannel = (channelId: string | undefined) => {
    localStorage.setItem(selectedChannelLocalStorageKey, channelId);
    dispatch(userActions.selectChannel(channelId));
  };

  return (
    <AppBar position="fixed">
      <Container maxWidth="xl">
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
            {!isReLoggingIn ? (
              <>
                <AuthorizedComponent requiredRole={RoleNames.Viewer}>
                  <MenuItem
                    onClick={() => {
                      handleNavigateTo(routes.statistics);
                    }}
                  >
                    Statistics
                  </MenuItem>
                </AuthorizedComponent>
                <AuthorizedComponent requiredRole={RoleNames.Viewer}>
                  <MenuItem
                    onClick={() => {
                      handleNavigateTo(routes.browse);
                    }}
                  >
                    Browse
                  </MenuItem>
                </AuthorizedComponent>
              </>
            ) : null}
          </MenuArea>

          <MenuArea>
            {!isReLoggingIn ? (
              <AuthorizedComponent requiredRole={RoleNames.Viewer}>
                <MenuItem>
                  <SelectChannel channels={channels} onSelectChannel={handleSelectChannel} />
                </MenuItem>
              </AuthorizedComponent>
            ) : null}
            <UserMenu
              user={user}
              handleLogOut={() => {
                handleLogOut();
              }}
              handleGoogleAuthWithCode={handleLoginWithGoogleAuthCode}
              showReLogIn={isReLoggingIn}
            />
          </MenuArea>
        </MenuItemsContainer>
      </Container>
    </AppBar>
  );
};
