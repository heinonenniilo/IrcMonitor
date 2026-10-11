import { Alert, Box, Button, MenuItem, TextField } from "@mui/material";
import { DataGrid, GridColDef, GridSortModel } from "@mui/x-data-grid";
import { DesktopDatePicker } from "@mui/x-date-pickers";
import { GetProcessedLogFilesVm, ManagementGetProcessedLogFilesRequest } from "api";
import { AppContentWrapper } from "framework/AppContentWrapper";
import { useApiHook } from "hooks/useApiHook";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { getChannels } from "reducers/userReducer";

const defaultCriteria: ManagementGetProcessedLogFilesRequest = {
  criteriaPage: 0,
  criteriaPageSize: 100,
  criteriaSortColumn: "created",
  criteriaIsAscendingOrder: false,
  criteriaSkipTotalRowCount: false
};

const columns: GridColDef[] = [
  { field: "fileName", headerName: "File name", minWidth: 250, flex: 1 },
  { field: "channel", headerName: "Channel", minWidth: 140, sortable: false },
  { field: "rowCount", headerName: "Rows", type: "number", minWidth: 100 },
  {
    field: "created", headerName: "Processed at", minWidth: 180,
    valueFormatter: ({ value }) => value ? moment(value).format("DD.MM.YYYY HH:mm:ss") : ""
  }
];

export const ProcessedLogFilesView: React.FC = () => {
  const { managementApi } = useApiHook();
  const channels = useSelector(getChannels);
  const [criteria, setCriteria] = useState(defaultCriteria);
  const [response, setResponse] = useState<GetProcessedLogFilesVm>();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>();
  const [fileName, setFileName] = useState("");
  const [channelId, setChannelId] = useState("");
  const [from, setFrom] = useState<moment.Moment | null>(null);
  const [to, setTo] = useState<moment.Moment | null>(null);
  const [reload, setReload] = useState(0);
  const invalidDateRange = Boolean(from?.isValid() && to?.isValid() && from.isAfter(to, "day"));
  const invalidDates = Boolean((from && !from.isValid()) || (to && !to.isValid()) || invalidDateRange);

  useEffect(() => {
    if (!managementApi) return;
    const controller = new AbortController();
    setIsLoading(true);
    setError(undefined);
    managementApi.managementGetProcessedLogFiles(criteria, { signal: controller.signal })
      .then((result) => {
        if (!controller.signal.aborted) setResponse(result);
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setResponse(undefined);
          setError("Could not load processed log files. Please try again.");
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });
    return () => controller.abort();
  }, [managementApi, criteria, reload]);

  const sortModel: GridSortModel = [{
    field: criteria.criteriaSortColumn ?? "created",
    sort: criteria.criteriaIsAscendingOrder ? "asc" : "desc"
  }];

  return (
    <AppContentWrapper
      titleParts={[{ text: "Manage" }, { text: "Processed log files" }]}
      leftMenu={
        <Box component="form" sx={{ display: "flex", flexDirection: "column", gap: 2 }}
          onSubmit={(event) => {
            event.preventDefault();
            if (invalidDates) return;
            setCriteria((current) => ({
              ...current, criteriaPage: 0,
              criteriaFileName: fileName.trim() || undefined,
              criteriaChannelId: channelId || undefined,
              criteriaFrom: from ? moment(from).startOf("day").toDate() : undefined,
              criteriaTo: to ? moment(to).endOf("day").toDate() : undefined
            }));
          }}>
          <TextField label="File name" value={fileName} onChange={(event) => setFileName(event.target.value)} />
          <TextField select label="Channel" value={channelId} onChange={(event) => setChannelId(event.target.value)}>
            <MenuItem value="">All channels</MenuItem>
            {channels.map((channel) => (
              <MenuItem key={channel.guid} value={channel.guid}>{channel.name}</MenuItem>
            ))}
          </TextField>
          <DesktopDatePicker label="From" inputFormat="DD.MM.YYYY"
            value={from} onChange={(value) => setFrom(value)}
            renderInput={(params) => <TextField {...params} />} />
          <DesktopDatePicker label="To" inputFormat="DD.MM.YYYY"
            value={to} onChange={(value) => setTo(value)}
            renderInput={(params) => <TextField {...params}
              error={params.error || invalidDateRange}
              helperText={invalidDateRange ? "To must be on or after From." : params.helperText} />} />
          <Button type="submit" variant="outlined" disabled={invalidDates}>Search</Button>
        </Box>
      }
    >
      {error && <Alert severity="error" sx={{ mb: 2 }}
        action={<Button color="inherit" onClick={() => setReload((value) => value + 1)}>Retry</Button>}>
        {error}
      </Alert>}
      <DataGrid
        rows={response?.rows ?? []}
        columns={columns}
        rowCount={response?.totalRows ?? 0}
        page={criteria.criteriaPage ?? 0}
        pageSize={criteria.criteriaPageSize ?? 100}
        rowsPerPageOptions={[30, 50, 100]}
        pagination paginationMode="server" sortingMode="server"
        sortModel={sortModel}
        sortingOrder={["asc", "desc"]}
        onPageChange={(page) => setCriteria((current) => ({ ...current, criteriaPage: page }))}
        onPageSizeChange={(pageSize) => setCriteria((current) => ({
          ...current, criteriaPage: 0, criteriaPageSize: pageSize
        }))}
        onSortModelChange={(model) => setCriteria((current) => ({
          ...current, criteriaPage: 0,
          criteriaSortColumn: model[0]?.field ?? "created",
          criteriaIsAscendingOrder: model[0] ? model[0].sort === "asc" : false
        }))}
        loading={isLoading}
        density="compact"
        disableColumnFilter
        disableSelectionOnClick
        localeText={{ noRowsLabel: "No processed log files found" }}
      />
    </AppContentWrapper>
  );
};
