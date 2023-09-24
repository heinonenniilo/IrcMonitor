import { Box } from "@mui/material";
import { ircActions } from "actions/ircActions";
import { IrcGetHourlyStatisticsRequest, StatisticsVmBase, YearlyStatisticsVm } from "api";
import { BarChartComponent } from "components/BarChartComponent";
import { NickStatisticsDialog } from "components/NickStatisticsDialog";
import { YearlyViewMenu } from "components/YearlyViewMenu";
import { years } from "constants/conts";
import { AppContentWrapper } from "framework/AppContentWrapper";
import { useApiHook } from "hooks/useApiHook";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { getChannels, getSelectecChannel } from "reducers/userReducer";
import { dateFormat } from "utilities/dateUtils";
import { routes } from "utilities/routes";

export const YearlyStatisticsView: React.FC = () => {
  const { year } = useParams<{ year: string }>();
  const selectedChannel = useSelector(getSelectecChannel);
  const channels = useSelector(getChannels);
  const [selectedYear, setSelectedYear] = useState<number | undefined>(undefined);
  const [yearlyResponse, setYearlyResponse] = useState<YearlyStatisticsVm | undefined>(undefined);
  const [nickResponse, setNickResponse] = useState<StatisticsVmBase | undefined>(undefined);
  const [hourlyResponse, setHourlyResponse] = useState<StatisticsVmBase | undefined>(undefined);
  const [isLoadingYearlyData, setIsLoadingYearlyData] = useState<boolean>(false);
  const [isLoadingNickData, setIsLoadingNickData] = useState<boolean>(false);
  const [isLoadingHourlyData, setIsLoadingHourlyData] = useState<boolean>(false);

  const [userStatisticsRequest, setUserStatisticsRequest] = useState<
    IrcGetHourlyStatisticsRequest | undefined
  >(undefined);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const apiHook = useApiHook();
  useEffect(() => {
    if (year) {
      setSelectedYear(parseInt(year, 10));
    }
  }, [year]);

  useEffect(() => {
    if (selectedYear !== undefined && selectedChannel && apiHook.ircApi) {
      setIsLoadingYearlyData(true);
      setIsLoadingNickData(true);
      setIsLoadingHourlyData(true);
      apiHook.ircApi
        .ircGetYearlyStatistics({ year: selectedYear, channelId: selectedChannel })
        .then((res) => {
          setYearlyResponse(res);
          setIsLoadingYearlyData(false);
        })
        .catch((er) => {
          setIsLoadingYearlyData(false);
          console.error(er);
        });

      apiHook.ircApi
        .ircGetNickBasedStatistics({
          channelId: selectedChannel,
          year: selectedYear
        })
        .then((res) => {
          setNickResponse(res);
          setIsLoadingNickData(false);
          dispatch(ircActions.storeChannelYearlyStatistics(res));
        })
        .catch((er) => {
          console.error(er);
          setIsLoadingNickData(false);
        });

      apiHook.ircApi
        .ircGetHourlyStatistics({ channelId: selectedChannel, year: selectedYear })
        .then((res) => {
          setHourlyResponse(res);
          setIsLoadingHourlyData(false);
        })
        .catch((er) => {
          console.error(er);
          setIsLoadingHourlyData(false);
        });
    }
  }, [selectedYear, selectedChannel, apiHook.ircApi, dispatch]);

  const handleUserClick = (index: number) => {
    const correspondingUser = nickResponse?.rows[index];

    if (correspondingUser) {
      navigate(`${routes.nickStatisticsBase}/${correspondingUser.label}/${year}`);
    }
  };

  const handleMonthClick = (index: number) => {
    const correspondingMonth = yearlyResponse?.rows[index];

    if (correspondingMonth) {
      const startMoment = moment({
        year: yearlyResponse?.year,
        month: correspondingMonth.identifier - 1,
        day: 1
      });

      navigate(
        `${routes.browse}?start=${startMoment.format(dateFormat)}&end=${startMoment
          .add(1, "M")
          .add(-1, "day")
          .format(dateFormat)}`
      );
    }
  };

  const matchingChannel = channels?.find((c) => c.guid === selectedChannel);

  return (
    <AppContentWrapper
      titleParts={[
        { text: `${matchingChannel?.name}`, to: `${routes.statistics}` },
        { text: year.toString() }
      ]}
      isLoading={isLoadingYearlyData || isLoadingNickData || isLoadingHourlyData}
      leftMenu={
        <YearlyViewMenu
          years={years}
          selectedYear={selectedYear}
          onChangeYear={(year) => {
            navigate(`${routes.statistics}/${year}`);
          }}
        />
      }
    >
      <NickStatisticsDialog
        isOpen={userStatisticsRequest !== undefined}
        onClose={() => {
          setUserStatisticsRequest(undefined);
        }}
        params={userStatisticsRequest}
      />
      <Box
        display={"flex"}
        justifyContent="space-evenly"
        width="100%"
        sx={{
          flexDirection: {
            xs: "column",
            lg: "row"
          },
          flexGrow: {
            xs: 1
          },
          columnGap: {
            xl: 3
          }
        }}
      >
        <BarChartComponent
          rows={hourlyResponse?.rows ?? []}
          dataSetLabel={yearlyResponse?.channel ?? ""}
          chartTitle={"Hourly statistics"}
        />
        <BarChartComponent
          rows={nickResponse?.rows ?? []}
          dataSetLabel={"Nick"}
          chartTitle={"Nick statistics"}
          onClick={handleUserClick}
          showPointerOnHover
        />
      </Box>
      <Box display={"flex"} width="100%" flexDirection={"column"} flex={1}>
        <BarChartComponent
          rows={yearlyResponse?.rows ?? []}
          dataSetLabel={yearlyResponse?.channel ?? ""}
          chartTitle={"Monthly statistics"}
          showPointerOnHover
          onClick={handleMonthClick}
        />
      </Box>
    </AppContentWrapper>
  );
};
