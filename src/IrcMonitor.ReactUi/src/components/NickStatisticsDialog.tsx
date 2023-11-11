import {
  Backdrop,
  CircularProgress,
  Container,
  Dialog,
  DialogContent,
  DialogTitle
} from "@mui/material";
import { IrcGetHourlyStatisticsRequest, StatisticsVmBase } from "api";
import { useApiHook } from "hooks/useApiHook";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { getChannels } from "reducers/userReducer";
import { BarChartComponent } from "./BarChartComponent";

export interface NickStatisticsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  params: IrcGetHourlyStatisticsRequest;
}

export const NickStatisticsDialog: React.FC<NickStatisticsDialogProps> = ({
  isOpen,
  onClose,
  params
}) => {
  const apiHook = useApiHook();

  const [response, setResponse] = useState<StatisticsVmBase | undefined>(undefined);
  const channels = useSelector(getChannels);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (apiHook.ircApi && isOpen && params) {
      setIsLoading(true);
      apiHook.ircApi
        .ircGetHourlyStatistics(params)
        .then((res) => {
          setIsLoading(false);
          setResponse(res);
        })
        .catch((err) => {
          setIsLoading(false);
          console.error(err);
        });
    }
  }, [isOpen, apiHook.ircApi, params]);

  const matchingChannel = channels.find((c) => c.guid === params?.channelId);

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      fullWidth
      maxWidth="lg"
      sx={{ display: "flex", flexDirection: "column" }}
    >
      <Backdrop sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }} open={isLoading}>
        <CircularProgress color="inherit" />
      </Backdrop>
      <Container
        maxWidth={false}
        sx={{
          minWidth: "800px",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          flex: 1
        }}
      >
        <DialogTitle>
          {`Statistics for nick: ${params?.nick}, channel: ${matchingChannel?.name}`}
          {params?.year ? `, year: ${params?.year}` : null}
          {params?.month ? `, month: ${params?.month}` : null}
        </DialogTitle>
        <DialogContent sx={{ flex: 1, maxWidth: "100%", display: "flex" }}>
          <div style={{ width: "100%" }}>
            <BarChartComponent rows={response?.rows} chartTitle={""} dataSetLabel="Hour" />
          </div>
        </DialogContent>
      </Container>
    </Dialog>
  );
};
