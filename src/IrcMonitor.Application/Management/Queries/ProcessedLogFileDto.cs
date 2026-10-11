using AutoMapper;
using IrcMonitor.Application.Common.Mappings;
using IrcMonitor.Domain.Entities;

namespace IrcMonitor.Application.Management.Queries;
public class ProcessedLogFileDto : IMapFrom<ProcessedLogFile>
{
    public int Id { get; set; }
    public string FileName { get; set; }
    public int RowCount { get; set; }
    public Guid ChannelId { get; set; }
    public string Channel { get; set; }
    public DateTime Created { get; set; }

    public void Mapping(Profile profile)
    {
        profile.CreateMap<ProcessedLogFile, ProcessedLogFileDto>()
            .ForMember(x => x.Channel, opt => opt.MapFrom(x => x.Channel.Name))
            .ForMember(x => x.ChannelId, opt => opt.MapFrom(x => x.Channel.Guid));
    }
}
