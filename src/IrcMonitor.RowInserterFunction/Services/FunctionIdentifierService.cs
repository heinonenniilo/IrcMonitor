using IrcMonitor.Application.Common.Interfaces;

namespace IrcMonitor.RowInserterFunction.Services;
internal class FunctionIdentifierService : ICurrentUserService
{
    public string? UserId => "AzureFunction";
}
