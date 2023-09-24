import { Box } from "@mui/material";
import { ircActions } from "actions/ircActions";
import { IrcGetHourlyStatisticsRequest, StatisticsVmBase } from "api";
import { OverviewStatisticsVm } from "api/models/OverviewStatisticsVm";
import { BarChartComponent } from "components/BarChartComponent";
import { NickStatisticsDialog } from "components/NickStatisticsDialog";
import { AppContentWrapper } from "framework/AppContentWrapper";
import { useApiHook } from "hooks/useApiHook";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { getSelectecChannel } from "reducers/userReducer";
import { routes } from "utilities/routes";

export const OverViewStatisticsView: React.FC = () => {
  const selectedChannel = useSelector(getSelectecChannel);

  const [response, setResponse] = useState<OverviewStatisticsVm | undefined>(undefined);

  const [nickResponse, setNickResponse] = useState<StatisticsVmBase | undefined>(undefined);

  const [isLoadingOverViewData, setIsLoadingOverViewData] = useState<boolean>(false);
  const [isLoadingNickData, setIsLoadingNickData] = useState(false);
  const [userStatisticsRequest, setUserStatisticsRequest] = useState<
    IrcGetHourlyStatisticsRequest | undefined
  >(undefined);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const apiHook = useApiHook();

  useEffect(() => {
    if (selectedChannel && apiHook.ircApi) {
      setIsLoadingOverViewData(true);

      apiHook.ircApi
        .ircGetNickBasedStatistics({
          channelId: selectedChannel
        })
        .then((res) => {
          setNickResponse(res);
          dispatch(ircActions.storeChannelOverviewStatistics(res));
          setIsLoadingNickData(false);
        })
        .catch((er) => {
          console.error(er);
          setIsLoadingNickData(false);
        });

      apiHook.ircApi
        .ircGetOverviewStatistics({ channelId: selectedChannel })
        .then((res) => {
          setResponse(res);
          setIsLoadingOverViewData(false);
        })
        .catch((err) => {
          setIsLoadingOverViewData(false);
          console.error(err);
        });
    }
  }, [selectedChannel, apiHook.ircApi, dispatch]);

  const handleOnClickChannel = (index: number) => {
    if (!response) {
      return;
    }

    const correspondingRow = response.rows[index];

    if (correspondingRow) {
      navigate(`${routes.statistics}/${correspondingRow.identifier}`);
    }
  };

  const handleOnClickUser = (index: number) => {
    const correspondingUser = nickResponse?.rows[index];
    if (correspondingUser) {
      navigate(`${routes.nickStatisticsBase}/${correspondingUser.label}`);
    }
  };

  return (
    <AppContentWrapper
      isLoading={isLoadingOverViewData || isLoadingNickData}
      titleParts={[{ text: `Overview statistics ${response?.channelName ?? ""}` }]}
    >
      <NickStatisticsDialog
        isOpen={userStatisticsRequest !== undefined}
        onClose={() => {
          setUserStatisticsRequest(undefined);
        }}
        params={userStatisticsRequest}
      />
      <Box
        sx={{
          display: "flex",
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
          rows={response?.rows ?? []}
          dataSetLabel={response?.channelName ?? ""}
          chartTitle="Rows per year"
          onClick={handleOnClickChannel}
          showPointerOnHover
        />

        <BarChartComponent
          rows={nickResponse?.rows ?? []}
          dataSetLabel={response?.channelName ?? ""}
          chartTitle="Nick based statistics"
          showPointerOnHover
          onClick={handleOnClickUser}
        />
      </Box>
    </AppContentWrapper>
  );
};
