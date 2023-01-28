using System.ComponentModel.DataAnnotations;
using IrcMonitor.Domain.Models;

namespace IrcMonitor.Application.Statistics.Queries;
public class OverviewStatisticsVm
{
    [Required]
    public List<BarChartRow> Rows { get; set; }
    [Required]
    public string ChannelName { get; set; }

}
