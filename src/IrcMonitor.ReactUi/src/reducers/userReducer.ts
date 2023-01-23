import { AppState } from "./../setup/appRootReducer";
import { UserActions, UserActionTypes } from "actions/userActions";
import produce from "immer";

export interface User {
  email: string;
  authenticationProvider: string;
  loggedIn: boolean;
  googleTokenInfo?: GoogleTokenInfo;
}

export interface GoogleTokenInfo {
  accessToken: string;
}

export interface ApiTokenInfo {
  accessToken: string;
}

export interface UserState {
  user: User | undefined;
  logInInitiated: boolean;
  apiTokenInfo?: ApiTokenInfo;
}

const defaultState: UserState = {
  logInInitiated: false,
  user: undefined
};

export function userReducer(state: UserState = defaultState, action: UserActions): UserState {
  switch (action.type) {
    case UserActionTypes.StoreUserInfo:
      state = produce(state, (draft) => {
        draft.user = {
          email: action.userInfo.email,
          authenticationProvider: "google",
          loggedIn: true
        };
        draft.apiTokenInfo = {
          accessToken: action.userInfo.accessToken
        };
        draft.logInInitiated = true;
      });
      break;
    case UserActionTypes.StoreAccessToken:
      state = produce(state, (draft) => {
        draft.apiTokenInfo = { accessToken: action.accessToken };
        if (draft.user) {
          draft.user.loggedIn = true;
        }
      });
      break;
    case UserActionTypes.ClearUserInfo:
      state = produce(state, (draft) => {
        draft.user = undefined;
        draft.logInInitiated = false;
        draft.apiTokenInfo = undefined;
      });
      break;
  }
  return state;
}

export const getUserInfo = (state: AppState): User | undefined => state.user.user;
