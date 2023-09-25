import { AppUiActionTypes, AppUiActions } from "actions/appUiActions";
import produce from "immer";
import { AppState } from "setup/appRootReducer";

export interface AppUiState {
  hasLeftMenu: boolean;
  leftMenuIsOpen: boolean;
}

const defaultState: AppUiState = {
  hasLeftMenu: false,
  leftMenuIsOpen: false
};

export function appUiReducer(state: AppUiState = defaultState, action: AppUiActions): AppUiState {
  switch (action.type) {
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
