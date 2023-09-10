import { getApiAccessToken, getUserVm } from "./../reducers/userReducer";
import { useDispatch, useSelector } from "react-redux";
import { useCallback, useEffect, useState } from "react";
import { IrcApi } from "./../api/apis/IrcApi";
import { Configuration, FetchParams, RequestContext } from "api/runtime";
import { AuthApi } from "api";
import { tokenIsExpiring } from "utilities/tokenUtils";
import { userActions } from "actions/userActions";

interface UseApiHook {
  ircApi: IrcApi | undefined;
  authApi: AuthApi | undefined;
}

const authApi = new AuthApi(
  new Configuration({ basePath: process.env!.NODE_ENV === "production" ? "" : null })
);

export const useApiHook = (): UseApiHook => {
  const [ircApi, setIrcApi] = useState<IrcApi | undefined>(undefined);

  const [isRefreshingToken, setIsRefreshingToken] = useState(false);
  const userVm = useSelector(getUserVm);
  const dispatch = useDispatch();

  const accessToken = useSelector(getApiAccessToken);

  const preRequestHandler = useCallback(
    async (context: RequestContext): Promise<FetchParams | void> => {
      let curToken = context.init.headers["Authorization"] as string;
      curToken = curToken.replace("Bearer", "").trim();

      if (curToken && tokenIsExpiring(curToken)) {
        setIsRefreshingToken(true);
      }
      return {
        init: context.init,
        url: context.url
      };
    },
    []
  );

  useEffect(() => {
    if (isRefreshingToken) {
      if (userVm?.googleRefreshToken) {
        dispatch(userActions.setIsLoggingIn(true));
        authApi
          .authGoogleAuthCode({
            handleGoogleAuthorizationCodeCommand: {
              authorizationCode: userVm.googleRefreshToken,
              isRefresh: true
            }
          })
          .then((res) => {
            dispatch(userActions.storeUserInfo(res));
          })
          .catch((err) => {
            dispatch(userActions.setIsReLoggingIn(true));
          })
          .finally(() => {
            dispatch(userActions.setIsLoggingIn(false));
            setIsRefreshingToken(false);
          });
      } else {
        dispatch(userActions.setIsReLoggingIn(true));
      }
    }
  }, [isRefreshingToken, userVm?.googleRefreshToken, dispatch]);

  useEffect(() => {
    if (accessToken) {
      setIrcApi(
        new IrcApi(
          new Configuration({
            apiKey: `Bearer ${accessToken}`,
            basePath: process.env!.NODE_ENV === "production" ? "" : null,
            middleware: [{ pre: preRequestHandler }]
          })
        )
      );
    } else {
      setIrcApi(undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken]);

  return {
    ircApi: ircApi,
    authApi: authApi
  };
};
