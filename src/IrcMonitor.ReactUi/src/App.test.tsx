import React from "react";
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { createStore } from "redux";
import { HomeView } from "containers/HomeView";
import { appRootReducer } from "setup/appRootReducer";

test("prompts visitors to log in", () => {
  render(
    <Provider store={createStore(appRootReducer)}>
      <HomeView />
    </Provider>
  );
  expect(screen.getByText("Please, login")).toBeInTheDocument();
});
