import React from "react";
import { fireEvent, render, screen, cleanup } from "@testing-library/react";
import { Provider } from "react-redux";
import { createStore } from "redux";
import { useTheme } from "@mui/material";
import { appRootReducer } from "setup/appRootReducer";
import { appUiActions } from "actions/appUiActions";
import { getInitialThemeMode, themeModeStorageKey } from "reducers/appUiReducer";
import { AppThemeProvider } from "framework/AppThemeProvider";
import { ThemeModeSwitch } from "./ThemeModeSwitch";
import { HeaderBrand } from "./HeaderBrand";
import lightLogo from "assets/logo-light.svg";
import darkLogo from "assets/logo-dark.svg";

afterEach(() => {
  cleanup();
  localStorage.clear();
});

const ThemeProbe = () => {
  const theme = useTheme();
  return <span data-testid="theme">{theme.palette.mode}:{theme.palette.primary.main}</span>;
};

test("switch changes Redux state, the active palette and logo, and persists the preference", () => {
  const store = createStore(appRootReducer);
  store.dispatch(appUiActions.setThemeMode("light"));
  render(
    <Provider store={store}>
      <AppThemeProvider>
        <ThemeModeSwitch />
        <HeaderBrand onClick={() => {}} />
        <ThemeProbe />
      </AppThemeProvider>
    </Provider>
  );
  expect(screen.getByTestId("theme")).toHaveTextContent("light:#8A5700");
  expect(screen.getByAltText("IRC Monitor")).toHaveAttribute("src", lightLogo);
  fireEvent.click(screen.getByRole("checkbox", { name: "Dark mode" }));
  expect(store.getState().appUi.themeMode).toBe("dark");
  expect(screen.getByTestId("theme")).toHaveTextContent("dark:#FFC107");
  expect(screen.getByAltText("IRC Monitor")).toHaveAttribute("src", darkLogo);
  expect(localStorage.getItem(themeModeStorageKey)).toBe("dark");
  expect(getInitialThemeMode()).toBe("dark");
  fireEvent.click(screen.getByRole("checkbox", { name: "Dark mode" }));
  expect(localStorage.getItem(themeModeStorageKey)).toBe("light");
});

test("invalid stored preferences fall back to a supported mode", () => {
  localStorage.setItem(themeModeStorageKey, "invalid");
  expect(["light", "dark"]).toContain(getInitialThemeMode());
});
