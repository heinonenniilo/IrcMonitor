import { Typography } from "@mui/material";
import React from "react";
import styled from "styled-components";

export interface AppContentWrapperProps {
  title: string;
  children: React.ReactNode;
}

const Container = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  min-height: calc(100vh - 200px);
`;

const OuterContainer = styled.div`
  width: 100%;
  height: 100%;
  flex-grow: 1;
  flex-direction: column;
`;

export const AppContentWrapper: React.FC<AppContentWrapperProps> = (props) => {
  return (
    <OuterContainer>
      <Typography variant="h2">{props.title}</Typography>
      <Container>{props.children}</Container>
    </OuterContainer>
  );
};
