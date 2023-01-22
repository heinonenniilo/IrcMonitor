import { AppState } from "./../setup/appRootReducer";
import { UserActions, UserActionTypes } from "actions/userActions";
import produce from "immer";

export interface User {
  firstName: string;
  lastName: string;
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
    case UserActionTypes.StoreGoogleAuthInfo:
      state = produce(state, (draft) => {
        draft.user = {
          firstName: action.loginInfo.profileObj.givenName,
          lastName: action.loginInfo.profileObj.familyName,
          authenticationProvider: "google",
          googleTokenInfo: {
            accessToken: action.loginInfo.accessToken
          },
          loggedIn: false
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
  }
  return state;
}

export const getUserInfo = (state: AppState): User | undefined => state.user.user;

/*
export const getAuthSettings = (state: AppState): AuthSettings | undefined =>
  state.user.authSettings;
*/
