import { Box, Drawer, Typography } from "@mui/material";
import React, { useEffect, useRef, useState } from "react";

export interface LeftMenuProps {
  title: string;
  children: JSX.Element;
  setMenuWidth?: (width: number) => void;
}

export const LeftMenu: React.FC<LeftMenuProps> = ({ title, children, setMenuWidth }) => {
  const ref = useRef<HTMLElement | undefined | null>(null);

  const [menuWidth, setWidth] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (ref?.current.offsetWidth) {
      setWidth(ref?.current.offsetWidth);
    }
  }, []);

  useEffect(() => {
    setMenuWidth(menuWidth);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [menuWidth]);

  return (
    <Drawer anchor="left" open={true} variant="persistent">
      <Box sx={{ mt: 10, pr: 1, pl: 1, minWidth: "100px" }} ref={ref}>
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
