import React from "react";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import { createStore } from "redux";
import { vi } from "vitest";
import { appRootReducer } from "setup/appRootReducer";
import { App } from "./App";
import { googleLogout } from "@react-oauth/google";

vi.mock("gapi-script", () => ({ gapi: { load: vi.fn() } }));
vi.mock("@react-oauth/google", () => ({ useGoogleLogin: () => vi.fn(), googleLogout: vi.fn() }));
vi.mock("framework/MenuBar", () => ({
  MenuBar: ({ handleLogOut, isLoggingOut }) =>
    <button onClick={handleLogOut} disabled={isLoggingOut}>Log out</button>
}));

const token = (expiresInSeconds: number) =>
  `header.${btoa(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + expiresInSeconds }))}.signature`;
const jsonResponse = (value: unknown) => new Response(JSON.stringify(value), {
  status: 200, headers: { "Content-Type": "application/json" }
});

function renderApp() {
  const store = createStore(appRootReducer);
  const view = render(
    <Provider store={store}>
      <MemoryRouter>
        <App><div>App content</div></App>
      </MemoryRouter>
    </Provider>
  );
  return { store, ...view };
}

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  vi.clearAllMocks();
});

test("restores the server user and token into Redux with credentials", async () => {
  const user = { email: "user@example.com", roles: ["Admin"], accessToken: token(3600) };
  const fetchMock = vi.fn(async (url: string) =>
    jsonResponse(url.endsWith("/api/Auth/user") ? user : { channels: [] }));
  vi.stubGlobal("fetch", fetchMock);
  const { store } = renderApp();

  await waitFor(() => expect(store.getState().user.userVm).toEqual(user));
  expect(store.getState().user.apiTokenInfo.accessToken).toBe(user.accessToken);
  expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining("/api/Auth/user"),
    expect.objectContaining({ method: "GET", credentials: "include", headers: {} }));
  await waitFor(() => expect(fetchMock).toHaveBeenCalledWith(
    expect.stringContaining("/api/Irc/"),
    expect.objectContaining({ headers: { Authorization: `Bearer ${user.accessToken}` } })
  ));
});

test.each([204, 401])("leaves visitors logged out for a %s session response", async (status) => {
  const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  const fetchMock = vi.fn(async () => new Response(null, { status }));
  vi.stubGlobal("fetch", fetchMock);
  const { store } = renderApp();

  await act(async () => {});
  expect(fetchMock).toHaveBeenCalledTimes(1);
  expect(store.getState().user.userVm).toBeUndefined();
  expect(errorSpy).not.toHaveBeenCalled();
  expect(screen.getByText("App content")).toBeInTheDocument();
});

test("refreshes an expired restored token before requesting channels", async () => {
  const user = { email: "user@example.com", roles: ["Admin"], accessToken: token(-3600) };
  const refreshedUser = { ...user, accessToken: token(3600) };
  const fetchMock = vi.fn(async (url: string) => {
    if (url.endsWith("/api/Auth/user")) return jsonResponse(user);
    if (url.endsWith("/api/Auth/google-refresh")) return jsonResponse(refreshedUser);
    return jsonResponse({ channels: [] });
  });
  vi.stubGlobal("fetch", fetchMock);
  const { store } = renderApp();

  await waitFor(() => expect(store.getState().user.userVm).toEqual(refreshedUser));
  expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining("/api/Auth/google-refresh"),
    expect.objectContaining({ credentials: "include", body: JSON.stringify({ email: user.email }) }));
  await waitFor(() => expect(fetchMock).toHaveBeenCalledWith(
    expect.stringContaining("/api/Irc/"),
    expect.objectContaining({ headers: { Authorization: `Bearer ${refreshedUser.accessToken}` } })
  ));
  expect(fetchMock.mock.calls.filter(([url]) => url.includes("/api/Irc/"))).toHaveLength(1);
});

test("asks for login again when refreshing the restored token fails", async () => {
  vi.spyOn(console, "error").mockImplementation(() => {});
  const user = { email: "user@example.com", roles: [], accessToken: token(-3600) };
  const fetchMock = vi.fn(async (url: string) => url.endsWith("/api/Auth/user")
    ? jsonResponse(user) : new Response(null, { status: 401 }));
  vi.stubGlobal("fetch", fetchMock);
  const { store } = renderApp();

  await waitFor(() => expect(store.getState().user.isReLogIn).toBe(true));
  expect(store.getState().user.isLoggingIn).toBe(false);
  expect(fetchMock.mock.calls.some(([url]) => url.includes("/api/Irc/"))).toBe(false);
});

