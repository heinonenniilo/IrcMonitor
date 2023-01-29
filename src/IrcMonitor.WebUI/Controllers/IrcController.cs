using IrcMonitor.Application.Irc.Queries;
using IrcMonitor.Application.Statistics.Base;
using IrcMonitor.Application.Statistics.Queries;
using IrcMonitor.WebUI.Controllers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
namespace WebUI.Controllers;

[Authorize(Roles = "Viewer,Admin")]
public class IrcController : ApiControllerBase
{

    [HttpGet(template: "rows")]
    
    public async Task<GetIrcRowsVm> GetIrcRows([FromQuery] GetIrcRowsQuery query)
    {
        return await Mediator.Send(query);
    }

    [HttpGet(template: "channels")]
    public async Task<GetIrcChannelsVm> GetIrcChannels([FromQuery] GetIrcChannelsQuery query)
    {
        return await Mediator.Send(query);
    }

    // TODO COMBINE

    [HttpGet(template: "statistics/{channelId}")]
    public async Task<OverviewStatisticsVm> GetOverviewStatistics([FromRoute] Guid channelId)
    {
        return await Mediator.Send(new GetOverviewStatisticsQuery(channelId));
    }

    [HttpGet(template: "statistics/{channelId}/{year}")]
    public async Task<YearlyStatisticsVm> GetYearlyStatistics([FromRoute] Guid channelId, [FromRoute] int year)
    {
        return await Mediator.Send(new GetYearlyStatisticsQuery(year, channelId));
    }

    [HttpGet(template: "statistics/nicks/{channelId}")]
    public async Task<StatisticsVmBase> GetNickBasedStatistics([FromRoute] Guid channelId, [FromQuery] int? year, [FromQuery] int? month)
    {
        return await Mediator.Send(new GetStatisticsPerNickQuery(channelId, year, month));
    }

    [HttpGet(template: "statistics/hourly/{channelId}")]
    [Authorize(Roles = "Viewer,Admin")]
    public async Task<StatisticsVmBase> GetHourlyStatistics([FromRoute] Guid channelId, [FromQuery] int? year, [FromQuery] int? month, [FromQuery] string? nick)
    {
        return await Mediator.Send(new GetHourlyStatiscticsQuery()
        {
            ChannelId = channelId,
            Year = year,
            Month = month,
            Nick = nick
        });
    }
}
