using IrcMonitor.Application.Common.Interfaces;
using IrcMonitor.Domain.Entities;
using IrcMonitor.Infrastructure.Constants;
using Microsoft.Extensions.DependencyInjection;
using NUnit.Framework;

namespace IrcMonitor.Application.IntegrationTests;

using static Testing;

[TestFixture]
public abstract class BaseTestFixture
{
    [SetUp]
    public async Task TestSetUp()
    {
        await ResetState();
    }


    public async Task<IrcChannel> PrepareChannel(string channelName, bool isActive = true, IList<IrcRow> rows = null)
    {
        var channel = new IrcChannel() { Name = channelName, IsActive = isActive };
        await AddAsync(channel);

        var rowsToAdd = rows.Select(x =>
        {
            x.ChannelId = channel.Id;
            x.Id = 0;
            return x;
        });
        foreach(var row in rowsToAdd)
        {
            await AddAsync(row);
        }

        await UpdateStatistics();

        return channel;
    }

}