test("does not restore a pending session after logout", async () => {
  let resolveSession: (response: Response) => void;
  vi.stubGlobal("fetch", vi.fn((url: string) => url.endsWith("/api/Auth/logout")
    ? Promise.resolve(new Response(null, { status: 204 }))
    : new Promise<Response>((resolve) => { resolveSession = resolve; })));
  const { store } = renderApp();
  await act(async () => {});
  fireEvent.click(screen.getByText("Log out"));

  await act(async () => {
    resolveSession(jsonResponse({ email: "user@example.com", roles: [], accessToken: token(3600) }));
  });
  expect(store.getState().user.userVm).toBeUndefined();
});

test("waits for server logout, sends credentials, and ignores duplicate clicks", async () => {
  const user = { email: "user@example.com", roles: [], accessToken: token(3600) };
  let resolveLogout: (response: Response) => void;
  const fetchMock = vi.fn((url: string) => {
    if (url.endsWith("/api/Auth/logout")) {
      return new Promise<Response>((resolve) => { resolveLogout = resolve; });
    }
    return Promise.resolve(jsonResponse(url.endsWith("/api/Auth/user") ? user : { channels: [] }));
  });
  vi.stubGlobal("fetch", fetchMock);
  const { store } = renderApp();
  await waitFor(() => expect(store.getState().user.userVm).toEqual(user));

  fireEvent.click(screen.getByText("Log out"));
  expect(screen.getByText("Log out")).toBeDisabled();
  fireEvent.click(screen.getByText("Log out"));
  await waitFor(() => expect(resolveLogout).toBeDefined());
  expect(fetchMock.mock.calls.filter(([url]) => url.endsWith("/api/Auth/logout"))).toHaveLength(1);
  expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining("/api/Auth/logout"),
    expect.objectContaining({ method: "POST", credentials: "include" }));
  expect(store.getState().user.userVm).toEqual(user);
  expect(googleLogout).not.toHaveBeenCalled();

  await act(async () => { resolveLogout(new Response(null, { status: 204 })); });
  expect(store.getState().user.userVm).toBeUndefined();
  expect(store.getState().user.apiTokenInfo).toBeUndefined();
  expect(store.getState().user.isReLogIn).toBe(false);
  expect(googleLogout).toHaveBeenCalledTimes(1);

});

test("keeps the session and allows retry when server logout fails", async () => {
  vi.spyOn(console, "error").mockImplementation(() => {});
  const user = { email: "user@example.com", roles: [], accessToken: token(3600) };
  let logoutFails = true;
  vi.stubGlobal("fetch", vi.fn(async (url: string) => {
    if (url.endsWith("/api/Auth/logout")) return new Response(null, { status: logoutFails ? 500 : 204 });
    return jsonResponse(url.endsWith("/api/Auth/user") ? user : { channels: [] });
  }));
  const { store } = renderApp();
  await waitFor(() => expect(store.getState().user.userVm).toEqual(user));

  fireEvent.click(screen.getByText("Log out"));
  expect(await screen.findByRole("alert")).toHaveTextContent("Unable to log out. Please try again.");
  expect(screen.getByText("Log out")).toBeEnabled();
  expect(store.getState().user.userVm).toEqual(user);
  expect(googleLogout).not.toHaveBeenCalled();

  logoutFails = false;
  fireEvent.click(screen.getByText("Log out"));
  await waitFor(() => expect(store.getState().user.userVm).toBeUndefined());
  expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  expect(googleLogout).toHaveBeenCalledTimes(1);
});

test("ignores a refresh response that arrives after successful logout", async () => {
  const user = { email: "user@example.com", roles: [], accessToken: token(-3600) };
  let resolveRefresh: (response: Response) => void;
  vi.stubGlobal("fetch", vi.fn((url: string) => {
    if (url.endsWith("/api/Auth/google-refresh")) {
      return new Promise<Response>((resolve) => { resolveRefresh = resolve; });
    }
    return Promise.resolve(url.endsWith("/api/Auth/user")
      ? jsonResponse(user) : new Response(null, { status: 204 }));
  }));
  const { store } = renderApp();
  await waitFor(() => expect(resolveRefresh).toBeDefined());
  fireEvent.click(screen.getByText("Log out"));
  await waitFor(() => expect(googleLogout).toHaveBeenCalledTimes(1));

  await act(async () => { resolveRefresh(jsonResponse({ ...user, accessToken: token(3600) })); });
  expect(store.getState().user.userVm).toBeUndefined();
  expect(store.getState().user.apiTokenInfo).toBeUndefined();
  expect(store.getState().user.isLoggingIn).toBe(false);
  expect(store.getState().user.isReLogIn).toBe(false);
});
