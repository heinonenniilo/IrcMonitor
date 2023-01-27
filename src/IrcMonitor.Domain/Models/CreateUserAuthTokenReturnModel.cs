
namespace IrcMonitor.Domain.Models;
public class CreateUserAuthTokenReturnModel
{
    public List<string> Roles { get; set; }
    public string AccessToken { get; set; }
}
