namespace IrcMonitor.Domain.Models;
public class ProcessLogFileReturnModel
{
    public int ChannelId { get; set; }
    public int InsertedRowCount { get; set; }
    public DateTime Date { get; set; }
}
