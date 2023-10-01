using System.Text.Json;
using IrcMonitor.Application.Common.Interfaces;
using IrcMonitor.Domain.Models.Functions;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Extensions.Logging;

namespace IrcMonitor.RowInserterFunction.Functions;

public class RowInserter
{
    private readonly ILogger _logger;
    private readonly IRowInsertService _rowInsertService;
    public RowInserter(ILoggerFactory loggerFactory, IRowInsertService rowInsertService)
    {
        _logger = loggerFactory.CreateLogger<RowInserter>();
        _rowInsertService = rowInsertService;
    }

    [Function("RowInserter")]
    [QueueOutput("daily-aggregates")]
    public async Task<string> Run(
        [QueueTrigger("log-files-to-process")] string name,
        [BlobInput("irclogs/{queueTrigger}")] string content
        )
    {      
        _logger.LogInformation($"Start processing file with name {name}");
        var res = await _rowInsertService.ProcessFile(name, content);
        _logger.LogInformation($"Finished processing file with name {name}");

        if (res == null)
        {
            return null;
        }
        var retModel = new FormDailyAggregateModel()
        {
            ChannelId = res.Channel.Guid,
            Date = res.Date
        };
        string jsonString = JsonSerializer.Serialize(retModel);
        return jsonString;
    }
}