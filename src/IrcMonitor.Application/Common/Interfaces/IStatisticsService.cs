
namespace IrcMonitor.Application.Common.Interfaces;
public interface IStatisticsService
{
    Task PopulateChannelStatistics(CancellationToken cancellationToken);


    Task UpdateChannelMonthlyStatistics(int channelId, int year, int month, int day, CancellationToken cancellationToken);
}
