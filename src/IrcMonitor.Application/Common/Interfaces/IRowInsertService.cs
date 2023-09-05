using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IrcMonitor.Application.Common.Interfaces;
public interface IRowInsertService
{
    public Task ProcessFile(string fileName, string content);
}
