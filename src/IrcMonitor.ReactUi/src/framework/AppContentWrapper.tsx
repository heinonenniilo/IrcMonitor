import { Typography } from "@mui/material";
import React from "react";
import styled from "styled-components";

export interface AppContentWrapperProps {
  title: string;
  children: React.ReactNode;
}

const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
`;

export const AppContentWrapper: React.FC<AppContentWrapperProps> = (props) => {
  return (
    <Container>
      <Typography variant="h2">{props.title}</Typography>
      <Container>{props.children}</Container>
    </Container>
  );
};
