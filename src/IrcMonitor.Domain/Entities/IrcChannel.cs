namespace IrcMonitor.Domain.Entities;
public class IrcChannel
{
    public int Id { get; set; }
    public Guid Guid { get; set; }
    public string Name { get; set; }

    public IList<IrcRow> Rows { get; set; }

    public IList<UserRole> Roles { get; set; }

    public IList<ProcessedLogFile> ProcessedFiles { get; set; }
}
