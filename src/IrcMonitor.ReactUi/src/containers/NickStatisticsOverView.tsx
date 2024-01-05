import { Box } from "@mui/material";
import { ircActions } from "actions/ircActions";
import { StatisticsVmBase } from "api";
import { OverviewStatisticsVm } from "api/models/OverviewStatisticsVm";
import { BarChartComponent } from "components/BarChartComponent";
import { YearlyViewMenu } from "components/YearlyViewMenu";
import { AppContentWrapper } from "framework/AppContentWrapper";
import { useApiHook } from "hooks/useApiHook";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  getChannelOverviewNicks,
  getOverviewNicksWithCount,
  getSelectedNicks
} from "reducers/ircReducer";
import { getChannels, getSelectecChannel } from "reducers/userReducer";
import { routes } from "utilities/routes";

export const NickOverviewStatistics: React.FC = () => {
  const [response, setResponse] = useState<OverviewStatisticsVm | undefined>(undefined);
  const [hourlyResponse, setHourlyResponse] = useState<StatisticsVmBase | undefined>(undefined);
  const [isLoadingOverviewStatistics, setIsLoadingOverViewStatistics] = useState(false);
  const [isLoadingHourlyStatistics, setIsLoadingHourlyStatistics] = useState(false);
  const channels = useSelector(getChannels);

  const selectedChannel = useSelector(getSelectecChannel);
  const overViewNicks = useSelector(getChannelOverviewNicks);
  const selectedNicks = useSelector(getSelectedNicks);
  const overViewNicksWithCount = useSelector(getOverviewNicksWithCount);

  const apiHook = useApiHook();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const matchingChannel = channels?.find((c) => c.guid === selectedChannel);

  useEffect(() => {
    console.log("On use effect", selectedNicks);
    if (apiHook.ircApi && selectedNicks && selectedNicks.length > 0 && selectedChannel) {
      setIsLoadingOverViewStatistics(true);
      setIsLoadingHourlyStatistics(true);
      apiHook.ircApi
        .ircGetOverviewStatistics({ channelId: selectedChannel, nick: selectedNicks })
        .then((res) => {
          setResponse(res);
        })
        .catch((err) => {
          console.error(err);
        })
        .finally(() => {
          setIsLoadingOverViewStatistics(false);
        });

      apiHook.ircApi
        .ircGetHourlyStatistics({ channelId: selectedChannel, nick: selectedNicks })
        .then((res) => {
          setHourlyResponse(res);
        })
        .catch((er) => {
          console.error(er);
        })
        .finally(() => {
          setIsLoadingHourlyStatistics(false);
        });
    }
  }, [apiHook.ircApi, selectedNicks, selectedChannel]);

  useEffect(() => {
    if (
      apiHook.ircApi &&
      selectedChannel &&
      (overViewNicks === undefined || overViewNicks.channelId !== selectedChannel)
    ) {
      apiHook.ircApi
        .ircGetNickBasedStatistics({
          channelId: selectedChannel
        })
        .then((res) => {
          dispatch(ircActions.storeChannelOverviewStatistics(res));
        })
        .catch((er) => {
          console.error(er);
        });
    }
  }, [overViewNicks, dispatch, apiHook.ircApi, selectedChannel]);

  const handleClickYear = (index: number) => {
    const correspondingYear = response.rows.identifiers[index];
    navigate(`${routes.nickOverView}/${correspondingYear}`);
  };
  return (
    <AppContentWrapper
      titleParts={[{ text: matchingChannel?.name, to: routes.statistics }, { text: "Nicks" }]}
      isLoading={isLoadingOverviewStatistics || isLoadingHourlyStatistics}
      leftMenu={
        <YearlyViewMenu
          nicks={overViewNicksWithCount}
          selectedNicks={selectedNicks}
          onChangeNick={(newNick: string, select: boolean) => {
            if (select) {
              dispatch(ircActions.storeSelectedNicks([...selectedNicks, newNick]));
            } else {
              dispatch(ircActions.storeSelectedNicks(selectedNicks.filter((f) => f !== newNick)));
            }
          }}
        />
      }
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          flexGrow: {
            xs: 1
          },
          columnGap: {
            xl: 3
          }
        }}
      >
        <BarChartComponent
          rows={response?.rows}
          dataSetLabel={response?.channelName ?? ""}
          chartTitle="Rows per year"
          onClick={handleClickYear}
          showPointerOnHover
        />
        <BarChartComponent
          rows={hourlyResponse?.rows}
          dataSetLabel={response?.channelName ?? ""}
          chartTitle="Rows per hour"
          onClick={undefined}
        />
      </Box>
    </AppContentWrapper>
  );
};
