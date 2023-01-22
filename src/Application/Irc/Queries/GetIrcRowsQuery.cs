
using AutoMapper;
using AutoMapper.QueryableExtensions;
using IrcMonitor.Application.Common.Exceptions;
using IrcMonitor.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace IrcMonitor.Application.Irc.Queries;
public class GetIrcRowsQuery: IRequest<GetIrcRowsVm>
{
    public int ChannelId { get; set; }
}


public class GetIrcRowsQueryHandler : IRequestHandler<GetIrcRowsQuery, GetIrcRowsVm>
{

    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;
    private readonly IIdentityService _identityService;

    public GetIrcRowsQueryHandler(IApplicationDbContext context, IMapper mapper, IIdentityService identityService)
    {
        _context = context;
        _mapper = mapper;
        _identityService = identityService;
    }

    public async Task<GetIrcRowsVm> Handle(GetIrcRowsQuery request, CancellationToken cancellationToken)
    {

        if (! await _identityService.HasAccessToChannel(request.ChannelId))
        {
            throw new ForbiddenAccessException();
        }

        var query = _context.IrcRows.Where(x => x.ChannelId == request.ChannelId).OrderByDescending(x => x.Id).Take(100);
        var rows = await query.ProjectTo<IrcRowDto>(_mapper.ConfigurationProvider).ToListAsync(cancellationToken);
        // TODO implement pagination
        return new GetIrcRowsVm { Rows = rows };
    }
}

