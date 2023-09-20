import moment from "moment";
import jwt_decode from "jwt-decode";

const tokenRefetchLimitInMinutes = 5;

export interface TokenExpireInformation {
  isExpiring: boolean;
  hasExpired: boolean;
}

export const getTokenExpirationInformation = (tokenString: string): TokenExpireInformation => {
  try {
    if (tokenString) {
      const token = jwt_decode(tokenString) as any;
      const momentDate = moment.unix(token.exp);
      const cur = moment();
      var duration = moment.duration(momentDate.diff(cur)).asMinutes();

      return {
        isExpiring: duration < tokenRefetchLimitInMinutes,
        hasExpired: duration < 0
      };
    }
  } catch (ex) {
    return {
      isExpiring: false,
      hasExpired: false
    };
  }
};
