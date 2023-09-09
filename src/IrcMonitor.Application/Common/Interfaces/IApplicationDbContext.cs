using IrcMonitor.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace IrcMonitor.Application.Common.Interfaces;

public interface IApplicationDbContext
{
    DbSet<IrcRow> IrcRows { get; }

    DbSet<IrcChannel> IrcChannels { get;  }

    DbSet<User> Users { get; }
    DbSet<UserRole> UserRoles { get; }

    DbSet<ProcessedLogFile> ProcessedLogFiles { get; }

    DbSet<TimeGroupedRow> TimeGroupedRows { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken);
}
