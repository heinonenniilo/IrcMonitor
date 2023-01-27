using AutoMapper;
using IrcMonitor.Application.Common.Mappings;
using IrcMonitor.Domain.Entities;

namespace IrcMonitor.Application.Irc.Queries;
public class IrcChannelDto : IMapFrom<IrcChannel>
{
    public int Id { get; set; }
    public Guid Guid { get; set; }
    public string Name { get; set; }

    public void Mapping(Profile profile)
    {
        profile.CreateMap<IrcChannel, IrcChannelDto>();
    }
}
