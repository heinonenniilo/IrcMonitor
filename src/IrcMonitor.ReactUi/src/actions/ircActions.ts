import { StatisticsVmBase } from "api";
import { Action } from "redux";

export enum IrcActionTypes {
  StoreChannelYearlyStatistics = "IRC/StoreYearlyStatistics",
  StoreChannelOverViewStatistics = "IRC/StoreOverviewStatistics",
  StoreSelectedNicks = "IRC/StoreSelectedNicks"
}

export interface StoreChannelYearlyStatistics extends Action {
  type: IrcActionTypes.StoreChannelYearlyStatistics;
  statistics: StatisticsVmBase | undefined;
}

export interface StoreChannelOverviewStatistics extends Action {
  type: IrcActionTypes.StoreChannelOverViewStatistics;
  statistics: StatisticsVmBase | undefined;
}

export interface StoreSelectedNicks extends Action {
  type: IrcActionTypes.StoreSelectedNicks;
  nicks: string[];
}

export const ircActions = {
  storeChannelYearlyStatistics: (
    statistics: StatisticsVmBase | undefined
  ): StoreChannelYearlyStatistics => ({
    type: IrcActionTypes.StoreChannelYearlyStatistics,
    statistics
  }),
  storeChannelOverviewStatistics: (
    statistics: StatisticsVmBase | undefined
  ): StoreChannelOverviewStatistics => ({
    type: IrcActionTypes.StoreChannelOverViewStatistics,
    statistics
  }),
  storeSelectedNicks: (nicks: string[]): StoreSelectedNicks => ({
    type: IrcActionTypes.StoreSelectedNicks,
    nicks
  })
};

export type IrcActions =
  | StoreChannelOverviewStatistics
  | StoreChannelYearlyStatistics
  | StoreSelectedNicks;
