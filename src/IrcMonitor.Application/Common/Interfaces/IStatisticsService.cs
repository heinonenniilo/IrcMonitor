
namespace IrcMonitor.Application.Common.Interfaces;
public interface IStatisticsService
{
    Task PopulateChannelStatistics();


    Task UpdateChannelMonthlyStatistics(int channelId, int year, int month, int day);
}
