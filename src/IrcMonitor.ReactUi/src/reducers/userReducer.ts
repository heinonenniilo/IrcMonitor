import { UserVm } from "api/models/UserVm";
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

export interface ApiTokenInfo {
  accessToken: string;
}

export interface UserState {
  user: User | undefined;
  apiTokenInfo?: ApiTokenInfo;
  channels: IrcChannelDto[];
  selectedChannel: string | undefined;
  isLoggingIn: boolean;
  userVm: UserVm | undefined;
  isReLogIn: boolean;
}

const defaultState: UserState = {
  user: undefined,
  channels: [],
  selectedChannel: undefined,
  isLoggingIn: false,
  userVm: undefined,
  isReLogIn: false
};

export function userReducer(state: UserState = defaultState, action: UserActions): UserState {
  switch (action.type) {
    case UserActionTypes.StoreUserInfo:
      state = produce(state, (draft) => {
        draft.userVm = action.userInfo;
        draft.user = {
          email: action.userInfo.email,
          authenticationProvider: "google",
          loggedIn: true,
          roles: action.userInfo.roles
        };
        draft.apiTokenInfo = {
          accessToken: action.userInfo.accessToken
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
        draft.apiTokenInfo = undefined;
        draft.userVm = undefined;
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
    case UserActionTypes.SetIsLoggingIn:
      state = produce(state, (draft) => {
        draft.isLoggingIn = action.isLoggingIn;
      });
      break;
    case UserActionTypes.SetIsReLoggingIn:
      state = produce(state, (draft) => {
        draft.isReLogIn = action.isReLogging;
      });
      break;
  }
  return state;
}

export const getUserInfo = (state: AppState): User | undefined => state.user.user;

export const getApiAccessToken = (state: AppState): string | undefined =>
  state.user.apiTokenInfo?.accessToken;

export const getChannels = (state: AppState): IrcChannelDto[] => state.user.channels;

export const getSelectecChannel = (state: AppState): string | undefined =>
  state.user.selectedChannel;

export const getIsLoggingIn = (state: AppState): boolean => state.user.isLoggingIn;

export const getUserVm = (state: AppState): UserVm | undefined => state.user.userVm;

export const getIsReLogging = (state: AppState): boolean => state.user.isReLogIn;
