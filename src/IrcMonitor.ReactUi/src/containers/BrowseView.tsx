import { DataGrid, GridColDef, GridRowsProp } from "@mui/x-data-grid";
import { Configuration, GetIrcRowsVm, IrcApi, IrcGetIrcRowsRequest } from "api";
import { AppContentWrapper } from "framework/AppContentWrapper";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { getAccessToken, getSelectecChannel } from "reducers/userReducer";

export const BrowseView: React.FC = () => {
  const accessToken = useSelector(getAccessToken);
  const channelId = useSelector(getSelectecChannel);
  const [rows, setRows] = React.useState<GridRowsProp>([]);

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

  const [criteria, setCriteria] = useState<IrcGetIrcRowsRequest | undefined>(undefined);

  const handleFetchRows = useCallback(
    (criteria: IrcGetIrcRowsRequest) => {
      const api = new IrcApi(new Configuration({ apiKey: `Bearer ${accessToken}` }));

      setCriteria(criteria);
      api.ircGetIrcRows(criteria).then((res) => {
        console.log(res);
        setRows(res.rows);
        setResponse(() => {
          return res;
        });
      });
    },
    [accessToken]
  );

  useEffect(() => {
    if (channelId) {
      handleFetchRows({ ...defaultCriteria, criteriaChannelId: channelId, criteriaPage: 0 });
    }
  }, [channelId, handleFetchRows, defaultCriteria]);

  const columns: GridColDef[] = [
    { field: "id", headerName: "Id", width: 150 },
    { field: "message", headerName: "Message", width: 150 },
    { field: "nick", headerName: "Nick", width: 150 },
    { field: "timeStamp", headerName: "Timestamp", width: 400 }
  ];

  return (
    <AppContentWrapper title="Browse">
      <div style={{ height: "500px", width: "100%" }}>
        <DataGrid
          rows={rows}
          rowCount={response?.totalRows ?? 0}
          page={criteria?.criteriaPage ?? 0}
          rowsPerPageOptions={[pageSize]}
          paginationMode="server"
          pageSize={pageSize}
          onPageChange={(page: number) => {
            handleFetchRows({ ...criteria, criteriaPage: page });
          }}
          columns={columns}
          pagination
        />
      </div>
    </AppContentWrapper>
  );
};
