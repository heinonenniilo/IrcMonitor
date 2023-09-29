
namespace IrcMonitor.Application.Common.Interfaces;
public interface IStatisticsService
{
    Task PopulateChannelStatistics(CancellationToken cancellationToken);


    Task UpdateChannelMonthlyStatistics(Guid channelId, int year, int month, int day, CancellationToken cancellationToken);
}
