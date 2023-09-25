import { Backdrop, Box, CircularProgress, Container, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getIsLoadingChannels, getIsLoggingIn } from "reducers/userReducer";
import styled from "styled-components";
import { LeftMenu } from "./LeftMenu";
import { getHasLeftMenu, getLeftMenuIsOpen } from "reducers/appUiReducer";
import { appUiActions } from "actions/appUiActions";
import { Link } from "react-router-dom";
import { uiConfig } from "constants/conts";

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

const PageContent = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  margin-top: 16px;
  flex-grow: 1;
  max-width: 100%;
  min-height: ${uiConfig.pageContentMinHeight}; // TODO CHECK
`;

export const AppContentWrapper: React.FC<AppContentWrapperProps> = (props) => {
  const isLoggingIn = useSelector(getIsLoggingIn);
  const isLoadingChannels = useSelector(getIsLoadingChannels);
  const hasLeftMenu = useSelector(getHasLeftMenu);
  const leftMenuIsOpen = useSelector(getLeftMenuIsOpen);
  const [menuWidth, setMenuWidth] = useState<number | undefined>(undefined);

  const dispatch = useDispatch();

  useEffect(() => {
    if (props.leftMenu) {
      if (!hasLeftMenu && props.leftMenu) {
        dispatch(appUiActions.storeHasLeftMenu(true));
      }
    } else {
      if (!props.leftMenu && hasLeftMenu) {
        dispatch(appUiActions.storeHasLeftMenu(false));
      }
    }
  }, [props.leftMenu, dispatch, hasLeftMenu]);

  const handleMenuClose = () => {
    dispatch(appUiActions.toggleLeftMenu(false));
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
          flexGrow: 1,
          flexDirection: "column",
          minHeight: "calc(100vh - 100px)", // TODO Could be made dynamic
          marginLeft: hasLeftMenu && leftMenuIsOpen ? `${menuWidth}px` : "0px",
          display: "flex",
          paddingLeft: 1,
          paddingRight: 1
        }}
      >
        <Container maxWidth="xl" sx={{ display: "flex", flexDirection: "column", flexGrow: 1 }}>
          {drawTitle()}
          <LeftMenu
            title="filters"
            setMenuWidth={(width: number) => {
              if (width) {
                console.log(width);
                setMenuWidth(width);
              }
            }}
            isOpen={props.leftMenu !== undefined && leftMenuIsOpen}
            onClose={handleMenuClose}
          >
            {props.leftMenu}
          </LeftMenu>
          <PageContent>{props.children}</PageContent>
        </Container>
      </Box>
    </>
  );
};
