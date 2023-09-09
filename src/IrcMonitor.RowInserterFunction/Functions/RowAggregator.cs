using System.Net;
using IrcMonitor.Application.Common.Interfaces;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;

namespace IrcMonitor.RowInserterFunction.Functions
{
    public class RowAggregator
    {
        private readonly ILogger _logger;
        private readonly IStatisticsService _statisticsService;
        public RowAggregator(ILoggerFactory loggerFactory, IStatisticsService statisticsService)
        {
            _logger = loggerFactory.CreateLogger<RowAggregator>();
            _statisticsService = statisticsService;
        }

        [Function("RowAggregator")]
        public async Task<HttpResponseData> Run([HttpTrigger(AuthorizationLevel.Function, "get", "post")] HttpRequestData req)
        {
            _logger.LogInformation("C# HTTP trigger function processed a request.");

            var response = req.CreateResponse(HttpStatusCode.OK);

            await _statisticsService.PopulateChannelStatistics();
            
            response.Headers.Add("Content-Type", "text/plain; charset=utf-8");

            response.WriteString("Rows updated!");

            return response;
        }
    }
}
