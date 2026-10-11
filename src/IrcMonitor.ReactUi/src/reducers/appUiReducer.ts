import { AppUiActionTypes, AppUiActions } from "actions/appUiActions";
import produce from "immer";
import { AppState } from "setup/appRootReducer";
import { PaletteMode } from "@mui/material";

export const themeModeStorageKey = "ircMonitor.themeMode";

export const getInitialThemeMode = (): PaletteMode => {
  try {
    const savedMode = localStorage.getItem(themeModeStorageKey);
    if (savedMode === "light" || savedMode === "dark") return savedMode;
  } catch {
    // Keep the switch usable when browser storage is unavailable.
  }
  return typeof window !== "undefined" && window.matchMedia?.("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

export interface AppUiState {
  hasLeftMenu: boolean;
  leftMenuIsOpen: boolean;
  themeMode: PaletteMode;
}

const defaultState: AppUiState = {
  hasLeftMenu: false,
  leftMenuIsOpen: false,
  themeMode: getInitialThemeMode()
};

export function appUiReducer(state: AppUiState = defaultState, action: AppUiActions): AppUiState {
  switch (action.type) {
    case AppUiActionTypes.SetThemeMode:
      return { ...state, themeMode: action.mode };
    case AppUiActionTypes.StoreHasLeftMenu:
      state = produce(state, (draft) => {
        draft.hasLeftMenu = action.isOpen;
      });
      break;
    case AppUiActionTypes.ToggleLeftMenu:
      state = produce(state, (draft) => {
        draft.leftMenuIsOpen = action.isOpen;
      });
      break;
  }

  return state;
}

export const getHasLeftMenu = (state: AppState): boolean => state.appUi.hasLeftMenu;
export const getLeftMenuIsOpen = (state: AppState): boolean => state.appUi.leftMenuIsOpen;
export const getThemeMode = (state: AppState): PaletteMode => state.appUi.themeMode;
