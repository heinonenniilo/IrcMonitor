using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IrcMonitor.Domain.Entities;
public class IrcChannel
{
    public int Id { get; set; }
    public string Name { get; set; }

    public IList<IrcRow> Rows { get; set; }

    public IList<UserRole> Roles { get; set; }
}
