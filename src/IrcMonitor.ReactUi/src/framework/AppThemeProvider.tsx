import React, { useEffect, useMemo } from "react";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { useSelector } from "react-redux";
import { getThemeMode, themeModeStorageKey } from "reducers/appUiReducer";
import { createIrcTheme } from "../theme";

export const AppThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const mode = useSelector(getThemeMode);
  const theme = useMemo(() => createIrcTheme(mode), [mode]);

  useEffect(() => {
    try {
      localStorage.setItem(themeModeStorageKey, mode);
    } catch {
      // The theme still works when storage is disabled.
    }
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", theme.palette.background.paper);
  }, [mode, theme]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline enableColorScheme />
      {children}
    </ThemeProvider>
  );
};
