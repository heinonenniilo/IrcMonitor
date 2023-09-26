import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { IrcChannelDto } from "api";
import React from "react";
import { useSelector } from "react-redux";
import { getSelectecChannel } from "reducers/userReducer";
import { getFormattedNumber } from "utilities/numberFormatterUtils";

export interface SelectChannelProps {
  channels: IrcChannelDto[];
  onSelectChannel: (channelId: string | undefined) => void;
  isMobile?: boolean;
}

const desktopStyles = makeStyles((theme?: any) => ({
  formControl: {
    minWidth: 120,
    color: "white"
  },
  selectEmpty: {},
  divcontrol: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    minWidth: "300px"
  },
  select: {
    color: "white"
  },
  label: {
    display: "flex",
    color: "white"
  },
  labelContainer: {
    paddingRight: 16
  }
}));

const mobileStyles = makeStyles((theme?: any) => ({
  formControl: {
    // minWidth: 120,
    // color: "white"
  },
  selectEmpty: {},
  divcontrol: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    minWidth: "300px"
  },
  select: {
    // color: "white"
  },
  label: {
    display: "flex"
    // color: "white"
  },
  labelContainer: {
    paddingRight: 16
  }
}));

export const SelectChannel: React.FC<SelectChannelProps> = ({
  channels,
  onSelectChannel,
  isMobile
}: SelectChannelProps) => {
  const selectedChannel = useSelector(getSelectecChannel);

  const classes = !isMobile ? desktopStyles() : mobileStyles();
  return (
    <div className={classes.divcontrol}>
      <div className={classes.labelContainer}>
        <InputLabel id="channel-select-label" className={classes.label}>
          Channel
        </InputLabel>
      </div>
      <FormControl fullWidth>
        <Select
          labelId="channel-select-label"
          id="channel-select"
          value={selectedChannel ?? ""}
          renderValue={(r) => {
            const match = channels.find((c) => c.guid === r);
            return match.name ?? r;
          }}
          className={classes.select}
        >
          {channels.map((c) => (
            <MenuItem
              key={c.guid}
              onClick={() => {
                onSelectChannel(c.guid ?? "");
              }}
              value={c.guid as string}
            >
              {`${c.name} (${getFormattedNumber(c.rowCount)})`}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </div>
  );
};
