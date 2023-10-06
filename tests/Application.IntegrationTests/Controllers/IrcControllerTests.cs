using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Policy;
using System.Text;
using System.Threading.Channels;
using System.Threading.Tasks;
using FluentAssertions;
using IrcMonitor.Domain.Entities;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.FileSystemGlobbing.Internal;
using NUnit.Framework;

namespace IrcMonitor.Application.IntegrationTests.Controllers;

using static Testing;
public class IrcControllerTests : BaseTestFixture
{
    private readonly WebApplicationFactory<Program> _factory;
    private HttpClient _client;

    public IrcControllerTests()
    {

    }


    #region Statistics / access rights
    [Test]
    [TestCase("/api/irc/statistics/{channelId}")]
    [TestCase("/api/irc/statistics/{channelId}/{year}")]
    [TestCase("/api/irc/statistics/nicks/{channelId}")]
    [TestCase("/api/irc/statistics/hourly/{channelId}")]
    public async Task ShouldReturnStatusCodeOkWithAdminRightsForChannelStatistics(string pattern)
    {
        _client =  await PrepareHttpClientForUser("tester@tester.com", true);
        var channel = await PrepareChannel("testChannel");
        var endpoint = pattern.Replace("{channelId}", channel.Guid.ToString()).Replace("{year}", "2023");
        var response = await _client.GetAsync(endpoint);
        response.IsSuccessStatusCode.Should().BeTrue();
    }

    [Test]
    [TestCase("/api/irc/statistics/{channelId}")]
    [TestCase("/api/irc/statistics/{channelId}/{year}")]
    [TestCase("/api/irc/statistics/nicks/{channelId}")]
    [TestCase("/api/irc/statistics/hourly/{channelId}")]
    public async Task ShouldReturnStatusCodeOkWithChannelViewerRoleForChannelStatistics(string pattern)
    {       
        var channel = await PrepareChannel("testChannel");
        _client = await PrepareHttpClientForUser("tester@tester.com", false, new List<IrcChannel> {channel});

        var endpoint = pattern.Replace("{channelId}", channel.Guid.ToString()).Replace("{year}", "2023");
        var response = await _client.GetAsync(endpoint);

        response.IsSuccessStatusCode.Should().BeTrue();
    }

    [Test]
    [TestCase("/api/irc/statistics/{channelId}")]
    [TestCase("/api/irc/statistics/{channelId}/{year}")]
    [TestCase("/api/irc/statistics/nicks/{channelId}")]
    [TestCase("/api/irc/statistics/hourly/{channelId}")]
    public async Task ShouldReturnStatusCodeForbiddenWithChannelViewerRoleForADifferentChannelWhenRequestinChannelStatistics(string pattern)
    {
        var channel = await PrepareChannel("testChannel");
        var anotherChannel = await PrepareChannel("anotherChannel");
        _client = await PrepareHttpClientForUser("tester@tester.com", false, new List<IrcChannel> { anotherChannel });
        var endpoint = pattern.Replace("{channelId}", channel.Guid.ToString()).Replace("{year}", "2023");
        var response = await _client.GetAsync(endpoint);
        response.StatusCode.Should().Be(System.Net.HttpStatusCode.Forbidden);
    }

    [Test]
    [TestCase("/api/irc/statistics/{channelId}")]
    [TestCase("/api/irc/statistics/{channelId}/{year}")]
    [TestCase("/api/irc/statistics/nicks/{channelId}")]
    [TestCase("/api/irc/statistics/hourly/{channelId}")]
    public async Task ShouldReturnForbiddenWithNoUserRolesForAChannelStatistics(string pattern)
    {        
        var channel = await PrepareChannel("testChannel");              
        _client = await PrepareHttpClientForUser("tester@tester.com", false);
        var endpoint = pattern.Replace("{channelId}", channel.Guid.ToString()).Replace("{year}", "2023");
        var response = await _client.GetAsync(endpoint);
        response.StatusCode.Should().Be(System.Net.HttpStatusCode.Forbidden);
    }

    #endregion


}
