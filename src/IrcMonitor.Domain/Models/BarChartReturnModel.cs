using System.ComponentModel.DataAnnotations;

namespace IrcMonitor.Domain.Models;

public class BarChartReturnModel
{
    [Required]
    public List<string> Labels { get; set; }
    [Required]
    public List<int> Identifiers { get; set; }
    [Required]
    public List<BarCharDataSet> DataSets { get; set; }
}

public class BarCharDataSet
{
    [Required]
    public string Label { get; set; }
    [Required]
    public List<int> Values { get; set; }
}

