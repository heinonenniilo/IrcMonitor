using IrcMonitor.Application.Common.Exceptions;
using IrcMonitor.Application.Common.Interfaces;
using IrcMonitor.Application.Statistics.Base;
using IrcMonitor.Domain.Models;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace IrcMonitor.Application.Statistics.Queries;
public class GetHourlyStatiscticsQuery: IRequest<StatisticsVmBase>
{
    public Guid ChannelId { get; set; }
    public List<string> Nick { get; set; }
    public int ?Year { get; set; }
    public int ?Month { get; set; }
}


public class GetHourlyStatiscticsQueryHandler : IRequestHandler<GetHourlyStatiscticsQuery, StatisticsVmBase>
{
    private readonly IApplicationDbContext _context;
    private readonly IIdentityService _identityService;
    public GetHourlyStatiscticsQueryHandler(IApplicationDbContext context, IIdentityService identityService)
    {
        _context = context;
        _identityService = identityService; 
    }
    public async Task<StatisticsVmBase> Handle(GetHourlyStatiscticsQuery request, CancellationToken cancellationToken)
    {

        var channel = await _context.IrcChannels.FirstOrDefaultAsync(x => x.Guid == request.ChannelId, cancellationToken);

        if (channel == null)
        {
            throw new NotFoundException();
        }

        if (!_identityService.HasAccessToChannel(channel.Id))
        {
            throw new ForbiddenAccessException();
        }

        var query = _context.TimeGroupedRows.Where(x => x.ChannelId == channel.Id);

        if (request.Year.HasValue) {

            query = query.Where(x => x.Year == request.Year.Value);
        }

        if (request.Month.HasValue)
        {
            query = query.Where(x => x.Month == request.Month.Value);
        }

        var hours = Enumerable.Range(0, 24);
        var hasNickFilter = false;
        if (request.Nick != null && request.Nick.Any())
        {
            hasNickFilter = true;
            query = query.Where(x => request.Nick.Contains(x.Nick));
        }

        if (hasNickFilter)
        {
            var dataSets = new List<BarCharDataSet>();

            var groupedPerNick = await query.GroupBy(x => new { x.Hour, x.Nick }).Select(x => new
            {
                x.Key.Hour,
                x.Key.Nick,
                Count = x.Sum(x => x.Count)
            }).ToListAsync(cancellationToken);

            request?.Nick?.ForEach(n => {
                var values = new List<int>();

                foreach (var hour in hours.OrderBy(x => x))
                {
                    values.Add(groupedPerNick.Where(d => d.Nick.ToLower() == n.ToLower() && d.Hour == hour).Sum(d => d.Count));
                }

                dataSets.Add(new BarCharDataSet()
                {
                    Label = n,
                    Values = values
                }); 
            });

            return new StatisticsVmBase()
            {
                ChannelId = request.ChannelId,
                Rows = new BarChartReturnModel()
                {
                    DataSets= dataSets,
                    Identifiers = hours.ToList(),
                    Labels = hours.Select(d => d.ToString()).ToList()
                }
            };
        } else
        {
            var grouped = await query.GroupBy(x => x.Hour).Select(x => new
            {
                Hour = x.Key,
                Count = x.Sum(x => x.Count)
            }).ToListAsync(cancellationToken);

            var values = new List<int>();
            foreach(var hour in hours.OrderBy(x => x))
            {
                values.Add(grouped.Where(d => d.Hour == hour).Sum(d => d.Count));
            }

            var dataSet = new BarCharDataSet()
            {
                Label = "Default",
                Values = values
            };

            var m = new BarChartReturnModel()
            {
                Identifiers = hours.ToList(),
                Labels = hours.Select(d => d.ToString()).ToList(),
                DataSets = new List<BarCharDataSet> { dataSet }
            };

            return new StatisticsVmBase()
            {
                ChannelId = request.ChannelId,
                Rows = m
            };


        }

    }
}

