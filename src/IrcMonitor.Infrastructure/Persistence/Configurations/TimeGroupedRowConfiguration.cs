
using IrcMonitor.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace IrcMonitor.Infrastructure.Persistence.Configurations;
public class TimeGroupedRowConfiguration : IEntityTypeConfiguration<TimeGroupedRow>
{
    public void Configure(EntityTypeBuilder<TimeGroupedRow> builder)
    {
        builder.HasKey(x => new { x.Year, x.Hour, x.Month, x.ChannelId, x.Nick });
        builder.Property(x => x.Nick).HasMaxLength(50);

    }
}
