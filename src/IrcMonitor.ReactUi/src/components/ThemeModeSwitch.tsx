import DarkMode from "@mui/icons-material/DarkMode";
import LightMode from "@mui/icons-material/LightMode";
import { Box, Switch, Tooltip } from "@mui/material";
import { appUiActions } from "actions/appUiActions";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { getThemeMode } from "reducers/appUiReducer";

export const ThemeModeSwitch: React.FC = () => {
  const mode = useSelector(getThemeMode);
  const dispatch = useDispatch();
  return (
    <Tooltip title={mode === "dark" ? "Switch to light mode" : "Switch to dark mode"}>
      <Box sx={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
        {mode === "dark" ? <DarkMode fontSize="small" color="primary" /> : <LightMode fontSize="small" color="primary" />}
        <Switch size="small" checked={mode === "dark"} inputProps={{ "aria-label": "Dark mode" }}
          onChange={(_, checked) => dispatch(appUiActions.setThemeMode(checked ? "dark" : "light"))} />
      </Box>
    </Tooltip>
  );
};
