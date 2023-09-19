namespace IrcMonitor.Domain.Entities;
public class IrcRow
{
    public long Id { get; set; }
    public string Message { get; set; }
    public string Nick { get; set; }
    public DateTime TimeStamp { get; set; }


    public int ChannelId { get; set; }
    public IrcChannel Channel { get; set; }
}
