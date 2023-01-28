using System.ComponentModel.DataAnnotations;

namespace IrcMonitor.Domain.Models;

public class BarChartRow
{
    [Required]
    public string Label { get; set; }
    [Required]
    public int Identifier { get; set; }
    [Required]
    public int Value { get; set; }
}

