using System.Linq.Dynamic.Core;
using IrcMonitor.Application.Common.Interfaces;
using IrcMonitor.Domain.Models;
using Microsoft.EntityFrameworkCore;

namespace IrcMonitor.Infrastructure.Services;
public class PaginationService<T> : IPaginationService<T>
{
    public async Task<PaginationReturnModel<T>> CreateAsync(IQueryable<T> source, CriteriaBase criteria)
    {
        var count = criteria.SkipTotalRowCount ? 0 : await source.CountAsync();
        if (!string.IsNullOrEmpty(criteria.SortColumn))
        {

            var sortOrderString = criteria.IsAscendingOrder ? "ASC" : "DESC";
            var orderByString = $"{criteria.SortColumn} {sortOrderString}";
            source = source.OrderBy(orderByString);
        }

        int startingRow;
        int endingRow;
        source = source.Skip(
                (criteria.Page) * criteria.PageSize)
            .Take(criteria.PageSize);
        startingRow = criteria.PageSize * criteria.Page;
        endingRow = criteria.PageSize * criteria.Page + (criteria.PageSize - 1);

        return new PaginationReturnModel<T>
        {
            Query = source,
            FromRow = startingRow,
            ToRow = endingRow,
            TotalCount = count,
            IsLastPage = criteria.SkipTotalRowCount ? null : endingRow > count
        };
    }
}

