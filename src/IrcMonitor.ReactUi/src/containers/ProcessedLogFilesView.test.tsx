import React from "react";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { createStore } from "redux";
import { vi } from "vitest";
import { appRootReducer } from "setup/appRootReducer";
import { userActions } from "actions/userActions";
import { AuthorizedComponent } from "framework/AuthorizedComponent";
import { RoleNames } from "enums/RoleEnums";
import { ProcessedLogFilesView } from "./ProcessedLogFilesView";

const api = vi.hoisted(() => ({ managementGetProcessedLogFiles: vi.fn() }));
vi.mock("hooks/useApiHook", () => ({ useApiHook: () => ({ managementApi: api }) }));
vi.mock("framework/AppContentWrapper", () => ({
  AppContentWrapper: ({ children, leftMenu }) => <div>{leftMenu}{children}</div>
}));
vi.mock("@mui/x-data-grid", () => ({
  DataGrid: (props) => <div>
    {props.rows.map((row) => <span key={row.id}>{row.fileName}</span>)}
    <span>Page {props.page}</span>
    <button onClick={() => props.onPageChange(props.page + 1)}>Next page</button>
    <button onClick={() => props.onPageSizeChange(30)}>30 per page</button>
    <button onClick={() => props.onSortModelChange([{ field: "fileName", sort: "asc" }])}>Sort files</button>
  </div>
}));

afterEach(() => { cleanup(); vi.clearAllMocks(); });

function renderView(role?: RoleNames) {
  const store = createStore(appRootReducer);
  if (role) store.dispatch(userActions.storeUserInfo({ roles: [role], email: "admin@example.com", accessToken: "token" }));
  render(<Provider store={store}>
    <AuthorizedComponent requiredRole={RoleNames.Admin}>
      <ProcessedLogFilesView />
    </AuthorizedComponent>
  </Provider>);
}

test.each([undefined, RoleNames.Viewer])("does not mount or fetch for role %s", (role) => {
  renderView(role);
  expect(api.managementGetProcessedLogFiles).not.toHaveBeenCalled();
  expect(screen.queryByRole("button", { name: "Search" })).not.toBeInTheDocument();
});

test("admin browses server pages and resets paging when changing filters, size or sort", async () => {
  api.managementGetProcessedLogFiles.mockResolvedValue({
    rows: [{ id: 1, fileName: "channel.log" }], totalRows: 200, fromRow: 0, toRow: 100
  });
  renderView(RoleNames.Admin);
  await screen.findByText("channel.log");
  fireEvent.click(screen.getByText("Next page"));
  await waitFor(() => expect(api.managementGetProcessedLogFiles).toHaveBeenLastCalledWith(
    expect.objectContaining({ criteriaPage: 1, criteriaPageSize: 100 }), expect.anything()
  ));
  fireEvent.change(screen.getByLabelText("File name"), { target: { value: "channel" } });
  fireEvent.click(screen.getByRole("button", { name: "Search" }));
  await waitFor(() => expect(api.managementGetProcessedLogFiles).toHaveBeenLastCalledWith(
    expect.objectContaining({ criteriaPage: 0, criteriaFileName: "channel" }), expect.anything()
  ));
  fireEvent.click(screen.getByText("30 per page"));
  await waitFor(() => expect(api.managementGetProcessedLogFiles).toHaveBeenLastCalledWith(
    expect.objectContaining({ criteriaPage: 0, criteriaPageSize: 30 }), expect.anything()
  ));
  await act(async () => { fireEvent.click(screen.getByText("Sort files")); });
  await waitFor(() => expect(api.managementGetProcessedLogFiles).toHaveBeenLastCalledWith(
    expect.objectContaining({ criteriaSortColumn: "fileName", criteriaIsAscendingOrder: true }), expect.anything()
  ));
});

test("failed requests offer a retry", async () => {
  api.managementGetProcessedLogFiles.mockRejectedValueOnce(new Error("Unavailable"))
    .mockResolvedValueOnce({ rows: [], totalRows: 0, fromRow: 0, toRow: 0 });
  renderView(RoleNames.Admin);
  const retry = await screen.findByRole("button", { name: "Retry" });
  await act(async () => { fireEvent.click(retry); });
  await waitFor(() => expect(screen.queryByRole("alert")).not.toBeInTheDocument());
  expect(api.managementGetProcessedLogFiles).toHaveBeenCalledTimes(2);
});
