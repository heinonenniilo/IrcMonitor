using IrcMonitor.Domain.Models;

namespace IrcMonitor.Application.Statistics.Queries;
public class YearlyStatisticsVm
{
    public List<BarChartRow> MonthlyRows { get; set; } 

    public List<BarChartRow> HourlyRows { get; set; }

    public string Channel { get; set; }

    public int Year { get; set; }
}
