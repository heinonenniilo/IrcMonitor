import { IrcChannelDto } from "./../api/models/IrcChannelDto";
import { UserVm } from "api";
import { Action } from "redux";

export enum UserActionTypes {
  StoreUserInfo = "User/StoreUserInfo",
  StoreApiAccessToken = "User/StoreAccessToken",
  ClearUserInfo = "User/ClearUserInfo",
  StoreUserChannels = "User/StoreUserChannels",
  SelectChannel = "User/SelectChannel",
  StoreGoogleAccessToken = "User/StoreGoogleAccessToken",
  StoreGoogleAuthorizationKey = "User/StoreGoogleAuthorizationKey",
  SetIsLoggingIn = "User/SetIsLoggingIn",
  SetIsReLoggingIn = "User/SetIsReLoggingIn"
}

export interface StoreGoogleAuthInfo extends Action {
  type: UserActionTypes.StoreUserInfo;
  userInfo: UserVm;
}

export interface StoreApiAccessToken extends Action {
  type: UserActionTypes.StoreApiAccessToken;
  apiAccessToken: string;
}

export interface StoreGoogleAccessToken extends Action {
  type: UserActionTypes.StoreGoogleAccessToken;
  googleAccessToken: string;
  triggerLogIn?: boolean;
}

export interface StoreGoogleAuthorizationKey extends Action {
  type: UserActionTypes.StoreGoogleAuthorizationKey;
  authorizationKey: string;
}

export interface ClearUserInfo extends Action {
  type: UserActionTypes.ClearUserInfo;
}

export interface StoreUserChannels extends Action {
  type: UserActionTypes.StoreUserChannels;
  channels: IrcChannelDto[];
}

export interface SelectChannel extends Action {
  type: UserActionTypes.SelectChannel;
  channelId: string | undefined;
}

export interface SetIsUserLoggingIn extends Action {
  type: UserActionTypes.SetIsLoggingIn;
  isLoggingIn: boolean;
}

export interface SetIsReLoggingIn extends Action {
  type: UserActionTypes.SetIsReLoggingIn;
  isReLogging: boolean;
}

export const userActions = {
  storeUserInfo: (userInfo: UserVm): StoreGoogleAuthInfo => ({
    type: UserActionTypes.StoreUserInfo,
    userInfo
  }),
  storeAccessToken: (token: string): StoreApiAccessToken => ({
    type: UserActionTypes.StoreApiAccessToken,
    apiAccessToken: token
  }),
  clearUserInfo: (): ClearUserInfo => ({
    type: UserActionTypes.ClearUserInfo
  }),
  storeUserChannels: (channels: IrcChannelDto[]): StoreUserChannels => ({
    type: UserActionTypes.StoreUserChannels,
    channels
  }),
  selectChannel: (channelId: string | undefined): SelectChannel => ({
    type: UserActionTypes.SelectChannel,
    channelId
  }),
  storeGoogleAccessToken: (
    googleAccessToken: string | undefined,
    triggerLogIn?: boolean
  ): StoreGoogleAccessToken => ({
    type: UserActionTypes.StoreGoogleAccessToken,
    googleAccessToken,
    triggerLogIn
  }),
  storeGoogleAuthorizationKey: (
    authorizationKey: string | undefined
  ): StoreGoogleAuthorizationKey => ({
    type: UserActionTypes.StoreGoogleAuthorizationKey,
    authorizationKey
  }),
  setIsLoggingIn: (isLoggingIn: boolean): SetIsUserLoggingIn => ({
    type: UserActionTypes.SetIsLoggingIn,
    isLoggingIn
  }),
  setIsReLoggingIn: (isReLogging: boolean): SetIsReLoggingIn => ({
    type: UserActionTypes.SetIsReLoggingIn,
    isReLogging
  })
};

export type UserActions =
  | StoreGoogleAuthInfo
  | StoreApiAccessToken
  | ClearUserInfo
  | StoreUserChannels
  | SelectChannel
  | StoreGoogleAccessToken
  | SetIsUserLoggingIn
  | SetIsReLoggingIn;
