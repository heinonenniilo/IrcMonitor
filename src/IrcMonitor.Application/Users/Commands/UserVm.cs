
using System.ComponentModel.DataAnnotations;

namespace IrcMonitor.Application.Users.Commands;
public class UserVm
{
    [Required]
    public string Email { get; set; }
    [Required]
    public string AccessToken { get; set; }
}
