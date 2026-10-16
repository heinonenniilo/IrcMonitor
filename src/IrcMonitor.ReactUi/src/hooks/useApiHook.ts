import { getApiAccessToken, getUserVm } from "./../reducers/userReducer";
import { useDispatch, useSelector } from "react-redux";
import { useCallback, useEffect, useState } from "react";
import { IrcApi } from "./../api/apis/IrcApi";
import { Configuration, FetchParams, RequestContext } from "api/runtime";
import { AuthApi, ManagementApi } from "api";
import { getTokenExpirationInformation } from "utilities/tokenUtils";
import { userActions } from "actions/userActions";

interface UseApiHook {
  ircApi: IrcApi | undefined;
  authApi: AuthApi | undefined;
  managementApi: ManagementApi | undefined;
}

const isProduction = import.meta.env.PROD;
const authApi = new AuthApi(
  new Configuration({
    basePath: isProduction ? "" : null,
    credentials: isProduction ? "same-origin" : "include"
  })
);

export const useApiHook = (): UseApiHook => {
  const [ircApi, setIrcApi] = useState<IrcApi | undefined>(undefined);
  const [managementApi, setManagementApi] = useState<ManagementApi | undefined>(undefined);

  const [isRefreshingToken, setIsRefreshingToken] = useState(false);
  const userVm = useSelector(getUserVm);
  const dispatch = useDispatch();

  const accessToken = useSelector(getApiAccessToken);

  const preRequestHandler = useCallback(
    async (context: RequestContext): Promise<FetchParams | void> => {
      let curToken = context.init.headers["Authorization"] as string;
      curToken = curToken.replace("Bearer", "").trim();

      const tokenExpireInfo = getTokenExpirationInformation(curToken);
      if (tokenExpireInfo.isExpiring) {
        setIsRefreshingToken(true);
      }

      if (tokenExpireInfo.hasExpired) {
        const controller = new AbortController();
        controller.abort();
        return {
          init: { ...context.init, signal: controller.signal },
          url: context.url
        };
      }

      return {
        init: context.init,
        url: context.url
      };
    },
    []
  );

  useEffect(() => {
    if (isRefreshingToken && userVm?.email) {
      const controller = new AbortController();
      dispatch(userActions.setIsLoggingIn(true));
      authApi
        .authGoogleRefresh({
          handleGoogleRefreshTokenCommand: {
            email: userVm.email
          }
        }, { signal: controller.signal })
        .then((res) => {
          if (controller.signal.aborted) return;
          dispatch(userActions.storeUserInfo(res));
        })
        .catch((err) => {
          if (controller.signal.aborted) return;
          console.error(err);
          dispatch(userActions.setIsReLoggingIn(true));
        })
        .finally(() => {
          if (controller.signal.aborted) return;
          dispatch(userActions.setIsLoggingIn(false));
          setIsRefreshingToken(false);
        });
      return () => controller.abort();
    }
  }, [isRefreshingToken, userVm?.email, dispatch]);

  useEffect(() => {
    if (accessToken) {
      const tokenExpireInfo = getTokenExpirationInformation(accessToken);
      if (tokenExpireInfo.isExpiring) {
        setIrcApi(undefined);
        setManagementApi(undefined);
        setIsRefreshingToken(true);
      } else {
        const configuration = new Configuration({
          apiKey: `Bearer ${accessToken}`,
          basePath: isProduction ? "" : null,
          middleware: [{ pre: preRequestHandler }],
          credentials: isProduction ? "same-origin" : "include"
        });
        setIrcApi(new IrcApi(configuration));
        setManagementApi(new ManagementApi(configuration));
      }
    } else {
      setIrcApi(undefined);
      setManagementApi(undefined);
      setIsRefreshingToken(false);
    }
  }, [accessToken, preRequestHandler]);

  return {
    ircApi: ircApi,
    authApi: authApi,
    managementApi: managementApi
  };
};
