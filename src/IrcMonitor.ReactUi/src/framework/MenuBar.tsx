import { AppBar, useMediaQuery, useTheme } from "@mui/material";
import React, { useEffect } from "react";
import { getChannels, getSelectecChannel } from "reducers/userReducer";

import { useDispatch, useSelector } from "react-redux";
import { userActions } from "actions/userActions";
import { MobileMenu } from "./MobileMenu";
import { DesktopMenu } from "./DesktopMenu";
import { ircActions } from "actions/ircActions";

export interface MenuBarProps {
  handleLoginWithGoogleAuthCode: () => void;
  handleLogOut: () => void;
  handleNavigateTo: (route: string) => void;
}

const selectedChannelLocalStorageKey = "selectedChannel";

export const MenuBar: React.FC<MenuBarProps> = ({
  handleLogOut,
  handleNavigateTo,
  handleLoginWithGoogleAuthCode
}) => {
  const theme = useTheme();
  const drawDesktop = useMediaQuery(theme.breakpoints.up("lg"));

  const channels = useSelector(getChannels);
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
    dispatch(ircActions.storeSelectedNicks([]));
  };

  return (
    <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
      {!drawDesktop ? (
        <MobileMenu
          onNavigate={handleNavigateTo}
          onLogin={handleLoginWithGoogleAuthCode}
          onLogOut={handleLogOut}
          onSelectChannel={handleSelectChannel}
        />
      ) : (
        <DesktopMenu
          onNavigate={handleNavigateTo}
          onLogin={handleLoginWithGoogleAuthCode}
          onLogOut={handleLogOut}
          onSelectChannel={handleSelectChannel}
        />
      )}
    </AppBar>
  );
};
