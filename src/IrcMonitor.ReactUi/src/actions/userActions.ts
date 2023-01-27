import { IrcChannelDto } from "./../api/models/IrcChannelDto";
import { UserVm } from "api";
import { Action } from "redux";

export enum UserActionTypes {
  StoreUserInfo = "User/StoreUserInfo",
  StoreAccessToken = "User/StoreAccessToken",
  ClearUserInfo = "User/ClearUserInfo",
  StoreUserChannels = "User/StoreUserChannels"
}

export interface StoreGoogleAuthInfo extends Action {
  type: UserActionTypes.StoreUserInfo;
  userInfo: UserVm;
}

export interface StoreAccessToken extends Action {
  type: UserActionTypes.StoreAccessToken;
  accessToken: string;
}

export interface ClearUserInfo extends Action {
  type: UserActionTypes.ClearUserInfo;
}

export interface StoreUserChannels extends Action {
  type: UserActionTypes.StoreUserChannels;
  channels: IrcChannelDto[];
}

export const userActions = {
  storeUserInfo: (userInfo: UserVm): StoreGoogleAuthInfo => ({
    type: UserActionTypes.StoreUserInfo,
    userInfo
  }),
  storeAccessToken: (token: string): StoreAccessToken => ({
    type: UserActionTypes.StoreAccessToken,
    accessToken: token
  }),
  clearUserInfo: (): ClearUserInfo => ({
    type: UserActionTypes.ClearUserInfo
  }),
  storeUserChannels: (channels: IrcChannelDto[]): StoreUserChannels => ({
    type: UserActionTypes.StoreUserChannels,
    channels
  })
};

export type UserActions =
  | StoreGoogleAuthInfo
  | StoreAccessToken
  | ClearUserInfo
  | StoreUserChannels;
