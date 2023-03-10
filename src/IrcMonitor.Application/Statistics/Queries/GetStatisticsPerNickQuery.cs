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

        var query = _context.IrcRows.Where(x => x.ChannelId == channel.Id);

        if (request.Year.HasValue)
        {
            query = query.Where(x => x.TimeStamp.Year == request.Year.Value);
        }

        if (request.Month.HasValue)
        {
            query = query.Where(x => x.TimeStamp.Month == request.Month.Value);
        }

        var groupedQuery = query.GroupBy(x => x.Nick).Select(x => new BarChartRow()
        {
            Label = x.Key,
            Identifier = 1,
            Value = x.Count()
        }).OrderByDescending(x => x.Value).Take(_ircStatisticsSetting.NickTresholdLimit);

        var rowsToReturn = (await groupedQuery.OrderByDescending(x => x.Value).ToListAsync(cancellationToken)).Select((x, i) =>
        {
            x.Identifier = i;
            return x;
        }).ToList();

        return new StatisticsVmBase()
        {
            Rows = rowsToReturn,
        };
    }
}

