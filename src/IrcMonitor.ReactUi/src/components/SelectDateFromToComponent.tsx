import { Box, Button, TextField } from "@mui/material";
import { DesktopDatePicker } from "@mui/x-date-pickers";
import React, { useEffect, useState } from "react";
import moment from "moment";
import { IrcGetIrcRowsRequest } from "api";

export interface SelectDateFromToComponentProps {
  onSearch: (from: Date, to: Date, channelId: string) => void;
  channelId: string | undefined;
  criteria: IrcGetIrcRowsRequest;
}

export const SelectDateFromToComponent: React.FC<SelectDateFromToComponentProps> = ({
  onSearch,
  channelId,
  criteria
}) => {
  const [fromDate, setFromDate] = useState<moment.Moment>(moment().add(-5, "M"));
  const [toDate, setToDate] = useState<moment.Moment>(moment());

  useEffect(() => {
    setFromDate(moment(criteria.criteriaFrom));
    setToDate(moment(criteria.criteriaTo));
  }, [criteria]);

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
