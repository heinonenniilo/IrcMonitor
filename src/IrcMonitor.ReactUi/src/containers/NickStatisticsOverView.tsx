import { Box } from "@mui/material";
import { ircActions } from "actions/ircActions";
import { StatisticsVmBase } from "api";
import { OverviewStatisticsVm } from "api/models/OverviewStatisticsVm";
import { BarChartComponent } from "components/BarChartComponent";
import { NickWithCount, YearlyViewMenu } from "components/YearlyViewMenu";
import { AppContentWrapper } from "framework/AppContentWrapper";
import { useApiHook } from "hooks/useApiHook";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { getChannelOverviewNicks } from "reducers/ircReducer";
import { getChannels, getSelectecChannel } from "reducers/userReducer";
import { routes } from "utilities/routes";

export const NickOverviewStatistics: React.FC = () => {
  const { nick } = useParams<{ nick: string }>();

  const [response, setResponse] = useState<OverviewStatisticsVm | undefined>(undefined);
  const [hourlyResponse, setHourlyResponse] = useState<StatisticsVmBase | undefined>(undefined);
  const [isLoadingOverviewStatistics, setIsLoadingOverViewStatistics] = useState(false);
  const [isLoadingHourlyStatistics, setIsLoadingHourlyStatistics] = useState(false);
  const channels = useSelector(getChannels);

  const selectedChannel = useSelector(getSelectecChannel);
  const overViewNicks = useSelector(getChannelOverviewNicks);
  const apiHook = useApiHook();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const matchingChannel = channels?.find((c) => c.guid === selectedChannel);

  useEffect(() => {
    if (apiHook.ircApi && nick && selectedChannel) {
      setIsLoadingOverViewStatistics(true);
      setIsLoadingHourlyStatistics(true);
      apiHook.ircApi
        .ircGetOverviewStatistics({ channelId: selectedChannel, nick: nick })
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
        .ircGetHourlyStatistics({ channelId: selectedChannel, nick: nick })
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
  }, [apiHook.ircApi, nick, selectedChannel]);

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

  const getNicks = (): NickWithCount[] => {
    if (!overViewNicks || !overViewNicks.rows) {
      return [];
    }

    if (overViewNicks.channelId !== selectedChannel) {
      return [];
    }

    return overViewNicks.rows.map((r) => {
      return { nick: r.label, count: r.value };
    });
  };

  const handleClickYear = (index: number) => {
    const correspondingYear = response.rows[index];
    navigate(`${routes.nickStatisticsBase}/${nick}/${correspondingYear.identifier}`);
  };
  return (
    <AppContentWrapper
      titleParts={[{ text: matchingChannel?.name, to: routes.statistics }, { text: nick }]}
      isLoading={isLoadingOverviewStatistics || isLoadingHourlyStatistics}
      leftMenu={
        <YearlyViewMenu
          nicks={getNicks()}
          selectedNick={nick}
          onChangeNick={(newNick: string) => {
            navigate(`${routes.nickStatisticsBase}/${newNick}`);
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
          rows={response?.rows ?? []}
          dataSetLabel={response?.channelName ?? ""}
          chartTitle="Rows per year"
          onClick={handleClickYear}
          showPointerOnHover
        />
        <BarChartComponent
          rows={hourlyResponse?.rows ?? []}
          dataSetLabel={response?.channelName ?? ""}
          chartTitle="Rows per hour"
          onClick={undefined}
        />
      </Box>
    </AppContentWrapper>
  );
};
