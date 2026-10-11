import { Box, ButtonBase, useTheme } from "@mui/material";
import React from "react";
import icon from "assets/icon.svg";
import lightLogo from "assets/logo-light.svg";
import darkLogo from "assets/logo-dark.svg";

export const HeaderBrand: React.FC<{ onClick: () => void; compact?: boolean }> = ({ onClick, compact }) => {
  const theme = useTheme();
  return (
    <ButtonBase onClick={onClick} aria-label="IRC Monitor home" sx={{ flexShrink: 0, mr: compact ? 1 : 2, borderRadius: 1 }}>
      <Box component="img" src={compact ? icon : theme.palette.mode === "dark" ? darkLogo : lightLogo}
        alt="IRC Monitor" sx={{ width: compact ? 40 : 190, height: 44, objectFit: "contain" }} />
    </ButtonBase>
  );
};
