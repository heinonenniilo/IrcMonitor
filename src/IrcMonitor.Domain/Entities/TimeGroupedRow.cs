
namespace IrcMonitor.Domain.Entities;
public class TimeGroupedRow
{
    public int Year { get; set; }  
    public int Month { get; set; } 
    public int Hour { get; set; }
    public int ChannelId { get; set; }
    public IrcChannel Channel { get; set; }
    public required string Nick { get; set; }
    public required int Count { get; set; }
    public DateTime Updated { get; set; }

}
