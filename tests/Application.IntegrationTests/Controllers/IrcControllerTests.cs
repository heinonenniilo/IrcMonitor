using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http.Json;
using System.Security.Policy;
using System.Text;
using System.Text.Json;
using System.Threading.Channels;
using System.Threading.Tasks;
using System.Web;
using FluentAssertions;
using IrcMonitor.Application.Irc.Queries;
using IrcMonitor.Domain.Entities;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.FileSystemGlobbing.Internal;
using Namotion.Reflection;
using NUnit.Framework;

namespace IrcMonitor.Application.IntegrationTests.Controllers;

using static Microsoft.EntityFrameworkCore.DbLoggerCategory;
using static Testing;
public class IrcControllerTests : BaseTestFixture
{
    private readonly WebApplicationFactory<Program> _factory;
    private HttpClient _client;

    public IrcControllerTests()
    {

    }


    #region Statistics / access tests
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
    public async Task ShouldReturnStatusCodeForbiddenWithChannelViewerRoleForADifferentChannelWhenRequestingChannelStatistics(string pattern)
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


    #region Rows / channels
    [Test]
    [TestCase(false, true)]
    [TestCase(true, false)]
    public async Task CanFetchChannelRowDataIfHasChannelViewerAccessForChannelOrIsAdmin(bool isAdmin, bool isChannelViewer)
    {
        var channel = await PrepareChannel("testChannel");
        var amountOfRowsToCreate = 20;
        _client = await PrepareHttpClientForUser("tester@tester.com", isAdmin,  isChannelViewer ?  new List<IrcChannel>() { channel } : null);

        var query = new GetIrcRowsCriteria() { 
            Page = 0,
            PageSize = 100,
            ChannelId = channel.Guid,
            From = DateTime.Now.AddDays(-10),
            To = DateTime.Now
        };

        await PrepareRowDataForChannel(channel, amountOfRowsToCreate, DateTime.Now.AddDays(-1));
        var queryString = TransformIrcRowsCriteriaIntoQueryParams(query);
        var endpoint = $"/api/irc/rows?{queryString}";

        var response = await _client.GetAsync(endpoint);

        var rowsResp = await response.Content.ReadFromJsonAsync<GetIrcRowsVm>();
        response.StatusCode.Should().Be(System.Net.HttpStatusCode.OK);

        rowsResp.Should().NotBeNull();
        rowsResp.Rows.Count.Should().Be(amountOfRowsToCreate);
    }

    [Test]
    [TestCase(true)]
    [TestCase(false)]
    public async Task StatusCodeShouldBeForbiddenWithAccessToADifferentChannelOrWithoutAnyAccessibleChannels(bool hasAccessToAnotherChannel)
    {
        var channel = await PrepareChannel("testChannel");
        var anotherChannel = await PrepareChannel("anotherChannel");
        var amountOfRowsToCreate = 20;
        _client = await PrepareHttpClientForUser("tester@tester.com", false, hasAccessToAnotherChannel ? new List<IrcChannel>() { anotherChannel } : null );

        var query = new GetIrcRowsCriteria()
        {
            Page = 0,
            PageSize = 100,
            ChannelId = channel.Guid,
            From = DateTime.Now.AddDays(-10),
            To = DateTime.Now
        };

        await PrepareRowDataForChannel(channel, amountOfRowsToCreate, DateTime.Now.AddDays(-1));
        var queryString = TransformIrcRowsCriteriaIntoQueryParams(query);
        var endpoint = $"/api/irc/rows?{queryString}";

        var response = await _client.GetAsync(endpoint);

        response.StatusCode.Should().Be(System.Net.HttpStatusCode.Forbidden);

    }


    private string TransformIrcRowsCriteriaIntoQueryParams(GetIrcRowsCriteria criteria)
    {
        var step1 = JsonSerializer.Serialize(criteria);
        var step2 = JsonSerializer.Deserialize<IDictionary<string, object>>(step1);
        var step3 = step2.Where(d => d.Value != null).Select(x => HttpUtility.UrlEncode($"Criteria.{x.Key}") + "=" + HttpUtility.UrlEncode(x.Value != null ? x.Value.ToString() : ""));

        return string.Join("&", step3);
    }


    #endregion

    private async Task PrepareRowDataForChannel(IrcChannel channel, int amountOfRowsToCreate, DateTime dateForRows)
    {
        for(var i = 0; i < amountOfRowsToCreate; i++)
        {
            var row = new IrcRow()
            {
                ChannelId = channel.Id,
                Nick = Guid.NewGuid().ToString().Substring(0, 10),
                Message = Guid.NewGuid().ToString(),
                TimeStamp = dateForRows,
            };
            await AddAsync(row);
        }
    }
}
