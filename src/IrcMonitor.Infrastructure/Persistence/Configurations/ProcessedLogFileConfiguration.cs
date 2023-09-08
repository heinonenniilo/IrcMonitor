using IrcMonitor.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace IrcMonitor.Infrastructure.Persistence.Configurations;
internal class ProcessedLogFileConfiguration : IEntityTypeConfiguration<ProcessedLogFile>
{
    public void Configure(EntityTypeBuilder<ProcessedLogFile> builder)
    {
        builder.HasKey(e => e.Id);
        builder.Property(x => x.Id).ValueGeneratedOnAdd();
        builder.Property(x => x.FileName).HasMaxLength(512);
        builder.HasIndex(x => x.FileName).IsUnique();

        builder.HasOne(x => x.Channel).WithMany(x => x.ProcessedFiles);
    }
}
