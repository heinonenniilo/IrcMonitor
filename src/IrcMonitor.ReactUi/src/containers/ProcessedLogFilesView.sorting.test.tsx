import React from "react";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { createStore } from "redux";
import { vi } from "vitest";
import { appRootReducer } from "setup/appRootReducer";
import { ProcessedLogFilesView } from "./ProcessedLogFilesView";

const api = vi.hoisted(() => ({ managementGetProcessedLogFiles: vi.fn() }));
vi.mock("hooks/useApiHook", () => ({ useApiHook: () => ({ managementApi: api }) }));
vi.mock("@mui/x-data-grid", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@mui/x-data-grid")>();
  return {
    ...actual,
    DataGrid: (props) => <actual.DataGrid {...props} disableVirtualization />
  };
});
vi.mock("framework/AppContentWrapper", () => ({
  AppContentWrapper: ({ children }) => <div style={{ width: 1000, height: 600 }}>{children}</div>
}));

afterEach(() => { cleanup(); vi.clearAllMocks(); });

test.each([
  ["Processed at", "created"],
  ["Rows", "rowCount"],
  ["File name", "fileName"]
])("%s toggles between descending and ascending server sorting", async (headerName, field) => {
  api.managementGetProcessedLogFiles.mockResolvedValue({ rows: [], totalRows: 200 });
  await act(async () => {
    render(<Provider store={createStore(appRootReducer)}><ProcessedLogFilesView /></Provider>);
  });
  const header = await screen.findByRole("columnheader", { name: new RegExp(headerName) });
  const expectOrder = async (ascending: boolean) => {
    await waitFor(() => expect(api.managementGetProcessedLogFiles).toHaveBeenLastCalledWith(
      expect.objectContaining({
        criteriaSortColumn: field, criteriaIsAscendingOrder: ascending, criteriaPage: 0
      }), expect.anything()
    ));
    expect(header).toHaveAttribute("aria-sort", ascending ? "ascending" : "descending");
  };
  if (field !== "created") {
    await act(async () => { fireEvent.click(header); });
    await expectOrder(true);
    await act(async () => { fireEvent.click(header); });
  }
  await expectOrder(false);
  await act(async () => { fireEvent.click(header); });
  await expectOrder(true);
  await act(async () => { fireEvent.click(header); });
  await expectOrder(false);
  await act(async () => { fireEvent.click(header); });
  await expectOrder(true);
});
