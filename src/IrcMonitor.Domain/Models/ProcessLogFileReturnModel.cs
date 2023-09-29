namespace IrcMonitor.Domain.Models;
public class ProcessLogFileReturnModel
{
    public IrcChannel Channel { get; set; }
    public int InsertedRowCount { get; set; }
    public DateTime Date { get; set; }
}
