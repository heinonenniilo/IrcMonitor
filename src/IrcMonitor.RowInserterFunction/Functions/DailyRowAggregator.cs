using IrcMonitor.Application.Common.Interfaces;
using IrcMonitor.Domain.Models;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Extensions.Logging;

namespace IrcMonitor.RowInserterFunction.Functions;

public class DailyRowAggregator
{
    private readonly ILogger _logger;
    private readonly IRowInsertService _rowInsertService;
    public DailyRowAggregator(ILoggerFactory loggerFactory, IRowInsertService rowInsertService)
    {
        _logger = loggerFactory.CreateLogger<RowInserter>();
        _rowInsertService = rowInsertService;
    }

    [Function("DailyRowAggregator")]
    public async Task Run([QueueTrigger("daily-aggregates")] ProcessLogFileReturnModel content, FunctionContext context)
    {
        Console.WriteLine(content);
    }
}
