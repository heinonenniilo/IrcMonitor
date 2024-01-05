import { IrcActionTypes, IrcActions } from "actions/ircActions";
import { StatisticsVmBase } from "api";
import { NickWithCount } from "components/YearlyViewMenu";
import { produce } from "immer";
import { AppState } from "setup/appRootReducer";

export interface IrcState {
  channelYearlyNicks: StatisticsVmBase | undefined;
  channelOverviewNicks: StatisticsVmBase | undefined;
  selectedNicks: string[];
  yearlyNicksWithCount: NickWithCount[];
  overviewNicksWithCount: NickWithCount[];
}

const defaultState: IrcState = {
  channelOverviewNicks: undefined,
  channelYearlyNicks: undefined,
  selectedNicks: [],
  yearlyNicksWithCount: [],
  overviewNicksWithCount: []
};

export function ircReducer(state: IrcState = defaultState, action: IrcActions): IrcState {
  switch (action.type) {
    case IrcActionTypes.StoreChannelOverViewStatistics:
      state = produce(state, (draft) => {
        draft.channelOverviewNicks = action.statistics;
        const nicksWithCount: NickWithCount[] = action.statistics.rows.labels.map((r, i) => {
          return {
            nick: r,
            count: action.statistics.rows.dataSets[0].values[i]
          };
        });
        draft.overviewNicksWithCount = nicksWithCount;
      });
      break;
    case IrcActionTypes.StoreChannelYearlyStatistics:
      state = produce(state, (draft) => {
        draft.channelYearlyNicks = action.statistics;

        const nicksWithCount: NickWithCount[] = action.statistics.rows.labels.map((r, i) => {
          return {
            nick: r,
            count: action.statistics.rows.dataSets[0].values[i]
          };
        });

        draft.yearlyNicksWithCount = nicksWithCount;
      });
      break;

    case IrcActionTypes.StoreSelectedNicks:
      state = produce(state, (draft) => {
        draft.selectedNicks = action.nicks;
      });
      break;
  }
  return state;
}

export const getChannelYearlyNicks = (state: AppState): StatisticsVmBase | undefined =>
  state.irc.channelYearlyNicks;

export const getChannelOverviewNicks = (state: AppState): StatisticsVmBase | undefined =>
  state.irc.channelOverviewNicks;

export const getSelectedNicks = (state: AppState): string[] => state.irc.selectedNicks;

export const getYearlyNicksWithCount = (state: AppState): NickWithCount[] =>
  state.irc.yearlyNicksWithCount;

export const getOverviewNicksWithCount = (state: AppState): NickWithCount[] =>
  state.irc.overviewNicksWithCount;
