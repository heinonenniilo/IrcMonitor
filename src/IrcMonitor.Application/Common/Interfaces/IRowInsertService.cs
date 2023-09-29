using IrcMonitor.Domain.Models;

namespace IrcMonitor.Application.Common.Interfaces;
public interface IRowInsertService
{
    public Task<ProcessLogFileReturnModel> ProcessFile(string fileName, string content);
}
