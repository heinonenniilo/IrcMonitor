using System.Linq.Dynamic.Core;
using IrcMonitor.Application.Common.Exceptions;
using IrcMonitor.Application.Common.Interfaces;
using IrcMonitor.Domain.Entities;
using IrcMonitor.Domain.Models;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace IrcMonitor.Application.Statistics.Queries;
public class GetOverviewStatisticsQuery: IRequest<OverviewStatisticsVm>
{
    public GetOverviewStatisticsQuery(Guid channelId, List<string> nick)
    {
        ChannelId = channelId;
        Nick = nick;
    }
    public Guid ChannelId { get; set; }

    public List<string> Nick { get; set; } = null;
}


public class GetOverviewStatisticsQueryHandler : IRequestHandler<GetOverviewStatisticsQuery, OverviewStatisticsVm>
{

    private readonly IApplicationDbContext _context;
    private readonly IIdentityService _identityService;

    public GetOverviewStatisticsQueryHandler(IApplicationDbContext context, IIdentityService identityService)
    {
        _context = context;
        _identityService = identityService;
    }
    public async Task<OverviewStatisticsVm> Handle(GetOverviewStatisticsQuery request, CancellationToken cancellationToken)
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

        IQueryable<TimeGroupedRow> query = _context.TimeGroupedRows.Where(x => x.ChannelId == channel.Id);


        var hasNickFilter = false;
        if (request.Nick != null && request.Nick.Any())
        {
            hasNickFilter = true;
            query = query.Where(x => request.Nick.Contains(x.Nick));
        }

        if (hasNickFilter)
        {
            var groupedPerNick = await query.GroupBy(x => new { x.Year, x.Nick }).Select(d => new {d.Key.Nick, d.Key.Year, Count = d.Sum(d => d.Count) }).ToListAsync(cancellationToken);

            var datasets = new List<BarCharDataSet>();
            var years = groupedPerNick.Select(x => x.Year).Distinct().OrderBy(x => x).Select(x => x).ToList() ?? new List<int>();
            var retModel = new BarChartReturnModel() { };

            request?.Nick?.ForEach(nick => {

                var values = new List<int>();
                foreach(var year in years)
                {
                    values.Add(groupedPerNick.Where(g => g.Nick.ToLower() == nick.ToLower() && g.Year == year).Sum(d => d.Count));
                }
                datasets.Add(new BarCharDataSet()
                {
                    Label = nick,
                    Values = values
                });
            });

            return new OverviewStatisticsVm
            {
                ChannelName = channel.Name,
                ChannelId = channel.Guid,
                Rows = new BarChartReturnModel() {
                    Labels = years.Select(y => y.ToString()).ToList(),
                    Identifiers = years,
                    DataSets= datasets
                }
            };
        } else
        {
            var grouped = await query.GroupBy(x => x.Year).Select(d => new
            {
                Year = d.Key,
                Count = d.Sum(x => x.Count)
            }).OrderBy(d => d.Year).ToListAsync(cancellationToken);


            var ret = new OverviewStatisticsVm()
            {
                ChannelName = channel.Name,
                ChannelId = channel.Guid,
                Rows = new BarChartReturnModel()
                {
                    Labels = grouped.Select(d => d.Year.ToString()).ToList(),
                    Identifiers = grouped.Select(d => d.Year).ToList(),
                    DataSets = new List<BarCharDataSet>() 
                    { 
                        new BarCharDataSet()
                        {
                            Label = "Default",
                            Values = grouped.Select(d => d.Count).ToList(),
                        } 
                    }
                }
            };
            return ret;

        }

    }
}

