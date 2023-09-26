import { Box, Container, IconButton, MenuItem } from "@mui/material";
import { appUiActions } from "actions/appUiActions";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { getLeftMenuIsOpen } from "reducers/appUiReducer";
import styled from "styled-components";
import { Menu as MenuIcon } from "@mui/icons-material";
import { AuthorizedComponent } from "./AuthorizedComponent";
import { RoleNames } from "enums/RoleEnums";
import { SelectChannel } from "components/SelectChannel";
import { UserMenu } from "components/UserMenu";
import { getChannels, getUserInfo } from "reducers/userReducer";
import { routes } from "utilities/routes";
export interface DesktopMenuProps {
  onNavigate: (route: string) => void;
  onLogin: () => void;
  onLogOut: () => void;
  onSelectChannel: (channelId: string) => void;
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
`;

export const DesktopMenu: React.FC<DesktopMenuProps> = ({
  onNavigate,
  onLogin,
  onLogOut,
  onSelectChannel
}) => {
  const dispatch = useDispatch();
  const isLeftMenuOpen = useSelector(getLeftMenuIsOpen);
  const channels = useSelector(getChannels);
  const user = useSelector(getUserInfo);

  return (
    <Container maxWidth={"xl"}>
      <MenuItemsContainer>
        <MenuArea>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
            onClick={() => {
              dispatch(appUiActions.toggleLeftMenu(!isLeftMenuOpen));
            }}
          >
            <MenuIcon />
          </IconButton>
          <MenuItem
            onClick={() => {
              onNavigate(routes.main);
            }}
          >
            Home
          </MenuItem>

          <AuthorizedComponent requiredRole={RoleNames.Viewer}>
            <MenuItem
              onClick={() => {
                onNavigate(routes.statistics);
              }}
            >
              Statistics
            </MenuItem>
          </AuthorizedComponent>
          <AuthorizedComponent requiredRole={RoleNames.Viewer}>
            <MenuItem
              onClick={() => {
                onNavigate(routes.browse);
              }}
            >
              Browse
            </MenuItem>
          </AuthorizedComponent>
        </MenuArea>
        <Box>
          <MenuArea>
            <AuthorizedComponent requiredRole={RoleNames.Viewer}>
              <MenuItem>
                <SelectChannel channels={channels} onSelectChannel={onSelectChannel} />
              </MenuItem>
            </AuthorizedComponent>

            <UserMenu
              user={user}
              handleLogOut={onLogOut}
              handleGoogleAuthWithCode={onLogin}
              showReLogIn={false}
            />
          </MenuArea>
        </Box>
      </MenuItemsContainer>
    </Container>
  );
};
