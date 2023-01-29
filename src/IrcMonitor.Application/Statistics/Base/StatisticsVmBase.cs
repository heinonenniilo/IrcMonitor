using IrcMonitor.Domain.Models;

namespace IrcMonitor.Application.Statistics.Base;
public class StatisticsVmBase
{
    public List<BarChartRow> Rows { get; set; } = new List<BarChartRow>();
}
