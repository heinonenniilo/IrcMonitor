using System.Linq.Dynamic.Core;
using IrcMonitor.Application.Common.Exceptions;
using IrcMonitor.Application.Common.Interfaces;
using IrcMonitor.Application.Irc.Queries;
using IrcMonitor.Domain.Models;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace IrcMonitor.Application.Statistics.Queries;
public class GetOverviewStatisticsQuery: IRequest<OverviewStatisticsVm>
{
    public GetOverviewStatisticsQuery(Guid channelId)
    {
        ChannelId = channelId;
    }
    public Guid ChannelId { get; set; }
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
            throw new FormatException();
        }


        var query = _context.TimeGroupedRows.Where(x => x.ChannelId == channel.Id).GroupBy(x => x.Year).Select(d => new BarChartRow
        {
            Label = d.Key.ToString(),
            Identifier = d.Key,
            Value = d.Sum(x => x.Count)
        });

        var returnList = (await query.OrderBy(x => x.Identifier).ToListAsync(cancellationToken));


        return new OverviewStatisticsVm
        {
            Rows = returnList,
            ChannelName= channel.Name
        };
    }
}

