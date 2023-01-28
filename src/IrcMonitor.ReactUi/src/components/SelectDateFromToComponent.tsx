import { Box, Button, TextField } from "@mui/material";
import { DesktopDatePicker } from "@mui/x-date-pickers";
import React, { useEffect, useState } from "react";
import moment from "moment";

export interface SelectDateFromToComponentProps {
  onSearch: (from: Date, to: Date, channelId: string) => void;
  channelId: string | undefined;
}

export const SelectDateFromToComponent: React.FC<SelectDateFromToComponentProps> = ({
  onSearch,
  channelId
}) => {
  const [fromDate, setFromDate] = useState<moment.Moment>(moment().add(-5, "M"));
  const [toDate, setToDate] = useState<moment.Moment>(moment());

  useEffect(() => {
    onSearch(fromDate.toDate(), toDate.toDate(), channelId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channelId]);

  return (
    <Box
      display={"flex"}
      flexDirection={"row"}
      marginBottom={4}
      marginTop={4}
      width={"100%"}
      justifyContent={"space-between"}
    >
      <DesktopDatePicker
        label="From"
        inputFormat="DD.MM.YYYY"
        value={fromDate}
        onChange={(value) => {
          if (value) {
            setFromDate(value as moment.Moment);
          }
        }}
        renderInput={(params) => <TextField {...params} />}
      />

      <DesktopDatePicker
        label="To"
        inputFormat="DD.MM.YYYY"
        value={toDate}
        onChange={(value) => {
          if (value) {
            setToDate(value as moment.Moment);
          }
        }}
        renderInput={(params) => <TextField {...params} />}
      />
      <Button
        variant="outlined"
        onClick={() => {
          onSearch(fromDate.toDate(), toDate.toDate(), channelId);
        }}
      >
        Search
      </Button>
    </Box>
  );
};
