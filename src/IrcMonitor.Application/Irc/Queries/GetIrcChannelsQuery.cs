using System.Linq.Dynamic.Core;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using IrcMonitor.Application.Common.Interfaces;
using IrcMonitor.Domain.Entities;
using IrcMonitor.Domain.Models;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace IrcMonitor.Application.Irc.Queries;
public class GetIrcChannelsQuery : IRequest<GetIrcChannelsVm>
{
    public List<string> ?Exclude { get; set; }
}

public class GetIrcChannelsQueryHandler : IRequestHandler<GetIrcChannelsQuery, GetIrcChannelsVm>
{
    private readonly IIdentityService _identityService;
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;
    private readonly IrcStatisticsSettings _ircStatisticsSettings;

    public GetIrcChannelsQueryHandler(IIdentityService identityService, IApplicationDbContext context, IMapper mapper, IrcStatisticsSettings ircStatisticsSettings)
    {
        _identityService = identityService;
        _context = context;
        _mapper = mapper;
        _ircStatisticsSettings = ircStatisticsSettings;
    }
    public async Task<GetIrcChannelsVm> Handle(GetIrcChannelsQuery request, CancellationToken cancellationToken)
    {
        IQueryable<IrcChannel> query = _context.IrcChannels.Where(x => x.IsActive);
        if (!_identityService.IsAdmin)
        {
            query = query.Where(x => _identityService.GetAccessibleChannels().Contains(x.Id.ToString()));
        }

        var grouped = query.Select(x => new IrcChannelQueryMode
        {
            Channel = x,
            Count = x.TimeGroupedRows.Sum(x => x.Count)
        });

        grouped = grouped.Where(x => x.Count >= _ircStatisticsSettings.MinRowCountForChannel);

        var res = await grouped.OrderByDescending(d => d.Count).ProjectTo<IrcChannelDto>(_mapper.ConfigurationProvider).ToListAsync(cancellationToken);

        return new GetIrcChannelsVm()
        {
            Channels = res
        };
    }
}

internal class IrcChannelQueryMode
{
    public IrcChannel Channel { get; set; }
    public int Count { get; set; }
}

