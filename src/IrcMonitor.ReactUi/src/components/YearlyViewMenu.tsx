import { Box, FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import React from "react";

export interface NickWithCount {
  nick: string;
  count: number;
}

export interface YearlyViewMenuProps {
  years?: number[];
  nicks?: NickWithCount[];

  selectedYear?: number;
  selectedNick?: string;
  onChangeYear?: (year: number) => void;
  onChangeNick?: (nick: string) => void;
}

export const YearlyViewMenu: React.FC<YearlyViewMenuProps> = ({
  years,
  nicks,
  selectedYear,
  selectedNick,
  onChangeYear,
  onChangeNick
}) => {
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
          <FormControl fullWidth>
            <InputLabel id="nick-select-label">Nick</InputLabel>
            <Select
              labelId="nick-select-label"
              id="nick-select"
              value={selectedNick}
              label="Nick"
              renderValue={(d) => {
                return d;
              }}
            >
              {nicks.map((row) => (
                <MenuItem
                  value={row.nick}
                  key={`nick-${row.nick}`}
                  onClick={() => {
                    onChangeNick && onChangeNick(row.nick);
                  }}
                >
                  {`${row.nick} (${row.count})`}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      ) : null}
    </>
  );
};
