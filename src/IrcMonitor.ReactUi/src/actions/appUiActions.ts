import { Action } from "redux";

export enum AppUiActionTypes {
  StoreHasLeftMenu = "Ui/StoreIsLeftMenuOpen",
  ToggleLeftMenu = "Ui/ToggleLeftMenu"
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
  storeHasLeftMenu: (isOpen: boolean): StoreHasLeftMenu => ({
    type: AppUiActionTypes.StoreHasLeftMenu,
    isOpen
  }),
  toggleLeftMenu: (isOpen: boolean): ToggleLeftMenu => ({
    type: AppUiActionTypes.ToggleLeftMenu,
    isOpen
  })
};
export type AppUiActions = StoreHasLeftMenu | ToggleLeftMenu;
