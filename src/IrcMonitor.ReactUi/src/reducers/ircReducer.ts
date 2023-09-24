import { IrcActionTypes, IrcActions } from "actions/ircActions";
import { StatisticsVmBase } from "api";
import { produce } from "immer";
import { AppState } from "setup/appRootReducer";

export interface IrcState {
  channelYearlyNicks: StatisticsVmBase | undefined;
  channelOverviewNicks: StatisticsVmBase | undefined;
}

const defaultState: IrcState = {
  channelOverviewNicks: undefined,
  channelYearlyNicks: undefined
};

export function ircReducer(state: IrcState = defaultState, action: IrcActions): IrcState {
  switch (action.type) {
    case IrcActionTypes.StoreChannelOverViewStatistics:
      state = produce(state, (draft) => {
        draft.channelOverviewNicks = action.statistics;
      });
      break;
    case IrcActionTypes.StoreChannelYearlyStatistics:
      state = produce(state, (draft) => {
        draft.channelYearlyNicks = action.statistics;
      });
      break;
  }
  return state;
}

export const getChannelYearlyNicks = (state: AppState): StatisticsVmBase | undefined =>
  state.irc.channelYearlyNicks;

export const getChannelOverviewNicks = (state: AppState): StatisticsVmBase | undefined =>
  state.irc.channelOverviewNicks;
