import { getApiAccessToken } from "./../reducers/userReducer";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { IrcApi } from "./../api/apis/IrcApi";
import { Configuration } from "api/runtime";
import { AuthApi } from "api";

interface UseApiHook {
  ircApi: IrcApi | undefined;
  authApi: AuthApi | undefined;
}

export const useApiHook = (): UseApiHook => {
  const [ircApi, setIrcApi] = useState<IrcApi | undefined>(undefined);
  const [authApi, setAuthApi] = useState<AuthApi | undefined>(undefined);

  const accessToken = useSelector(getApiAccessToken);

  useEffect(() => {
    if (accessToken) {
      setIrcApi(
        new IrcApi(
          new Configuration({
            apiKey: `Bearer ${accessToken}`,
            basePath: process.env!.NODE_ENV === "production" ? "" : null
          })
        )
      );
    } else {
      setIrcApi(undefined);
    }
  }, [accessToken]);

  useEffect(() => {
    setAuthApi(
      new AuthApi(
        new Configuration({ basePath: process.env!.NODE_ENV === "production" ? "" : null })
      )
    );
  }, []);

  return {
    ircApi: ircApi,
    authApi: authApi
  };
};
