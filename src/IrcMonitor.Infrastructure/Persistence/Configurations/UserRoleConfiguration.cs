using IrcMonitor.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace IrcMonitor.Infrastructure.Persistence.Configurations;
internal class UserRoleConfiguration : IEntityTypeConfiguration<UserRole>
{
    public void Configure(EntityTypeBuilder<UserRole> builder)
    {
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Id).ValueGeneratedOnAdd();
        builder.HasOne(x => x.User).WithMany(x => x.Roles).IsRequired();
        builder.HasOne(x => x.Channel).WithMany(x => x.Roles).IsRequired(false);

        builder.HasIndex(x => new { x.UserId, x.Role, x.ChannelId }).IsUnique();
        builder.HasIndex(x => new { x.UserId, x.Role }).HasFilter("[ChannelId] IS NULL").IsUnique();
    }
}
