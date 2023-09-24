import { Box, FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import { IrcGetHourlyStatisticsRequest, StatisticsVmBase, YearlyStatisticsVm } from "api";
import { BarChartComponent } from "components/BarChartComponent";
import { NickStatisticsDialog } from "components/NickStatisticsDialog";
import { AppContentWrapper } from "framework/AppContentWrapper";
import { useApiHook } from "hooks/useApiHook";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { getChannels, getSelectecChannel } from "reducers/userReducer";
import { dateFormat } from "utilities/dateUtils";
import { routes } from "utilities/routes";

const years = [
  2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023
];

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
  }, [selectedYear, selectedChannel, apiHook.ircApi]);

  const handleUserClick = (index: number) => {
    const correspondingUser = nickResponse?.rows[index];

    if (correspondingUser) {
      setUserStatisticsRequest({
        nick: correspondingUser.label,
        year: selectedYear,
        channelId: selectedChannel
      });
    }
  };

  const handleMonthClick = (index: number) => {
    const correspondingMonth = yearlyResponse?.monthlyRows[index];

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
      title={`${matchingChannel?.name}/${year}`}
      isLoading={isLoadingYearlyData || isLoadingNickData || isLoadingHourlyData}
      leftMenu={
        <FormControl fullWidth>
          <InputLabel id="year-select-label">Year</InputLabel>
          <Select
            labelId="year-select-label"
            id="year-select"
            value={selectedYear ?? 2022}
            label="Year"
          >
            {years.map((y) => (
              <MenuItem
                value={y}
                key={`year-${y}`}
                onClick={() => {
                  navigate(`${routes.statistics}/${y}`);
                }}
              >
                {y}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
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
            xl: "row"
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
          rows={yearlyResponse?.monthlyRows ?? []}
          dataSetLabel={yearlyResponse?.channel ?? ""}
          chartTitle={"Monthly statistics"}
          showPointerOnHover
          onClick={handleMonthClick}
        />
      </Box>
    </AppContentWrapper>
  );
};
