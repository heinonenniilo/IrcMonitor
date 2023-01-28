using IrcMonitor.Domain.Models;
namespace IrcMonitor.Application.Common.Interfaces;
public interface IPaginationService<T>
{
    Task<PaginationReturnModel<T>> CreateAsync(IQueryable<T> source, CriteriaBase criteria);
}
