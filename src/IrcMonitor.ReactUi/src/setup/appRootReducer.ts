import { appUiReducer, AppUiState } from "reducers/appUiReducer";
import { ircReducer, IrcState } from "reducers/ircReducer";
import { userReducer, UserState } from "reducers/userReducer";
import { combineReducers } from "redux";

export interface AppState {
  user: UserState;
  appUi: AppUiState;
  irc: IrcState;
}

export const appRootReducer = combineReducers({
  user: userReducer,
  appUi: appUiReducer,
  irc: ircReducer
});
