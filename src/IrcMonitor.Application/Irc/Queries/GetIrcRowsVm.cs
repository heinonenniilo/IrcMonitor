using System.ComponentModel.DataAnnotations;

namespace IrcMonitor.Application.Irc.Queries;
public class GetIrcRowsVm
{
    [Required]
    public List<IrcRowDto> Rows { get; set; }

    [Required]
    public int FromRow { get; set; }
    [Required]
    public int ToRow { get; set; }

    public int ?TotalRows { get; set; }
}
