using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IrcMonitor.Domain.Entities;
public class UserRole
{
    public int Id { get; set; } 
    public int UserId { get; set; }


    public User User { get; set; }
    public string Role { get; set; }

    public int ?ChannelId { get; set; }
    public IrcChannel ?Channel { get; set; }

}
