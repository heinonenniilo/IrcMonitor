using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Linq.Dynamic.Core;
using System.Text;
using System.Threading.Tasks;
using IrcMonitor.Application.Common.Exceptions;
using IrcMonitor.Application.Common.Interfaces;
using IrcMonitor.Domain.Models;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace IrcMonitor.Application.Statistics.Queries;
public class GetYearlyStatisticsQuery: IRequest<YearlyStatisticsVm>
{
    public GetYearlyStatisticsQuery(int year, Guid channelId)
    {
        Year = year;
        ChannelId = channelId;
    }

    public int Year { get; set; }
    public Guid ChannelId { get; set; }
}


public class GetYearlyStatisticsQueryHandler : IRequestHandler<GetYearlyStatisticsQuery, YearlyStatisticsVm>
{
    private readonly IApplicationDbContext _context;
    private readonly IIdentityService _identityService;
    public GetYearlyStatisticsQueryHandler(IApplicationDbContext context, IIdentityService identityService)
    {
        _context = context;
        _identityService = identityService;
    }

    public async Task<YearlyStatisticsVm> Handle(GetYearlyStatisticsQuery request, CancellationToken cancellationToken)
    {

        var channel = await _context.IrcChannels.FirstOrDefaultAsync(x => x.Guid == request.ChannelId, cancellationToken);

        if (channel == null) {
            throw new NotFoundException();
        }

        if (!_identityService.HasAccessToChannel(channel.Id))
        {
            throw new ForbiddenAccessException();
        }

        var query = _context.IrcRows.Where(x => x.ChannelId == channel.Id && x.TimeStamp.Year == request.Year);


        var monthlyQuery = query.GroupBy(x => x.TimeStamp.Month).Select(x => new BarChartRow()
        {
            Label = "",
            Identifier = x.Key,
            Value = x.Count()
        });

        var months = Enumerable.Range(1, 12);

        var hourlyQuery = query.GroupBy(x => x.TimeStamp.Hour).OrderBy(x => x.Key).Select(x => new BarChartRow() {
        
            Label = x.Key.ToString(),
            Identifier = x.Key,
            Value = x.Count()
        });

        var montlyStatistics = (await monthlyQuery.OrderBy(x => x.Identifier).ToListAsync(cancellationToken)).Select(x => new BarChartRow()
        {
            Identifier = x.Identifier,
            Value = x.Value,
            Label = CultureInfo.CurrentCulture.DateTimeFormat.GetMonthName(x.Identifier)
        }).ToList();

        montlyStatistics.AddRange(months.Where(t => !montlyStatistics.Select(y => y.Identifier).Contains(t) ).Select(m => new BarChartRow()
        {
            Identifier = m,
            Value = 0,
            Label = CultureInfo.CurrentCulture.DateTimeFormat.GetMonthName(m)
        }));

        var hourlyStatistics = await hourlyQuery.ToListAsync(cancellationToken);

        return new YearlyStatisticsVm()
        {
            MonthlyRows = montlyStatistics.OrderBy(x => x.Identifier).ToList(),
            HourlyRows = hourlyStatistics,
            Channel = channel.Name,
            Year = request.Year,
        };
    }
}



