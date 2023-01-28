using AutoMapper;
using AutoMapper.QueryableExtensions;
using IrcMonitor.Application.Common.Interfaces;
using IrcMonitor.Domain.Entities;
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

    public GetIrcChannelsQueryHandler(IIdentityService identityService, IApplicationDbContext context, IMapper mapper)
    {
        _identityService = identityService;
        _context = context;
        _mapper = mapper;
    }
    public async Task<GetIrcChannelsVm> Handle(GetIrcChannelsQuery request, CancellationToken cancellationToken)
    {

        IQueryable<IrcChannel> query = _context.IrcChannels;

        if (!_identityService.IsAdmin)
        {
            query = query.Where(x => _identityService.GetAccessibleChannels().Contains(x.Id.ToString()));
        }

        var res = await query.ProjectTo<IrcChannelDto>(_mapper.ConfigurationProvider).ToListAsync(cancellationToken);

        return new GetIrcChannelsVm()
        {
            Channels = res
        };
    } 
}

