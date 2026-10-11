import React from "react";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { createStore } from "redux";
import { vi } from "vitest";
import { userActions } from "actions/userActions";
import { appRootReducer } from "setup/appRootReducer";
import { routes } from "utilities/routes";
import { DesktopMenu } from "./DesktopMenu";
import { MobileMenu } from "./MobileMenu";

vi.mock("components/UserMenu", () => ({ UserMenu: () => null }));
vi.mock("components/SelectChannel", () => ({ SelectChannel: () => null }));
vi.mock("components/HeaderBrand", () => ({ HeaderBrand: () => null }));

afterEach(cleanup);

test.each(["desktop", "mobile"])("%s Manage opens a submenu before navigating", async (variant) => {
  const store = createStore(appRootReducer);
  store.dispatch(userActions.storeUserInfo({ email: "admin@example.com", accessToken: "token", roles: ["Admin"] }));
  const onNavigate = vi.fn();
  const Component = variant === "desktop" ? DesktopMenu : MobileMenu;
  render(<Provider store={store}>
    <Component onNavigate={onNavigate} onLogin={() => {}} onLogOut={() => {}} onSelectChannel={() => {}} />
  </Provider>);
  if (variant === "mobile") fireEvent.click(screen.getByRole("button", { name: "menu" }));
  expect(screen.queryByText("Processed log files")).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole("menuitem", { name: "Manage" }));
  expect(onNavigate).not.toHaveBeenCalled();
  fireEvent.click(await screen.findByRole("menuitem", { name: "Processed log files" }));
  expect(onNavigate).toHaveBeenCalledWith(routes.processedLogFiles);
  await waitFor(() => expect(screen.queryByText("Processed log files")).not.toBeInTheDocument());
});

test.each(["desktop", "mobile"])("%s hides Manage for viewers", (variant) => {
  const store = createStore(appRootReducer);
  store.dispatch(userActions.storeUserInfo({ email: "viewer@example.com", accessToken: "token", roles: ["Viewer"] }));
  const Component = variant === "desktop" ? DesktopMenu : MobileMenu;
  render(<Provider store={store}>
    <Component onNavigate={() => {}} onLogin={() => {}} onLogOut={() => {}} onSelectChannel={() => {}} />
  </Provider>);
  if (variant === "mobile") fireEvent.click(screen.getByRole("button", { name: "menu" }));
  expect(screen.queryByText("Manage")).not.toBeInTheDocument();
});
