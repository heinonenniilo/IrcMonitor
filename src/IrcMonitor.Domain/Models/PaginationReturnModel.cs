namespace IrcMonitor.Domain.Models;
public class PaginationReturnModel<T>
{
    public IQueryable<T> Query { get; set; }
    public int FromRow { get; set; }
    public int ToRow { get; set; }
    public bool? IsLastPage { get; set; }
    public int? TotalCount { get; set; }
}
