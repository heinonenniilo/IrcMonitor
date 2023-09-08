namespace IrcMonitor.Domain.Entities;
public class ProcessedLogFile: BaseAuditableEntity
{
    public required string FileName { get; set; }
    public  int ChannelId { get; set; }
    public required int RowCount { get; set; }
    public required IrcChannel Channel { get; set; }
}
