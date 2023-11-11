using System.ComponentModel.DataAnnotations;
using IrcMonitor.Application.Common.Exceptions;
using IrcMonitor.Application.Common.Interfaces;
using IrcMonitor.Application.Statistics.Base;
using IrcMonitor.Domain.Models;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace IrcMonitor.Application.Statistics.Queries;
public class GetStatisticsPerNickQuery: IRequest<StatisticsVmBase>
{
    public GetStatisticsPerNickQuery(Guid channelId, int ?year = null, int ?month = null)
    {
        ChannelId = channelId;
        Year = year;
        Month = month;
    }
    [Required]
    public Guid ChannelId { get; set; }
    public int? Year { get; set; } 
    public int? Month { get; set; }
}


public class GetStatisticsPerNickQueryHandler : IRequestHandler<GetStatisticsPerNickQuery, StatisticsVmBase>
{
    private readonly IApplicationDbContext _context;
    private readonly IIdentityService _identityService;
    private readonly IrcStatisticsSettings _ircStatisticsSetting;
    public GetStatisticsPerNickQueryHandler(IApplicationDbContext context, IIdentityService identityService, IrcStatisticsSettings ircStatisticsSetting)
    {
        _context = context;
        _identityService = identityService;
        _ircStatisticsSetting = ircStatisticsSetting;
    }
    public async Task<StatisticsVmBase> Handle(GetStatisticsPerNickQuery request, CancellationToken cancellationToken)
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

        if (request.Year.HasValue)
        {
            query = query.Where(x => x.Year == request.Year.Value);
        }

        if (request.Month.HasValue)
        {
            query = query.Where(x => x.Month == request.Month.Value);
        }

        var groupedQuery = await query.GroupBy(x => x.Nick).Select(x => new
        {
            Label = x.Key,
            Identifier = 1,
            Count = x.Sum(x => x.Count)
        }).OrderByDescending(x => x.Count).Take(_ircStatisticsSetting.NickTresholdLimit).ToListAsync(cancellationToken);

        var labels = groupedQuery.Select(x => x.Label).ToList();
        var identifiers = groupedQuery.Select((x, i) => i).ToList();
        var ret = new StatisticsVmBase()
        {
            ChannelId = channel.Guid,
            Year = request.Year,
            Rows = new BarChartReturnModel()
            {
                Labels = labels,
                Identifiers = identifiers,
                DataSets = new List<BarCharDataSet> {
                    new BarCharDataSet() {
                        Label = channel.Name,
                        Values = groupedQuery.Select(x => x.Count).ToList()
                    }
                }
            }
        };

        return ret;

    }
}

