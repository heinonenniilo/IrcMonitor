import { getAccessToken } from "./../reducers/userReducer";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { IrcApi } from "./../api/apis/IrcApi";
import { Configuration } from "api/runtime";

interface UseApiHook {
  ircApi: IrcApi | undefined;
}

export const useApiHook = (): UseApiHook => {
  const [ircApi, setIrcApi] = useState<IrcApi | undefined>(undefined);

  const accessToken = useSelector(getAccessToken);

  useEffect(() => {
    if (accessToken) {
      setIrcApi(new IrcApi(new Configuration({ apiKey: `Bearer ${accessToken}` })));
    } else {
      setIrcApi(undefined);
    }
  }, [accessToken]);

  return {
    ircApi: ircApi
  };
};
