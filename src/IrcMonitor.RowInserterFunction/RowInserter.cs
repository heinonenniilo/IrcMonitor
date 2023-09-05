using System;
using System.IO;
using IrcMonitor.Application.Common.Interfaces;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Extensions.Logging;

namespace IrcMonitor.RowInserterFunction
{
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
        public async Task Run([BlobTrigger("irclogs/{name}", Connection = "storagestring")] string content, string name)
        {
            _logger.LogInformation($"Start processing file with name {name}");
            await _rowInsertService.ProcessFile(name, content);
            _logger.LogInformation($"Finished processing file with name {name}");
        }
    }
}
