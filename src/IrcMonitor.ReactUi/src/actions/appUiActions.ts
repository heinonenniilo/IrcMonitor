import { Action } from "redux";

export enum AppUiActionTypes {
  StoreIsLeftMenuOpen = "Ui/StoreIsLeftMenuOpen"
}

export interface StoreIsLeftMenuOpen extends Action {
  type: AppUiActionTypes.StoreIsLeftMenuOpen;
  isOpen: boolean;
}

export const appUiActions = {
  storeIsLeftMenuOpen: (isOpen: boolean): StoreIsLeftMenuOpen => ({
    type: AppUiActionTypes.StoreIsLeftMenuOpen,
    isOpen
  })
};
export type AppUiActions = StoreIsLeftMenuOpen;
