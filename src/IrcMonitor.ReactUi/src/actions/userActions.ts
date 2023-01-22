import { GoogleLoginResponse } from "react-google-login";
import { Action } from "redux";

export enum UserActionTypes {
  StoreGoogleAuthInfo = "User/StoreGoogleAuthInfo",
  StoreAccessToken = "User/StoreAccessToken"
}

export interface StoreGoogleAuthInfo extends Action {
  type: UserActionTypes.StoreGoogleAuthInfo;
  loginInfo: GoogleLoginResponse;
}

export interface StoreAccessToken extends Action {
  type: UserActionTypes.StoreAccessToken;
  accessToken: string;
}

export const userActions = {
  storeGoogleAuthInfo: (loginInfo: GoogleLoginResponse): StoreGoogleAuthInfo => ({
    type: UserActionTypes.StoreGoogleAuthInfo,
    loginInfo: loginInfo
  }),
  storeAccessToken: (token: string): StoreAccessToken => ({
    type: UserActionTypes.StoreAccessToken,
    accessToken: token
  })
};

export type UserActions = StoreGoogleAuthInfo | StoreAccessToken;
