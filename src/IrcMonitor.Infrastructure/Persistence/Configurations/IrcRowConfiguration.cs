using IrcMonitor.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace IrcMonitor.Infrastructure.Persistence.Configurations;
public class IrcRowConfiguration : IEntityTypeConfiguration<IrcRow>
{
    void IEntityTypeConfiguration<IrcRow>.Configure(EntityTypeBuilder<IrcRow> builder)
    {
        builder.HasKey(x => x.Id);

        builder.Property(x => x.Message).HasMaxLength(1000);
        builder.Property(x => x.Nick).HasMaxLength(256);
        builder.Property(x => x.Message).IsRequired();
        builder.Property(x => x.ChannelId).IsRequired();

        builder.HasOne(x => x.Channel).WithMany(x => x.Rows).IsRequired();
    }
}
