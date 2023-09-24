import { Box, Drawer, Typography } from "@mui/material";
import React from "react";

export interface LeftMenuProps {
  title: string;
  children: JSX.Element;
}

export const LeftMenu: React.FC<LeftMenuProps> = ({ title, children }) => {
  return (
    <Drawer anchor="left" open={true} variant="permanent">
      <Box sx={{ mt: 10, pr: 1, pl: 1, minWidth: "100px" }}>
        <Box sx={{ mb: 2 }}>
          <Typography variant="button" display="block" gutterBottom>
            {title}
          </Typography>
        </Box>
        {children}
      </Box>
    </Drawer>
  );
};
