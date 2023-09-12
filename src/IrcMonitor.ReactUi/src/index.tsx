import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import reportWebVitals from "./reportWebVitals";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { routes } from "utilities/routes";
import { App } from "framework/App";
import { Provider } from "react-redux";
import { appStore } from "setup/appStore";
import { HomeView } from "containers/HomeView";
import { BrowseView } from "containers/BrowseView";
import { OverViewStatisticsView } from "containers/OverviewStatisticsView";
import { YearlyStatisticsView } from "containers/YearlyStatistics";
import { GoogleOAuthProvider } from "@react-oauth/google";

const root = ReactDOM.createRoot(document.getElementById("root")!);
root.render(
  <Provider store={appStore}>
    <React.StrictMode>
      <BrowserRouter>
        <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_APP_ID}>
          <App>
            <Routes>
              <Route path={routes.main} element={<HomeView />} />
              <Route path={routes.statistics} element={<OverViewStatisticsView />} />
              <Route path={routes.browse} element={<BrowseView />} />
              <Route path={routes.yearlyStatistics} element={<YearlyStatisticsView />} />
            </Routes>
          </App>
        </GoogleOAuthProvider>
      </BrowserRouter>
    </React.StrictMode>
  </Provider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

/*
<GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_APP_ID}>
</GoogleOAuthProvider>
*/
