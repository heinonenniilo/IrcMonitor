import moment from "moment";
import jwt_decode from "jwt-decode";
import { tokenRefetchLimitInMinutes } from "framework/App";

export const tokenIsExpiring = (tokenString: string) => {
  try {
    if (tokenString) {
      const token = jwt_decode(tokenString) as any;
      const momentDate = moment.unix(token.exp);
      const cur = moment();
      var duration = moment.duration(momentDate.diff(cur)).asMinutes();

      console.log(duration);
      return duration < tokenRefetchLimitInMinutes;
    }
  } catch (ex) {
    return false;
  }
};
