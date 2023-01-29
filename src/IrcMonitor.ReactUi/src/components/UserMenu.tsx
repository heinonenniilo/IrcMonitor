import { AccountCircle } from "@mui/icons-material";
import { Button, IconButton, Menu, MenuItem, Typography } from "@mui/material";
import { CredentialResponse, GoogleLogin, googleLogout } from "@react-oauth/google";
import React from "react";
import { User } from "reducers/userReducer";

export interface UserMenuProps {
  handleGoogleAuth: (response: CredentialResponse) => void;
  handleLogOut: () => void;
  user: User | undefined;
  autoLogOn?: boolean;
}

export const UserMenu: React.FC<UserMenuProps> = ({
  handleGoogleAuth,
  user,
  handleLogOut,
  autoLogOn
}) => {
  const [userMenuAcnhor, setUserMenuAcnhor] = React.useState<null | HTMLElement>(null);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setUserMenuAcnhor(event.currentTarget);
  };

  const handleClose = () => {
    setUserMenuAcnhor(null);
  };

  if (!autoLogOn && user && user.loggedIn) {
    return (
      <>
        <Typography variant="h6" marginTop={"auto"} marginBottom={"auto"}>
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
      </>
    );
  } else {
    return (
      <>
        <GoogleLogin onSuccess={handleGoogleAuth} />
      </>
    );
  }
};
