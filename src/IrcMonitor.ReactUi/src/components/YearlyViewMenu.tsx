import { Box, FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import React from "react";
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
        </Box>
      ) : null}
    </>
  );
};
