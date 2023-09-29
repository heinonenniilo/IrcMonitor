
using IrcMonitor.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace IrcMonitor.Infrastructure.Persistence.Configurations;
public class IrcChannelConfiguration : IEntityTypeConfiguration<IrcChannel>
{
    void IEntityTypeConfiguration<IrcChannel>.Configure(EntityTypeBuilder<IrcChannel> builder)
    {
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Guid).HasDefaultValueSql("newid()");
        builder.Property(x => x.Id).ValueGeneratedOnAdd();
        builder.Property(x => x.Name).HasMaxLength(256);
        builder.Property(x => x.Name).IsRequired();

        builder.HasIndex(x => x.Name).IsUnique();
    }
}
