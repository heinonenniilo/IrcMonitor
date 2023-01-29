import { Backdrop, CircularProgress, Typography } from "@mui/material";
import React from "react";
import styled from "styled-components";

export interface AppContentWrapperProps {
  title: string;
  children: React.ReactNode;
  isLoading?: boolean;
}

const Container = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  margin-top: 32px;
  flex-grow: 1;
  min-height: calc(100vh - 200px);
  max-width: 1536px;
`;

const OuterContainer = styled.div`
  width: 100%;
  height: 100%;
  flex-grow: 1;
  flex-direction: column;
`;

export const AppContentWrapper: React.FC<AppContentWrapperProps> = (props) => {
  return (
    <>
      <Backdrop
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={props.isLoading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
      <OuterContainer>
        <Typography variant="h2">{props.title}</Typography>
        <Container>{props.children}</Container>
      </OuterContainer>
    </>
  );
};
