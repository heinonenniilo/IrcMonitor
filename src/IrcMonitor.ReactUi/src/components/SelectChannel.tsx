import { Box, FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import { IrcChannelDto } from "api";
import React from "react";
import { useSelector } from "react-redux";
import { getSelectecChannel } from "reducers/userReducer";

export interface SelectChannelProps {
  channels: IrcChannelDto[];
  onSelectChannel: (channelId: string | undefined) => void;
}

export const SelectChannel: React.FC<SelectChannelProps> = ({
  channels,
  onSelectChannel
}: SelectChannelProps) => {
  const selectedChannel = useSelector(getSelectecChannel);

  return (
    <Box
      sx={{ minWidth: 300, display: "flex", flexDirection: "row", paddingTop: 2, paddingBottom: 2 }}
    >
      <FormControl fullWidth>
        <Box>
          <InputLabel id="channel-select-label">Channel</InputLabel>
        </Box>
        <Select
          labelId="channel-select-label"
          id="channel-select"
          value={selectedChannel ?? ""}
          color="primary"
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
    </Box>
  );
};
