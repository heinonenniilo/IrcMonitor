import { StatisticsVmBase } from "api";
import { Action } from "redux";

export enum IrcActionTypes {
  StoreChannelYearlyStatistics = "IRC/StoreYearlyStatistics",
  StoreChannelOverViewStatistics = "IRC/StoreOverviewStatistics"
}

export interface StoreChannelYearlyStatistics extends Action {
  type: IrcActionTypes.StoreChannelYearlyStatistics;
  statistics: StatisticsVmBase | undefined;
}

export interface StoreChannelOverviewStatistics extends Action {
  type: IrcActionTypes.StoreChannelOverViewStatistics;
  statistics: StatisticsVmBase | undefined;
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
  })
};

export type IrcActions = StoreChannelOverviewStatistics | StoreChannelYearlyStatistics;
