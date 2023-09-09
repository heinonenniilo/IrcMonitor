using IrcMonitor.WebUI.Controllers;
using Microsoft.AspNetCore.Mvc;
using Google.Apis.Auth;
using IrcMonitor.Application.Users.Commands;

namespace WebUI.Controllers;

public class AuthController: ApiControllerBase
{

    [HttpPost(template:"google")]
    public async Task<UserVm> GoogleAuth([FromBody] HandleGoogleLoginCommand command)
    {
        return await Mediator.Send(command);
    }

    [HttpPost(template: "google-auth-code")]
    public async Task<UserVm> GoogleAuthCode([FromBody] HandleGoogleAuthorizationCodeCommand command)
    {
        return await Mediator.Send(command);
    }
}
