import { AccountCircle } from "@mui/icons-material";
import { Box, Button, IconButton, Menu, MenuItem, Typography } from "@mui/material";
import { googleLogout } from "@react-oauth/google";
import React from "react";
import { User } from "reducers/userReducer";

export interface UserMenuProps {
  handleGoogleAuthWithCode: () => void;
  handleLogOut: () => void;
  user: User | undefined;
  showReLogIn: boolean;
  isMobile?: boolean;
}

export const UserMenu: React.FC<UserMenuProps> = ({
  user,
  showReLogIn,
  handleLogOut,
  handleGoogleAuthWithCode,
  isMobile
}) => {
  const [userMenuAcnhor, setUserMenuAcnhor] = React.useState<null | HTMLElement>(null);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setUserMenuAcnhor(event.currentTarget);
  };

  const handleClose = () => {
    setUserMenuAcnhor(null);
  };

  if (showReLogIn) {
    return (
      <>
        <Button
          variant="contained"
          onClick={() => {
            handleGoogleAuthWithCode();
          }}
        >
          Re-rogin
        </Button>
      </>
    );
  } else if (user && user.loggedIn) {
    return (
      <Box sx={{ display: "flex", flexDirection: "row" }}>
        <Typography variant={!isMobile ? "h6" : "body1"} marginTop={"auto"} marginBottom={"auto"}>
          {user.email}
        </Typography>
        <IconButton
          size="large"
          aria-label="account of current user"
          aria-controls="menu-appbar"
          aria-haspopup="true"
          color="inherit"
          onClick={handleMenu}
        >
          <AccountCircle />
        </IconButton>
        <Menu
          id="menu-appbar"
          anchorEl={userMenuAcnhor}
          anchorOrigin={{
            vertical: "top",
            horizontal: "right"
          }}
          keepMounted
          transformOrigin={{
            vertical: "top",
            horizontal: "right"
          }}
          open={Boolean(userMenuAcnhor)}
          onClose={handleClose}
        >
          <MenuItem>
            <Button
              color="inherit"
              onClick={() => {
                handleClose();
                handleLogOut();
                googleLogout();
              }}
            >
              Log out
            </Button>
          </MenuItem>
        </Menu>
      </Box>
    );
  } else {
    return (
      <MenuItem>
        <Button
          variant="contained"
          onClick={() => {
            handleGoogleAuthWithCode();
          }}
        >
          Login with Google
        </Button>
      </MenuItem>
    );
  }
};
