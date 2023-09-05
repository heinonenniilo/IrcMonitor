using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using IrcMonitor.Application.Common.Interfaces;

namespace IrcMonitor.RowInserterFunction.Services;
internal class FunctionIdentifierService : ICurrentUserService
{
    public string? UserId => "AzureFunction";
}
