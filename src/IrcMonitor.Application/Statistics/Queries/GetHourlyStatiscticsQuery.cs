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
    public string ?Nick { get; set; }
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

        var query = _context.IrcRows.Where(x => x.ChannelId == channel.Id);

        if (request.Year.HasValue) {

            query = query.Where(x => x.TimeStamp.Year == request.Year.Value);
        }

        if (request.Month.HasValue)
        {
            query = query.Where(x => x.TimeStamp.Month == request.Month.Value);
        }

        if (!string.IsNullOrEmpty(request.Nick))
        {
            query = query.Where(x => x.Nick == request.Nick);
        }

        var retList = await query.GroupBy(x => x.TimeStamp.Hour).Select(x => new BarChartRow {
            Identifier = x.Key,
            Label = x.Key.ToString(),
            Value = x.Count() }).OrderBy(x => x.Identifier).ToListAsync(cancellationToken);

        return new StatisticsVmBase()
        {
            Rows = retList
        };

    }
}

