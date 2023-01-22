using IrcMonitor.Application.Common.Security;
using IrcMonitor.Application.Irc.Queries;
using IrcMonitor.WebUI.Controllers;
using Microsoft.AspNetCore.Mvc;

namespace WebUI.Controllers;
[Authorize]
public class IrcController : ApiControllerBase
{
    
    [HttpGet(template: "rows")]

    public async Task<GetIrcRowsVm> GetIrcRows([FromQuery] GetIrcRowsQuery query)
    {
        return await Mediator.Send(query);
    }
}
