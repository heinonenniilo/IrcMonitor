import { AppContentWrapper } from "framework/AppContentWrapper";
import React from "react";
import { useSelector } from "react-redux";
import { getUserInfo } from "reducers/userReducer";

export const HomeView: React.FC = () => {
  const user = useSelector(getUserInfo);
  return (
    <AppContentWrapper title="Home">
      {user && user.loggedIn && user.roles?.length > 0 ? (
        <p>See various IRC statistics in this page</p>
      ) : (
        <>{user ? <p>You need to ask for access</p> : <p>Please, login</p>}</>
      )}
    </AppContentWrapper>
  );
};
