using IrcMonitor.Application.Common.Interfaces;
using IrcMonitor.Domain.Models.Functions;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Extensions.Logging;

namespace IrcMonitor.RowInserterFunction.Functions;

public class DailyRowAggregator
{
    private readonly ILogger _logger;
    private readonly IStatisticsService _statisticsService;
    public DailyRowAggregator(ILoggerFactory loggerFactory, IStatisticsService statisticsService)
    {
        _logger = loggerFactory.CreateLogger<RowInserter>();
        _statisticsService = statisticsService;
    }

    [Function("DailyRowAggregator")]
    public async Task Run([QueueTrigger("%DailyAggregatesQueueName%")] FormDailyAggregateModel content, FunctionContext context)
    {
        _logger.LogInformation($"Daily aggregate for channel id {content.ChannelId} / date {content.Date} triggered");

        await _statisticsService.UpdateChannelMonthlyStatistics(content.ChannelId, content.Date.Year, content.Date.Month, content.Date.Day, context.CancellationToken);

        _logger.LogInformation($"Daily aggregates formed for channel id {content.ChannelId}");

    }
}
