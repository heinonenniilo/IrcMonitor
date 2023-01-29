import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { IrcChannelDto } from "api";
import React from "react";
import { useSelector } from "react-redux";
import { getSelectecChannel } from "reducers/userReducer";

export interface SelectChannelProps {
  channels: IrcChannelDto[];
  onSelectChannel: (channelId: string | undefined) => void;
}

const usePreStyles = makeStyles((theme?: any) => ({
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

export const SelectChannel: React.FC<SelectChannelProps> = ({
  channels,
  onSelectChannel
}: SelectChannelProps) => {
  const selectedChannel = useSelector(getSelectecChannel);

  const classes = usePreStyles();
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
          className={classes.select}
        >
          {channels.map((c) => (
            <MenuItem
              onClick={() => {
                onSelectChannel(c.guid ?? "");
              }}
              value={c.guid as string}
            >
              {c.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </div>
  );
};
