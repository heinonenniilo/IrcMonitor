using System.ComponentModel.DataAnnotations;

namespace IrcMonitor.Application.Irc.Queries;
public class GetIrcRowsVm
{
    [Required]
    public List<IrcRowDto> Rows { get; set; }
}
