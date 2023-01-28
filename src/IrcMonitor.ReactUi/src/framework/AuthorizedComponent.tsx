import { RoleNames } from "enums/RoleEnums";
import React from "react";
import { useSelector } from "react-redux";
import { getUserInfo } from "reducers/userReducer";

export interface AuthorizedComponentProps {
  requiredRole: RoleNames;
  children: React.ReactNode;
}

export const AuthorizedComponent: React.FunctionComponent<AuthorizedComponentProps> = ({
  requiredRole,
  children
}) => {
  const user = useSelector(getUserInfo);

  const isAdmin = user?.roles.some((r) => r === RoleNames.Admin);

  if (isAdmin || user?.roles.some((r) => r === requiredRole)) {
    return <>{children}</>;
  } else {
    return <></>;
  }
};
