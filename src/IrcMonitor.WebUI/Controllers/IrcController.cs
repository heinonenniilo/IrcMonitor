using IrcMonitor.Application.Irc.Queries;
using IrcMonitor.WebUI.Controllers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
namespace WebUI.Controllers;

public class IrcController : ApiControllerBase
{
    
    [HttpGet(template: "rows")]
    [Authorize]
    public async Task<GetIrcRowsVm> GetIrcRows([FromQuery] GetIrcRowsQuery query)
    {
        return await Mediator.Send(query);
    }

    [HttpGet(template: "channels")]
    [Authorize]
    public async Task<GetIrcChannelsVm> GetIrcChannels([FromQuery] GetIrcChannelsQuery query)
    {
        return await Mediator.Send(query);
    }
}
