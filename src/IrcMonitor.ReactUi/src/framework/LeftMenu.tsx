import { Box, Drawer, Typography } from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

export interface LeftMenuProps {
  title: string;
  children: JSX.Element;
  isOpen: boolean;
  setMenuWidth?: (width: number) => void;
  onClose: () => void;
}

export const LeftMenu: React.FC<LeftMenuProps> = ({
  title,
  children,
  setMenuWidth,
  isOpen,
  onClose
}) => {
  const ref = useRef<HTMLDivElement | null>(null);

  const [menuWidth, setWidth] = useState<number | undefined>(undefined);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const updateWidth = () => setWidth(element.offsetWidth);
    updateWidth();
    const observer = new ResizeObserver(updateWidth);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (menuWidth !== undefined) setMenuWidth?.(menuWidth);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [menuWidth]);

  return (
    <Drawer anchor="left" open={isOpen} variant="persistent">
      <Box
        sx={{
          mt: 10,
          pr: 1,
          pl: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          height: "100%",
          width: "max-content",
          minWidth: "260px",
          maxWidth: "calc(100vw - 32px)",
          boxSizing: "border-box"
        }}
        ref={ref}
      >
        <Box>
          <Box sx={{ mb: 2 }}>
            <Typography variant="button" display="block" gutterBottom>
              {title}
            </Typography>
          </Box>
          {children}
        </Box>
        <Box sx={{ cursor: "pointer", mb: 2 }} onClick={onClose}>
          <ArrowBackIcon />
        </Box>
      </Box>
    </Drawer>
  );
};
