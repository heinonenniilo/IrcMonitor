import { Backdrop, Box, CircularProgress, Typography, useMediaQuery } from "@mui/material";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getIsLoadingChannels, getIsLoggingIn } from "reducers/userReducer";
import styled from "styled-components";
import { LeftMenu } from "./LeftMenu";
import { getIsLeftMenuOpen } from "reducers/appUiReducer";
import { appUiActions } from "actions/appUiActions";
import { centeringLimitPx, leftMenuWidth } from "./App";
import { Link } from "react-router-dom";

export interface TitlePart {
  text: string;
  to?: string;
}

export interface AppContentWrapperProps {
  children: React.ReactNode;
  isLoading?: boolean;
  leftMenu?: JSX.Element;
  titleParts: TitlePart[];
}

const Container = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  margin-top: 16px;
  flex-grow: 1;
  min-height: calc(100vh - 230px);
  max-width: 100%;
`;

export const AppContentWrapper: React.FC<AppContentWrapperProps> = (props) => {
  const isLoggingIn = useSelector(getIsLoggingIn);
  const isLoadingChannels = useSelector(getIsLoadingChannels);
  const isLeftMenuOpen = useSelector(getIsLeftMenuOpen);

  const isLarge = useMediaQuery(`(min-width:${centeringLimitPx})`);
  const dispatch = useDispatch();
  useEffect(() => {
    if (props.leftMenu) {
      if (!isLeftMenuOpen && props.leftMenu !== undefined) {
        dispatch(appUiActions.storeIsLeftMenuOpen(true));
      } else if (isLeftMenuOpen && props.leftMenu === undefined) {
        dispatch(appUiActions.storeIsLeftMenuOpen(false));
      }
    }
  }, [props.leftMenu, dispatch, isLeftMenuOpen]);

  const shouldHaveMarginForContent = () => {
    return !isLarge && isLeftMenuOpen;
  };

  const drawTitle = () => {
    const count = props.titleParts.length;

    const shouldUseSmallTitle = props.titleParts.length > 1 && props.titleParts.some((t) => t.to);
    return (
      <Typography variant={shouldUseSmallTitle ? "h6" : "h5"}>
        {props.titleParts.map((r, idx) => {
          let el: JSX.Element;
          if (r.to) {
            el = (
              <Link key={`title_${idx}`} to={r.to}>
                {r.text}
              </Link>
            );
          } else {
            el = <>{r.text}</>;
          }

          if (idx < count - 1) {
            return (
              <span key={`el_${idx}`}>
                {el}
                {">"}
              </span>
            );
          } else {
            return <span key={`el_${idx}`}>{el}</span>;
          }
        })}
      </Typography>
    );
  };
  return (
    <>
      <Backdrop
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={props.isLoading || isLoggingIn || isLoadingChannels}
      >
        <CircularProgress color="inherit" />
      </Backdrop>

      <Box
        sx={{
          width: "100%",
          height: "100%",
          maxWidth: shouldHaveMarginForContent() ? `calc(100% - ${leftMenuWidth})` : "100%",
          flexGrow: 1,
          flexDirection: "column",
          marginLeft: shouldHaveMarginForContent() ? leftMenuWidth : 0
        }}
      >
        {drawTitle()}
        {props.leftMenu ? <LeftMenu title="filters">{props.leftMenu}</LeftMenu> : null}
        <Container>{props.children}</Container>
      </Box>
    </>
  );
};
