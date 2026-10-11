import { Action } from "redux";
import { PaletteMode } from "@mui/material";

export enum AppUiActionTypes {
  StoreHasLeftMenu = "Ui/StoreIsLeftMenuOpen",
  ToggleLeftMenu = "Ui/ToggleLeftMenu",
  SetThemeMode = "Ui/SetThemeMode"
}

export interface StoreHasLeftMenu extends Action {
  type: AppUiActionTypes.StoreHasLeftMenu;
  isOpen: boolean;
}

export interface ToggleLeftMenu extends Action {
  type: AppUiActionTypes.ToggleLeftMenu;
  isOpen: boolean;
}

export const appUiActions = {
  setThemeMode: (mode: PaletteMode): SetThemeMode => ({
    type: AppUiActionTypes.SetThemeMode,
    mode
  }),
  storeHasLeftMenu: (isOpen: boolean): StoreHasLeftMenu => ({
    type: AppUiActionTypes.StoreHasLeftMenu,
    isOpen
  }),
  toggleLeftMenu: (isOpen: boolean): ToggleLeftMenu => ({
    type: AppUiActionTypes.ToggleLeftMenu,
    isOpen
  })
};
export interface SetThemeMode extends Action {
  type: AppUiActionTypes.SetThemeMode;
  mode: PaletteMode;
}

export type AppUiActions = StoreHasLeftMenu | ToggleLeftMenu | SetThemeMode;
