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



    public async Task<IrcChannel> PrepareChannel(string channelName)
    {
        var channel = new IrcChannel() { Name = channelName };
        await AddAsync(channel);
        return channel;
    }


    public async Task<HttpClient> PrepareHttpClientForUser(string userEmail, bool giveAdminRole, IList<IrcChannel> channelsWithViewAccess = null)
    {
        var user = new User()
        {
            Email = userEmail
        };

        await AddAsync(user);

        if (giveAdminRole)
        {
            var userRole = new UserRole()
            {
                UserId = user.Id,
                Role = RoleConstants.Admin
            };

            await AddAsync(userRole);
        }

        if (channelsWithViewAccess != null && channelsWithViewAccess.Count > 0)
        {
            foreach (var channel in channelsWithViewAccess)
            {
                var role = new UserRole() { UserId = user.Id, ChannelId = channel.Id, Role = RoleConstants.Viewer };
                await AddAsync(role);
            }
        }

        var scopeFactory = GetScopeFactory();

        using var scope = scopeFactory.CreateScope();

        var service = scope.ServiceProvider.GetRequiredService<IJwtGenerator>();

        var userVm = await service.CreateUserAuthToken(user.Email);

        return CreateClient(userVm.AccessToken);
    }
}
