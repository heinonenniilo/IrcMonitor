import { Box } from "@mui/material";
import { ircActions } from "actions/ircActions";
import { StatisticsVmBase, YearlyStatisticsVm } from "api";
import { BarChartComponent } from "components/BarChartComponent";
import { YearlyViewMenu } from "components/YearlyViewMenu";
import { years } from "constants/conts";
import { AppContentWrapper } from "framework/AppContentWrapper";
import { useApiHook } from "hooks/useApiHook";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import {
  getChannelYearlyNicks,
  getSelectedNicks,
  getYearlyNicksWithCount
} from "reducers/ircReducer";
import { getChannels, getSelectecChannel } from "reducers/userReducer";
import { routes } from "utilities/routes";

export const NickStatisticsYear: React.FC = () => {
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
  const selectedNicks = useSelector(getSelectedNicks);
  const yearlyNicksWithCount = useSelector(getYearlyNicksWithCount);

  const apiHook = useApiHook();

  const matchingChannel = channels?.find((c) => c.guid === selectedChannel);

  useEffect(() => {
    if (apiHook.ircApi && selectedNicks && selectedNicks.length > 0 && selectedChannel && year) {
      setIsLoadingYearlyStatistics(true);
      setIsLoadingHourlyData(true);

      const yearToUse = parseInt(year, 10);
      apiHook.ircApi
        .ircGetYearlyStatistics({
          year: yearToUse,
          channelId: selectedChannel,
          nick: selectedNicks
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
        .ircGetHourlyStatistics({
          channelId: selectedChannel,
          nick: selectedNicks,
          year: yearToUse
        })
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
  }, [apiHook.ircApi, selectedNicks, selectedChannel, year]);

  useEffect(() => {
    if (
      apiHook.ircApi &&
      year &&
      (channelYearlyStatistics === undefined ||
        channelYearlyStatistics.year !== parseInt(year, 10) ||
        channelYearlyStatistics.channelId !== selectedChannel)
    ) {
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

  return (
    <AppContentWrapper
      titleParts={[
        {
          text: matchingChannel?.name,
          to: routes.statistics
        },
        { text: "nicks", to: `${routes.nickOverView}` },
        {
          text: year,
          to: `${routes.statistics}/${year}`
        }
      ]}
      isLoading={isLoadingYearlyStatistics || isLoadingHourlyStata}
      leftMenu={
        <YearlyViewMenu
          years={years}
          onChangeYear={(year) => {
            navigate(`${routes.nickOverView}/${year}`);
          }}
          selectedYear={year ? parseInt(year, 10) : undefined}
          nicks={yearlyNicksWithCount}
          selectedNicks={selectedNicks}
          onChangeNick={(newNick: string, selected: boolean) => {
            if (selected) {
              dispatch(ircActions.storeSelectedNicks([...selectedNicks, newNick]));
            } else {
              dispatch(ircActions.storeSelectedNicks(selectedNicks.filter((s) => s !== newNick)));
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
          },
          "& > *": {
            maxHeight: "40%"
          }
        }}
      >
        <BarChartComponent
          rows={hourlyResponse?.rows}
          dataSetLabel={"Hour"}
          chartTitle="Hourly statistics"
          onClick={undefined}
        />
        <BarChartComponent
          rows={yearlyResponse?.rows}
          dataSetLabel={"Month"}
          chartTitle="Rows per month"
          onClick={undefined}
          showPointerOnHover
        />
      </Box>
    </AppContentWrapper>
  );
};
