import ExpandMore from "@mui/icons-material/ExpandMore";
import { Menu, MenuItem } from "@mui/material";
import React, { useState } from "react";
import { routes } from "utilities/routes";

export const ManageMenu: React.FC<{ onNavigate: (route: string) => void }> = ({ onNavigate }) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  return (
    <>
      <MenuItem
        aria-haspopup="menu"
        aria-expanded={Boolean(anchorEl)}
        onClick={(event) => setAnchorEl(event.currentTarget)}
      >
        Manage <ExpandMore fontSize="small" sx={{ ml: 1 }} />
      </MenuItem>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        MenuListProps={{ "aria-label": "Manage" }}
      >
        <MenuItem onClick={() => {
          setAnchorEl(null);
          onNavigate(routes.processedLogFiles);
        }}>
          Processed log files
        </MenuItem>
      </Menu>
    </>
  );
};
