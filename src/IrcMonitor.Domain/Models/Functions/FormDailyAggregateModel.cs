namespace IrcMonitor.Domain.Models.Functions;
public class FormDailyAggregateModel
{
    public required Guid ChannelId { get; set; }
    public required DateTime Date { get; set; }
}
