﻿
using System.Xml.Linq;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using IrcMonitor.Application.Common.Exceptions;
using IrcMonitor.Application.Common.Interfaces;
using IrcMonitor.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace IrcMonitor.Application.Irc.Queries;
public class GetIrcRowsQuery: IRequest<GetIrcRowsVm>
{
    public GetIrcRowsCriteria Criteria { get; set; }  
}


public class GetIrcRowsQueryHandler : IRequestHandler<GetIrcRowsQuery, GetIrcRowsVm>
{

    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;
    private readonly IIdentityService _identityService;
    private readonly IPaginationService<IrcRow> _paginationService;

    public GetIrcRowsQueryHandler(IApplicationDbContext context, IMapper mapper, IIdentityService identityService, IPaginationService<IrcRow> paginationService)
    {
        _context = context;
        _mapper = mapper;
        _identityService = identityService;
        _paginationService = paginationService;
    }

    public async Task<GetIrcRowsVm> Handle(GetIrcRowsQuery request, CancellationToken cancellationToken)
    {
        var criteria = request.Criteria;


        var channel = await _context.IrcChannels.FirstOrDefaultAsync(x => x.Guid == criteria.ChannelId, cancellationToken);


        if (channel == null)
        {
            throw new NotFoundException();
        }

        if (!_identityService.HasAccessToChannel(channel.Id))
        {
            throw new ForbiddenAccessException();
        }

        var query = _context.IrcRows.Where(x => x.ChannelId == channel.Id);

        if (criteria.To.HasValue)
        {
            query = query.Where(x => x.TimeStamp <= criteria.To.Value);
        }

        if (criteria.From.HasValue)
        {
            query = query.Where(x => x.TimeStamp >= criteria.From.Value);
        }

        var res = await _paginationService.CreateAsync(query, criteria);
        var rows = await res.Query.ProjectTo<IrcRowDto>(_mapper.ConfigurationProvider).ToListAsync(cancellationToken);

        return new GetIrcRowsVm { 
            Rows = rows ,
            FromRow = res.FromRow,
            ToRow = res.ToRow,
            TotalRows = res.TotalCount,
            IsLastPage = res.IsLastPage
        };
    }
}

