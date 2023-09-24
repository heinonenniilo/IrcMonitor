import { appUiReducer, AppUiState } from "reducers/appUiReducer";
import { userReducer, UserState } from "reducers/userReducer";
import { combineReducers } from "redux";

export interface AppState {
  user: UserState;
  appUi: AppUiState;
}

export const appRootReducer = combineReducers({
  user: userReducer,
  appUi: appUiReducer
});
