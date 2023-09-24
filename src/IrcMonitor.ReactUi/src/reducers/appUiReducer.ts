import { StoreIsLeftMenuOpen } from "actions/appUiActions";
import produce from "immer";
import { AppState } from "setup/appRootReducer";

export interface AppUiState {
  isLeftMenuOpen: boolean;
}

const defaultState: AppUiState = {
  isLeftMenuOpen: false
};

export function appUiReducer(
  state: AppUiState = defaultState,
  action: StoreIsLeftMenuOpen
): AppUiState {
  if (action.isOpen) {
    state = produce(state, (draft) => {
      draft.isLeftMenuOpen = action.isOpen;
    });
  }
  return state;
}

export const getIsLeftMenuOpen = (state: AppState): boolean => state.appUi.isLeftMenuOpen;
