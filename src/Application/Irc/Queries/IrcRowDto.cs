
using AutoMapper;
using IrcMonitor.Application.Common.Mappings;
using IrcMonitor.Domain.Entities;

namespace IrcMonitor.Application.Irc.Queries;
public class IrcRowDto : IMapFrom<IrcRow>
{
    public long Id { get; set; }
    public string Message { get; set; }
    public string Nick { get; set; }
    public string Channel { get; set; }
    public DateTime TimeStamp { get; set; }

    public void Mapping(Profile profile)
    {
        profile.CreateMap<IrcRow, IrcRowDto>()
            .ForMember(x => x.Channel, opt => opt.MapFrom(x => x.Channel.Name));
    }
}
