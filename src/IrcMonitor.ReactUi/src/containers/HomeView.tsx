import { AppContentWrapper } from "framework/AppContentWrapper";
import React from "react";
import { useSelector } from "react-redux";
import { getUserInfo } from "reducers/userReducer";

export const HomeView: React.FC = () => {
  const user = useSelector(getUserInfo);
  return (
    <AppContentWrapper title="Home">
      <p>See various IRC statistics in this page</p>

      {user && user.loggedIn ? null : <p>Please, log in</p>}
    </AppContentWrapper>
  );
};
