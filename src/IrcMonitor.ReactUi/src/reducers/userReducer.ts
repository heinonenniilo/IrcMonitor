import { IrcChannelDto } from "./../api/models/IrcChannelDto";
import { AppState } from "./../setup/appRootReducer";
import { UserActions, UserActionTypes } from "actions/userActions";
import produce from "immer";

export interface User {
  email: string;
  authenticationProvider: string;
  loggedIn: boolean;
  roles: string[];
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
  googleTokenInfo?: GoogleTokenInfo;
  channels: IrcChannelDto[];
  selectedChannel: string | undefined;
}

const defaultState: UserState = {
  logInInitiated: false,
  user: undefined,
  channels: [],
  selectedChannel: undefined
};

export function userReducer(state: UserState = defaultState, action: UserActions): UserState {
  switch (action.type) {
    case UserActionTypes.StoreUserInfo:
      state = produce(state, (draft) => {
        draft.user = {
          email: action.userInfo.email,
          authenticationProvider: "google",
          loggedIn: true,
          roles: action.userInfo.roles
        };
        draft.apiTokenInfo = {
          accessToken: action.userInfo.accessToken
        };
        draft.logInInitiated = true;
      });
      break;
    case UserActionTypes.StoreGoogleAccessToken:
      state = produce(state, (draft) => {
        draft.googleTokenInfo = {
          accessToken: action.googleAccessToken
        };
      });
      break;
    case UserActionTypes.StoreApiAccessToken:
      state = produce(state, (draft) => {
        draft.apiTokenInfo = { accessToken: action.apiAccessToken };
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
        draft.googleTokenInfo = undefined;
      });
      break;
    case UserActionTypes.StoreUserChannels:
      state = produce(state, (draft) => {
        draft.channels = action.channels;
      });
      break;
    case UserActionTypes.SelectChannel:
      state = produce(state, (draft) => {
        draft.selectedChannel = action.channelId;
      });
      break;
  }
  return state;
}

export const getUserInfo = (state: AppState): User | undefined => state.user.user;

export const getApiAccessToken = (state: AppState): string | undefined =>
  state.user.apiTokenInfo?.accessToken;

export const getGoogleAccessToken = (state: AppState): string | undefined =>
  state.user.googleTokenInfo?.accessToken;

export const getChannels = (state: AppState): IrcChannelDto[] => state.user.channels;

export const getSelectecChannel = (state: AppState): string | undefined =>
  state.user.selectedChannel;
