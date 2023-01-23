using System.ComponentModel.DataAnnotations;
using IrcMonitor.Domain.Models;

namespace IrcMonitor.Application.Irc.Queries;
public class GetIrcRowsCriteria: CriteriaBase
{
    public DateTime? From { get; set; }
    public DateTime? To { get; set; }

    [Required]
    public int ChannelId { get; set; }
}
