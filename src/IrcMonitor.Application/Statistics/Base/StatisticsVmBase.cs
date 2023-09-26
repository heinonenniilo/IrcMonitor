using System.ComponentModel.DataAnnotations;
using IrcMonitor.Domain.Models;

namespace IrcMonitor.Application.Statistics.Base;
public class StatisticsVmBase
{
    [Required]
    public List<BarChartRow> Rows { get; set; } = new List<BarChartRow>();
    [Required]
    public required Guid ChannelId { get; set; }
    public int ?Year { get; set; }
}
