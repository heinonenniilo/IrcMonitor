import {
  DataGrid,
  GridColDef,
  GridRowsProp,
  GridSortModel,
  GridValueGetterParams
} from "@mui/x-data-grid";
import { GetIrcRowsVm, IrcGetIrcRowsRequest } from "api";
import { SelectDateFromToComponent } from "components/SelectDateFromToComponent";
import { AppContentWrapper } from "framework/AppContentWrapper";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { getSelectecChannel } from "reducers/userReducer";
import moment from "moment";
import { useApiHook } from "hooks/useApiHook";
import { useSearchParams } from "react-router-dom";
import { dateFormat } from "utilities/dateUtils";

export const BrowseView: React.FC = () => {
  const useApi = useApiHook();
  const channelId = useSelector(getSelectecChannel);
  const [rows, setRows] = useState<GridRowsProp>([]);
  const [hasSearchedWithQueryParams, setHasSearchedWithQueryParams] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  let [searchParams] = useSearchParams();

  const pageSize = 50;

  const defaultCriteria: IrcGetIrcRowsRequest = useMemo(() => {
    return {
      criteriaSortColumn: "timeStamp",
      criteriaIsAscendingOrder: false,
      criteriaPage: 0,
      criteriaPageSize: pageSize,
      criteriaFrom: moment().add(-10, "M").toDate(),
      criteriaTo: moment().toDate()
    };
  }, []);

  const [response, setResponse] = useState<GetIrcRowsVm | undefined>();

  const [criteria, setCriteria] = useState<IrcGetIrcRowsRequest | undefined>({
    ...defaultCriteria
  });

  const handleFetchRows = useCallback(
    (criteria: IrcGetIrcRowsRequest) => {
      const api = useApi.ircApi;
      if (!api) {
        return;
      }
      setCriteria(criteria);

      setIsLoading(true);
      api
        .ircGetIrcRows(criteria)
        .then((res) => {
          setRows(res.rows);
          setResponse(() => {
            setIsLoading(false);
            return res;
          });
        })
        .catch((err) => {
          setIsLoading(false);
        });
    },
    [useApi.ircApi]
  );

  useEffect(() => {
    if (hasSearchedWithQueryParams) {
      return;
    }

    console.log("use");
    const startString = searchParams.get("start");
    const endString = searchParams.get("end");

    console.log(startString);
    console.log(endString);
    console.log("channel", channelId);
    if (startString && endString && channelId && useApi.ircApi) {
      const momentStart = moment(startString, dateFormat);
      const momentEnd = moment(endString, dateFormat);
      setHasSearchedWithQueryParams(true);
      handleFetchRows({
        ...defaultCriteria,
        criteriaChannelId: channelId,
        criteriaFrom: momentStart.toDate(),
        criteriaTo: momentEnd.toDate()
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, channelId, hasSearchedWithQueryParams, handleFetchRows, useApi.ircApi]);

  const columns: GridColDef[] = [
    { field: "id", headerName: "Id", width: 150, sortable: false },
    { field: "message", headerName: "Message", width: 150, sortable: false, flex: 1 },
    { field: "nick", headerName: "Nick", width: 150, sortable: false },
    {
      field: "timeStamp",
      headerName: "Timestamp",
      width: 400,
      sortable: true,
      valueGetter: (params: GridValueGetterParams) => {
        return moment(params.value).format("DD.MM.YYYY HH:MM:SS");
      }
    }
  ];

  return (
    <AppContentWrapper title="Browse">
      <SelectDateFromToComponent
        channelId={channelId}
        onSearch={(from: Date, to: Date, channelId: string) => {
          handleFetchRows({
            ...criteria,
            criteriaChannelId: channelId,
            criteriaFrom: from,
            criteriaTo: to,
            criteriaPage: 0
          });
        }}
        criteria={criteria}
      />
      <DataGrid
        rows={rows}
        rowCount={response?.totalRows ?? 0}
        page={criteria?.criteriaPage ?? 0}
        rowsPerPageOptions={[pageSize]}
        paginationMode="server"
        pageSize={pageSize}
        onSortModelChange={(model: GridSortModel) => {
          if (model.length === 1) {
            const sortItem = model[0];
            handleFetchRows({
              ...criteria,
              criteriaPage: 0,
              criteriaSortColumn: sortItem.field,
              criteriaIsAscendingOrder: sortItem.sort === "asc"
            });
          } else {
            handleFetchRows({ ...criteria, criteriaPage: 0, criteriaChannelId: channelId });
          }
        }}
        onPageChange={(page: number) => {
          handleFetchRows({ ...criteria, criteriaPage: page, criteriaChannelId: channelId });
        }}
        columns={columns}
        loading={isLoading}
        pagination
      />
    </AppContentWrapper>
  );
};
