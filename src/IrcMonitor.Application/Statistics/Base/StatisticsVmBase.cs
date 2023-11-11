using System.ComponentModel.DataAnnotations;
using IrcMonitor.Domain.Models;

namespace IrcMonitor.Application.Statistics.Base;
public class StatisticsVmBase
{
    [Required]
    public BarChartReturnModel Rows { get; set; } = new BarChartReturnModel();
    [Required]
    public required Guid ChannelId { get; set; }
    public int ?Year { get; set; }
}
