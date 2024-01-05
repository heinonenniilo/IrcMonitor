using System.Globalization;
using System.Linq.Dynamic.Core;
using IrcMonitor.Application.Common.Exceptions;
using IrcMonitor.Application.Common.Interfaces;
using IrcMonitor.Domain.Models;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace IrcMonitor.Application.Statistics.Queries;
public class GetYearlyStatisticsQuery: IRequest<YearlyStatisticsVm>
{
    public GetYearlyStatisticsQuery(int year, Guid channelId, List<string> nick)
    {
        Year = year;
        ChannelId = channelId;
        Nick = nick;
    }

    public int Year { get; set; }
    public Guid ChannelId { get; set; }
    public List<string> Nick { get; set; }
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

        var query = _context.TimeGroupedRows.Where(x => x.ChannelId == channel.Id && x.Year == request.Year);

        var hasNickFilter = false;
        if (request.Nick != null && request.Nick.Any())
        {
            hasNickFilter = true;
            query = query.Where(x => request.Nick.Contains(x.Nick));
        }

        var months = Enumerable.Range(1, 12);
        if (hasNickFilter)
        {
            var grouped = query.GroupBy(x => new { x.Nick, x.Month }).Select(d => new
            {
                d.Key.Month,
                d.Key.Nick,
                Count = d.Sum(d => d.Count)
            });

            var datasets = new List<BarCharDataSet>();

            request?.Nick?.ForEach(nick =>
            {
                var values = new List<int>();
                foreach (var month in months)
                {
                    values.Add(grouped.Where(d => d.Nick.ToLower() == nick.ToLower() && d.Month == month).Sum(d => d.Count));
                }

                datasets.Add(new BarCharDataSet()
                {
                    Label = nick,
                    Values = values
                });
            });

            var returnModel = new BarChartReturnModel()
            {
                DataSets = datasets,
                Labels = months.Select(CultureInfo.CurrentCulture.DateTimeFormat.GetMonthName).ToList(),
                Identifiers = months.ToList()
            };

            return new YearlyStatisticsVm()
            {
                Channel = channel.Name,
                Year = request.Year,
                ChannelId = channel.Guid,
                Rows = returnModel
            };

        }
        else
        {
            var monthlyRows = await query.GroupBy(x => x.Month).Select(x => new
            {
                Label = "",
                Identifier = x.Key,
                Count = x.Sum(x => x.Count)
            }).ToListAsync(cancellationToken);

            monthlyRows.AddRange(months.Where(d => !monthlyRows.Select(d => d.Identifier).Contains(d) ).Select(d => new
            {
                Label = "",
                Identifier = d,
                Count = 0
            }));

            var identifiers = monthlyRows.OrderBy(x => x.Identifier).Select(d => d.Identifier).ToList();
            var labels = monthlyRows.OrderBy(x => x.Identifier).Select(d => CultureInfo.CurrentCulture.DateTimeFormat.GetMonthName(d.Identifier)).ToList();
            var dataset = new BarCharDataSet()
            {
                Label = channel.Name,
                Values = monthlyRows.OrderBy(x => x.Identifier).Select(x => x.Count).ToList(),
            };

            return new YearlyStatisticsVm()
            {
                ChannelId = channel.Guid,
                Year = request.Year,
                Channel = channel.Name,
                Rows = new BarChartReturnModel()
                {
                    Labels = labels,
                    Identifiers = identifiers,
                    DataSets = new List<BarCharDataSet> { dataset }
                }
            };

        }

    }
}



