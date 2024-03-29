import { Box, IconButton, Menu, MenuItem } from "@mui/material";
import React from "react";
import { Menu as MenuIcon } from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";
import { getChannels, getIsReLogging, getUserInfo, getUserVm } from "reducers/userReducer";
import { SelectChannel } from "../components/SelectChannel";
import { routes } from "utilities/routes";
import { getHasLeftMenu, getLeftMenuIsOpen } from "reducers/appUiReducer";
import { UserMenu } from "../components/UserMenu";
import { appUiActions } from "actions/appUiActions";

export interface MobileMenuProps {
  onNavigate: (route: string) => void;
  onLogin: () => void;
  onLogOut: () => void;
  onSelectChannel: (channelId: string) => void;
}

export const MobileMenu: React.FC<MobileMenuProps> = ({
  onNavigate,
  onLogin,
  onLogOut,
  onSelectChannel
}) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const channels = useSelector(getChannels);
  const isReLogging = useSelector(getIsReLogging);
  const userVm = useSelector(getUserVm);
  const user = useSelector(getUserInfo);
  const isLeftMenuOpen = useSelector(getLeftMenuIsOpen);
  const hasLeftMenu = useSelector(getHasLeftMenu);
  const open = Boolean(anchorEl);

  const dispatch = useDispatch();

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleClick = (route: string, event: React.MouseEvent<HTMLLIElement, MouseEvent>) => {
    setAnchorEl(null);
    onNavigate(route);
  };

  const drawMenu = () => {
    if (!userVm) {
      return;
    }

    if (!isReLogging && userVm?.roles?.length > 0) {
      return (
        <Menu
          id="lock-menu"
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          MenuListProps={{
            "aria-labelledby": "lock-button",
            role: "listbox"
          }}
        >
          <MenuItem
            selected={false}
            onClick={(event) => {
              handleClick(routes.main, event);
            }}
          >
            Home
          </MenuItem>
          <MenuItem
            selected={false}
            onClick={(event) => {
              handleClick(routes.statistics, event);
            }}
          >
            Statistics
          </MenuItem>
          <MenuItem
            selected={false}
            onClick={(event) => {
              handleClick(routes.browse, event);
            }}
          >
            Browse
          </MenuItem>

          <MenuItem selected={false}>
            <SelectChannel
              channels={channels}
              onSelectChannel={(r) => {
                onSelectChannel(r);
                handleClose();
              }}
              isMobile
            />
          </MenuItem>
          {hasLeftMenu ? (
            <MenuItem
              selected={false}
              onClick={() => {
                dispatch(appUiActions.toggleLeftMenu(!isLeftMenuOpen));
                handleClose();
              }}
            >
              {isLeftMenuOpen ? "Hide filters" : "Show filters"}
            </MenuItem>
          ) : null}
        </Menu>
      );
    }
  };

  // TODO: Check the definition for paddingLeft
  return (
    <Box sx={{ width: "100%", display: "flex", flexDirection: "row" }}>
      <Box sx={{ display: "flex", flexDirection: "row", pl: 1.5 }}>
        <IconButton
          size="large"
          edge="start"
          color="inherit"
          aria-label="menu"
          id="mobileHamburger"
          onClick={(event) => {
            setAnchorEl(event.currentTarget);
          }}
        >
          <MenuIcon />
        </IconButton>
        {drawMenu()}
      </Box>

      <Box sx={{ marginLeft: "auto" }}>
        <UserMenu
          user={user}
          handleGoogleAuthWithCode={onLogin}
          handleLogOut={onLogOut}
          showReLogIn={isReLogging}
          isMobile
        />
      </Box>
    </Box>
  );
};
