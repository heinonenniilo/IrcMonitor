import { AppBar, Container, IconButton, MenuItem } from "@mui/material";
import { CredentialResponse, useGoogleLogin } from "@react-oauth/google";
import React, { useEffect } from "react";
import { getChannels, getIsReLogging, getUserVm, User } from "reducers/userReducer";
import styled from "styled-components";
import { Menu as MenuIcon } from "@mui/icons-material";
import { UserMenu } from "./UserMenu";
import { routes } from "utilities/routes";
import { useDispatch, useSelector } from "react-redux";
import { SelectChannel } from "./SelectChannel";
import { userActions } from "actions/userActions";
import { AuthorizedComponent } from "framework/AuthorizedComponent";
import { RoleNames } from "enums/RoleEnums";
import { useApiHook } from "hooks/useApiHook";
import moment from "moment";
import jwt_decode from "jwt-decode";
import { tokenRefetchLimitInMinutes } from "framework/App";

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
  width: 100%;
  max-width: 100%;
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
  const isReLoggingIn = useSelector(getIsReLogging);
  const apiHook = useApiHook();
  const userVm = useSelector(getUserVm);

  const dispatch = useDispatch();

  const handleSelectChannel = (channelId: string | undefined) => {
    dispatch(userActions.selectChannel(channelId));
  };

  useEffect(() => {
    try {
      // TODO handle token refresh
      if (!userVm || !userVm.accessToken) {
        return;
      }

      const token = jwt_decode(userVm.accessToken) as any;
      const momentDate = moment.unix(token.exp);
      const cur = moment();
      var duration = moment.duration(momentDate.diff(cur)).asMinutes();

      console.log(duration);
      if (duration < tokenRefetchLimitInMinutes) {
        if (userVm?.googleRefreshToken) {
          dispatch(userActions.setIsLoggingIn(true));
          apiHook.authApi
            .authGoogleAuthCode({
              handleGoogleAuthorizationCodeCommand: {
                authorizationCode: userVm.googleRefreshToken,
                email: token.sid,
                isRefresh: true
              }
            })
            .then((res) => {
              dispatch(userActions.storeUserInfo(res));
            })
            .catch((err) => {
              dispatch(userActions.setIsReLoggingIn(true));
              console.error(err);
            })
            .finally(() => {
              dispatch(userActions.setIsLoggingIn(false));
            });
        } else {
          dispatch(userActions.setIsReLoggingIn(true));
        }
      }
    } catch (err) {
      console.error(err);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiHook.authApi, dispatch, userVm?.accessToken]);

  const loginWithGoogleAuthCode = useGoogleLogin({
    onSuccess: (code) => {
      apiHook.authApi
        .authGoogleAuthCode({
          handleGoogleAuthorizationCodeCommand: { authorizationCode: code.code, email: user?.email }
        })
        .then((res) => {
          dispatch(userActions.storeUserInfo(res));
        })
        .finally(() => {
          dispatch(userActions.setIsReLoggingIn(false));
        });
    },
    hint: user?.email,
    flow: "auth-code"
  });

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
              handleGoogleAuth={handleGoogleAuth}
              user={user}
              handleLogOut={() => {
                handleLogOut();
              }}
              handleGoogleAuthWithCode={() => {
                loginWithGoogleAuthCode();
              }}
              showReLogIn={isReLoggingIn}
            />
          </MenuArea>
        </MenuItemsContainer>
      </Container>
    </AppBar>
  );
};
