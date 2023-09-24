import { Box } from "@mui/material";
import { ircActions } from "actions/ircActions";
import { StatisticsVmBase, YearlyStatisticsVm } from "api";
import { BarChartComponent } from "components/BarChartComponent";
import { NickWithCount, YearlyViewMenu } from "components/YearlyViewMenu";
import { years } from "constants/conts";
import { AppContentWrapper } from "framework/AppContentWrapper";
import { useApiHook } from "hooks/useApiHook";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { getChannelYearlyNicks } from "reducers/ircReducer";
import { getChannels, getSelectecChannel } from "reducers/userReducer";
import { routes } from "utilities/routes";

export const NickStatisticsYear: React.FC = () => {
  const { nick } = useParams<{ nick: string }>();
  const { year } = useParams<{ year: string }>();

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [yearlyResponse, setYearlyResponse] = useState<YearlyStatisticsVm | undefined>(undefined);
  const [hourlyResponse, setHourlyResponse] = useState<StatisticsVmBase | undefined>(undefined);
  const [isLoadingYearlyStatistics, setIsLoadingYearlyStatistics] = useState(false);
  const [isLoadingHourlyStata, setIsLoadingHourlyData] = useState(false);

  const channels = useSelector(getChannels);

  const selectedChannel = useSelector(getSelectecChannel);
  const channelYearlyStatistics = useSelector(getChannelYearlyNicks);

  const apiHook = useApiHook();

  const matchingChannel = channels?.find((c) => c.guid === selectedChannel);

  useEffect(() => {
    if (apiHook.ircApi && nick && selectedChannel && year) {
      setIsLoadingYearlyStatistics(true);
      setIsLoadingHourlyData(true);

      const yearToUse = parseInt(year, 10);
      apiHook.ircApi
        .ircGetYearlyStatistics({
          year: yearToUse,
          channelId: selectedChannel,
          nick: nick
        })
        .then((res) => {
          setYearlyResponse(res);
        })
        .catch((er) => {
          console.error(er);
        })
        .finally(() => {
          setIsLoadingYearlyStatistics(false);
        });

      apiHook.ircApi
        .ircGetHourlyStatistics({ channelId: selectedChannel, nick: nick, year: yearToUse })
        .then((res) => {
          setHourlyResponse(res);
        })
        .catch((er) => {
          console.error(er);
        })
        .finally(() => {
          setIsLoadingHourlyData(false);
        });
    }
  }, [apiHook.ircApi, nick, selectedChannel, year]);

  useEffect(() => {
    if (
      apiHook.ircApi &&
      year &&
      (channelYearlyStatistics === undefined ||
        channelYearlyStatistics.year !== parseInt(year, 10) ||
        channelYearlyStatistics.channelId !== selectedChannel)
    ) {
      console.log("Reloading");
      apiHook.ircApi
        .ircGetNickBasedStatistics({
          channelId: selectedChannel,
          year: parseInt(year, 10)
        })
        .then((res) => {
          dispatch(ircActions.storeChannelYearlyStatistics(res));
        })
        .catch((er) => {
          console.error(er);
        });
    }
  }, [year, channelYearlyStatistics, dispatch, apiHook.ircApi, selectedChannel]);

  const getNicks = (): NickWithCount[] => {
    if (!channelYearlyStatistics) {
      return [];
    }

    if (
      channelYearlyStatistics.channelId === selectedChannel &&
      channelYearlyStatistics.year === parseInt(year, 10)
    ) {
      return channelYearlyStatistics.rows.map((r) => {
        return { nick: r.label, count: r.value };
      });
    }
  };

  return (
    <AppContentWrapper
      titleParts={[
        {
          text: matchingChannel?.name,
          to: routes.statistics
        },
        {
          text: year,
          to: `${routes.statistics}/${year}`
        },
        { text: nick }
      ]}
      isLoading={isLoadingYearlyStatistics || isLoadingHourlyStata}
      leftMenu={
        <YearlyViewMenu
          years={years}
          onChangeYear={(year) => {
            navigate(`${routes.nickStatisticsBase}/${nick}/${year}`);
          }}
          selectedYear={year ? parseInt(year, 10) : undefined}
          nicks={getNicks()}
          selectedNick={nick}
          onChangeNick={(newNick: string) => {
            navigate(`${routes.nickStatisticsBase}/${newNick}/${year}`);
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
          },
          "& > *": {
            maxHeight: "40%"
          }
        }}
      >
        <BarChartComponent
          rows={hourlyResponse?.rows ?? []}
          dataSetLabel={"Hour"}
          chartTitle="Hourly statistics"
          onClick={undefined}
        />
        <BarChartComponent
          rows={yearlyResponse?.rows ?? []}
          dataSetLabel={"Month"}
          chartTitle="Rows per month"
          onClick={undefined}
          showPointerOnHover
        />
      </Box>
    </AppContentWrapper>
  );
};
