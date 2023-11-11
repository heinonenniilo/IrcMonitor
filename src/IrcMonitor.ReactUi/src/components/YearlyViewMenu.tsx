import { Box, FormControl, InputLabel, MenuItem, Select, Tooltip } from "@mui/material";
import React, { useState } from "react";
import { getFormattedNumber } from "utilities/numberFormatterUtils";

export interface NickWithCount {
  nick: string;
  count: number;
}

export interface YearlyViewMenuProps {
  years?: number[];
  nicks?: NickWithCount[];

  selectedYear?: number;
  selectedNicks?: string[];
  onChangeYear?: (year: number) => void;
  onChangeNick?: (nick: string, select: boolean) => void;
}

export const YearlyViewMenu: React.FC<YearlyViewMenuProps> = ({
  years,
  nicks,
  selectedYear,
  selectedNicks,
  onChangeYear,
  onChangeNick
}) => {
  const [isNickMenuOpen, setIsNickMenuOpen] = useState(false);
  return (
    <>
      {years && years.length > 0 ? (
        <FormControl fullWidth>
          <InputLabel id="year-select-label">Year</InputLabel>
          <Select
            labelId="year-select-label"
            id="year-select"
            value={selectedYear ?? 2022}
            label="Year"
          >
            {years.map((y) => (
              <MenuItem
                value={y}
                key={`year-${y}`}
                onClick={() => {
                  onChangeYear && onChangeYear(y);
                }}
              >
                {y}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      ) : null}

      {nicks && nicks.length > 0 ? (
        <Box sx={{ mt: 4 }}>
          <Tooltip
            title={
              !isNickMenuOpen && selectedNicks.length > 0 ? selectedNicks?.join(", ") : undefined
            }
          >
            <FormControl fullWidth>
              <InputLabel id="nick-select-label">Nick</InputLabel>
              <Select
                labelId="nick-select-label"
                onOpen={() => {
                  console.log("open");
                  setIsNickMenuOpen(true);
                }}
                onClose={() => {
                  setIsNickMenuOpen(false);
                  console.log("Close");
                }}
                id="nick-select"
                value={selectedNicks}
                label="Nick"
                renderValue={(d) => {
                  return d.join(",");
                }}
                multiple
              >
                {nicks.map((row) => (
                  <MenuItem
                    value={row.nick}
                    key={`nick-${row.nick}`}
                    onClick={() => {
                      if (onChangeNick) {
                        const isInSelection = selectedNicks.some((s) => s === row.nick);
                        onChangeNick(row.nick, !isInSelection);
                      }
                    }}
                  >
                    {`${row.nick} (${getFormattedNumber(row.count)})`}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Tooltip>
        </Box>
      ) : null}
    </>
  );
};
