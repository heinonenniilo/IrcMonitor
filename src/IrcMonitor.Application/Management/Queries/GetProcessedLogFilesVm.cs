using System.ComponentModel.DataAnnotations;

namespace IrcMonitor.Application.Management.Queries;
public class GetProcessedLogFilesVm
{
    [Required]
    public List<ProcessedLogFileDto> Rows { get; set; }

    [Required]
    public int FromRow { get; set; }
    [Required]
    public int ToRow { get; set; }

    public bool? IsLastPage { get; set; }

    public int? TotalRows { get; set; }
}
