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

    public async Task UpdateChannelMonthlyStatistics(int channelId, int year, int month, int day)
    {
        // The new grouped rows, hour / channel / nick.
        var groupedQuery = _context.IrcRows.Where(x => x.Channel.Id == channelId &&

        x.TimeStamp.Year == year && x.TimeStamp.Month == month
        ).GroupBy(x => new { x.TimeStamp.Hour, x.ChannelId, x.Nick });

        var newRows =  groupedQuery.Select(x => new TimeGroupedRow() {
            Year = year,
            Month = month,
            Hour = x.Key.Hour,
            ChannelId = channelId,
            Count = x.Count(),
            Nick = x.Key.Nick
        });


        var curRows = _context.TimeGroupedRows.Where(x => x.ChannelId == channelId && x.Year == year && x.Month == month);

        return;
    }
}
