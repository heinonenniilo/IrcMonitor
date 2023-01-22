import { userReducer, UserState } from "reducers/userReducer";
import { combineReducers } from "redux";

export interface AppState {
  user: UserState;
}

export const appRootReducer = combineReducers({
  user: userReducer
});
