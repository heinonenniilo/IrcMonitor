import React from "react";
import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { createStore } from "redux";
import { vi } from "vitest";
import { appRootReducer } from "setup/appRootReducer";
import { userActions } from "actions/userActions";
import { useApiHook } from "./useApiHook";

vi.mock("utilities/tokenUtils", () => ({
  getTokenExpirationInformation: () => ({ isExpiring: false, hasExpired: false })
}));

afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

test("management requests use the current bearer token and the client clears on logout", async () => {
  const fetchMock = vi.fn().mockImplementation(async () => new Response(JSON.stringify({
    rows: [], fromRow: 0, toRow: 0, totalRows: 0
  }), { status: 200, headers: { "Content-Type": "application/json" } }));
  vi.stubGlobal("fetch", fetchMock);
  const store = createStore(appRootReducer);
  const wrapper = ({ children }) => <Provider store={store}>{children}</Provider>;
  const { result } = renderHook(() => useApiHook(), { wrapper });
  expect(result.current.managementApi).toBeUndefined();
  act(() => { store.dispatch(userActions.storeAccessToken("first-token")); });
  await waitFor(() => expect(result.current.managementApi).toBeDefined());
  await result.current.managementApi.managementGetProcessedLogFiles({ criteriaPage: 1 });
  expect(fetchMock).toHaveBeenLastCalledWith(
    expect.stringContaining("/api/Management/processed-log-files?Criteria.Page=1"),
    expect.objectContaining({ headers: { Authorization: "Bearer first-token" }, credentials: "include" })
  );
  act(() => { store.dispatch(userActions.storeAccessToken("second-token")); });
  await result.current.managementApi.managementGetProcessedLogFiles();
  expect(fetchMock).toHaveBeenLastCalledWith(expect.any(String),
    expect.objectContaining({ headers: { Authorization: "Bearer second-token" } }));
  act(() => { store.dispatch(userActions.clearUserInfo()); });
  expect(result.current.managementApi).toBeUndefined();
});
