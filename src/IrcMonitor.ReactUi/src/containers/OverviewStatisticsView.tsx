import { OverviewStatisticsVm } from "api/models/OverviewStatisticsVm";
import { BarChartComponent } from "components/BarChartComponent";
import { AppContentWrapper } from "framework/AppContentWrapper";
import { useApiHook } from "hooks/useApiHook";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { getSelectecChannel } from "reducers/userReducer";

export const OverViewStatisticsView: React.FC = () => {
  const selectedChannel = useSelector(getSelectecChannel);

  const [response, setResponse] = useState<OverviewStatisticsVm | undefined>(undefined);

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const apiHook = useApiHook();

  useEffect(() => {
    if (selectedChannel && apiHook.ircApi) {
      setIsLoading(true);
      apiHook.ircApi
        .ircGetOverviewStatistics({ channelId: selectedChannel })
        .then((res) => {
          setResponse(res);
          setIsLoading(false);
        })
        .catch((err) => {
          setIsLoading(false);
          alert("Error");
        });
    }
  }, [selectedChannel]);

  return (
    <AppContentWrapper title={`Overview statistics`} isLoading={isLoading}>
      <BarChartComponent
        rows={response?.rows ?? []}
        dataSetLabel={response?.channelName ?? ""}
        chartTitle="Rows per year"
      />
    </AppContentWrapper>
  );
};
