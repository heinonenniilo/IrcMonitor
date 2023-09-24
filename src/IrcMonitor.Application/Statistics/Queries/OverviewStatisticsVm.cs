using System.ComponentModel.DataAnnotations;
using IrcMonitor.Application.Statistics.Base;

namespace IrcMonitor.Application.Statistics.Queries;
public class OverviewStatisticsVm: StatisticsVmBase
{
    [Required]
    public string ChannelName { get; set; }
}
