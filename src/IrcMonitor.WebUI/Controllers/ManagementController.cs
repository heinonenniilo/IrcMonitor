using IrcMonitor.Application.Management.Queries;
using IrcMonitor.WebUI.Controllers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
namespace WebUI.Controllers;

[Authorize(Roles = "Admin")]
public class ManagementController : ApiControllerBase
{
    [HttpGet(template: "processed-log-files")]
    public async Task<GetProcessedLogFilesVm> GetProcessedLogFiles([FromQuery] GetProcessedLogFilesQuery query)
    {
        return await Mediator.Send(query);
    }
}
