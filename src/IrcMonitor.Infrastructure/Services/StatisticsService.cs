using IrcMonitor.Application.Common.Interfaces;
using IrcMonitor.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace IrcMonitor.Infrastructure.Services;
public class StatisticsService : IStatisticsService
{
    private readonly IApplicationDbContext _context;
    private readonly ILogger _logger;
    public StatisticsService(IApplicationDbContext context, ILoggerFactory loggerFactory)
    {
        _context = context;
        _logger = loggerFactory.CreateLogger<StatisticsService>();
    }
    public async Task PopulateChannelStatistics()
    {
        _logger.LogInformation("Start populating channel statistics");

        await _context.TimeGroupedRows.ExecuteDeleteAsync();

        var groupedQuery = _context.IrcRows.GroupBy(x => new { x.TimeStamp.Year, x.TimeStamp.Month, x.TimeStamp.Hour, x.ChannelId, x.Nick });

        await _context.TimeGroupedRows.AddRangeAsync(groupedQuery.Select(x => new TimeGroupedRow()
        {
            Nick = x.Key.Nick,
            ChannelId = x.Key.ChannelId,
            Hour = x.Key.Hour,
            Year = x.Key.Year,
            Month = x.Key.Month,
            Count = x.Count(),
            Updated = DateTime.UtcNow
        }));

        await _context.SaveChangesAsync(CancellationToken.None);

        _logger.LogInformation("Channel statistics populated");

    }
}
