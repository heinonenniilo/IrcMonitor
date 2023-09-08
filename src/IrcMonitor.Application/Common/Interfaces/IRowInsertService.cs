namespace IrcMonitor.Application.Common.Interfaces;
public interface IRowInsertService
{
    public Task ProcessFile(string fileName, string content);
}
