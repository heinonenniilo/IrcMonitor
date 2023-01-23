using System.ComponentModel.DataAnnotations;
namespace IrcMonitor.Domain.Models;


public class CriteriaBase
{
    [Required]
    public int Page { get; set; }
    [Required]
    public int PageSize { get; set; }

    public string SortColumn { get; set; }
    public bool IsAscendingOrder { get; set; }

    public bool SkipTotalRowCount { get; set; } = false;
}
