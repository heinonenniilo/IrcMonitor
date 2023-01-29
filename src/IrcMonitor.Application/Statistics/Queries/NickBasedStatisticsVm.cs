using System.ComponentModel.DataAnnotations;
using IrcMonitor.Application.Statistics.Base;

namespace IrcMonitor.Application.Statistics.Queries;
public class NickBasedStatisticsVm: StatisticsVmBase
{
    public int ?Year { get; set; }
    public int? Month { get; set; }
}
