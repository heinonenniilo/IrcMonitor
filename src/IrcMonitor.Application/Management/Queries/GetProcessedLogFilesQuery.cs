using AutoMapper;
using AutoMapper.QueryableExtensions;
using IrcMonitor.Application.Common.Exceptions;
using IrcMonitor.Application.Common.Interfaces;
using IrcMonitor.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace IrcMonitor.Application.Management.Queries;

public class GetProcessedLogFilesQuery : IRequest<GetProcessedLogFilesVm>
{
    public GetProcessedLogFilesCriteria Criteria { get; set; }
}

public class GetProcessedLogFilesQueryHandler : IRequestHandler<GetProcessedLogFilesQuery, GetProcessedLogFilesVm>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;
    private readonly IIdentityService _identityService;
    private readonly IPaginationService<ProcessedLogFile> _paginationService;

    public GetProcessedLogFilesQueryHandler(IApplicationDbContext context, IMapper mapper, IIdentityService identityService, IPaginationService<ProcessedLogFile> paginationService)
    {
        _context = context;
        _mapper = mapper;
        _identityService = identityService;
        _paginationService = paginationService;
    }

    public async Task<GetProcessedLogFilesVm> Handle(GetProcessedLogFilesQuery request, CancellationToken cancellationToken)
    {
        if (!_identityService.IsAdmin)
        {
            throw new ForbiddenAccessException();
        }

        var criteria = request.Criteria ?? new GetProcessedLogFilesCriteria();

        IQueryable<ProcessedLogFile> query = _context.ProcessedLogFiles;

        if (criteria.ChannelId.HasValue)
        {
            query = query.Where(x => x.Channel.Guid == criteria.ChannelId.Value);
        }

        if (!string.IsNullOrWhiteSpace(criteria.FileName))
        {
            query = query.Where(x => x.FileName.Contains(criteria.FileName));
        }

        if (criteria.From.HasValue)
        {
            query = query.Where(x => x.Created >= criteria.From.Value);
        }

        if (criteria.To.HasValue)
        {
            query = query.Where(x => x.Created <= criteria.To.Value);
        }

        if (string.IsNullOrEmpty(criteria.SortColumn))
        {
            query = query.OrderByDescending(x => x.Created);
        }

        var res = await _paginationService.CreateAsync(query, criteria);
        var rows = await res.Query.ProjectTo<ProcessedLogFileDto>(_mapper.ConfigurationProvider).ToListAsync(cancellationToken);

        return new GetProcessedLogFilesVm
        {
            Rows = rows,
            FromRow = res.FromRow,
            ToRow = res.ToRow,
            TotalRows = res.TotalCount,
            IsLastPage = res.IsLastPage
        };
    }
}
