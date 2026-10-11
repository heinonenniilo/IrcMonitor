using IrcMonitor.Domain.Models;

namespace IrcMonitor.Application.Management.Queries;
public class GetProcessedLogFilesCriteria : CriteriaBase
{
    public Guid? ChannelId { get; set; }
    public string? FileName { get; set; }
    public DateTime? From { get; set; }
    public DateTime? To { get; set; }
}
