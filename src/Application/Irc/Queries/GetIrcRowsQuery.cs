
using AutoMapper;
using AutoMapper.QueryableExtensions;
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
    public GetIrcRowsQueryHandler(IApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<GetIrcRowsVm> Handle(GetIrcRowsQuery request, CancellationToken cancellationToken)
    {
        var query = _context.IrcRows.Where(x => x.ChannelId == request.ChannelId);
        var rows = await query.ProjectTo<IrcRowDto>(_mapper.ConfigurationProvider).ToListAsync(cancellationToken);
        // TODO implement pagination
        return new GetIrcRowsVm { Rows = rows };
    }
}

