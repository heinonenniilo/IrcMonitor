import {
  DataGrid,
  GridColDef,
  GridRowsProp,
  GridSortModel,
  GridValueGetterParams
} from "@mui/x-data-grid";
import { Configuration, GetIrcRowsVm, IrcApi, IrcGetIrcRowsRequest } from "api";
import { SelectDateFromToComponent } from "components/SelectDateFromToComponent";
import { AppContentWrapper } from "framework/AppContentWrapper";
import React, { useCallback, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { getAccessToken, getSelectecChannel } from "reducers/userReducer";
import moment from "moment";

export const BrowseView: React.FC = () => {
  const accessToken = useSelector(getAccessToken);
  const channelId = useSelector(getSelectecChannel);
  const [rows, setRows] = useState<GridRowsProp>([]);

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const pageSize = 50;

  const defaultCriteria: IrcGetIrcRowsRequest = useMemo(() => {
    return {
      criteriaSortColumn: "timeStamp",
      criteriaIsAscendingOrder: false,
      criteriaPage: 0,
      criteriaPageSize: pageSize
    };
  }, []);

  const [response, setResponse] = useState<GetIrcRowsVm | undefined>();

  const [criteria, setCriteria] = useState<IrcGetIrcRowsRequest | undefined>({
    ...defaultCriteria
  });

  const handleFetchRows = useCallback(
    (criteria: IrcGetIrcRowsRequest) => {
      const api = new IrcApi(new Configuration({ apiKey: `Bearer ${accessToken}` }));

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
    [accessToken]
  );

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
