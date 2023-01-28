import { YearlyStatisticsVm } from "api";
import { BarChartComponent } from "components/BarChartComponent";
import { AppContentWrapper } from "framework/AppContentWrapper";
import { useApiHook } from "hooks/useApiHook";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { getSelectecChannel } from "reducers/userReducer";
import { dateFormat } from "utilities/dateUtils";
import { routes } from "utilities/routes";

export const YearlyStatistics: React.FC = () => {
  const { year } = useParams<{ year: string }>();
  const selectedChannel = useSelector(getSelectecChannel);
  const [selectedYear, setSelectedYear] = useState<number | undefined>(undefined);
  const [response, setResponse] = useState<YearlyStatisticsVm | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const navigate = useNavigate();

  const apiHook = useApiHook();
  useEffect(() => {
    if (year) {
      setSelectedYear(parseInt(year, 10));
    }
  }, [year]);

  useEffect(() => {
    if (selectedYear !== undefined && selectedChannel && apiHook.ircApi) {
      setIsLoading(true);
      apiHook.ircApi
        .ircGetYearlyStatistics({ year: selectedYear, channelId: selectedChannel })
        .then((res) => {
          setResponse(res);
          setIsLoading(false);
        })
        .catch((er) => {
          setIsLoading(false);
          alert(er);
        });
    }
  }, [selectedYear, selectedChannel, apiHook.ircApi]);

  const handleMonthClick = (index: number) => {
    const correspondingMonth = response?.monthlyRows[index];

    console.log(correspondingMonth);
    if (correspondingMonth) {
      const startMoment = moment({
        year: response?.year,
        month: correspondingMonth.identifier - 1,
        day: 1
      });

      navigate(
        `${routes.browse}?start=${startMoment.format(dateFormat)}&end=${startMoment
          .add(1, "M")
          .format(dateFormat)}`
      );
    }
  };

  return (
    <AppContentWrapper title={`Statistics for year ${year}`} isLoading={isLoading}>
      <BarChartComponent
        rows={response?.monthlyRows ?? []}
        dataSetLabel={response?.channel ?? ""}
        chartTitle={"Yearly statistics"}
        showPointerOnHover
        onClick={handleMonthClick}
      />
      <BarChartComponent
        rows={response?.hourlyRows ?? []}
        dataSetLabel={response?.channel ?? ""}
        chartTitle={"Hourly statistics"}
      />
    </AppContentWrapper>
  );
};
