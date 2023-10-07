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

    private const int MinRowCountForChannel = 100;

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
        var amountOfRowsToCreate = 20;
        var rows = Enumerable.Range(0, amountOfRowsToCreate)
        .Select(_ => new IrcRow
            {
                Nick = Guid.NewGuid().ToString().Substring(0, 10),
                Message = Guid.NewGuid().ToString(),
                TimeStamp = DateTime.Now.AddDays(-1),
        });
        var channel = await PrepareChannel("testChannel", true, rows.ToList());

        _client = await PrepareHttpClientForUser("tester@tester.com", isAdmin, isChannelViewer ? new List<IrcChannel>() { channel } : null);

        var query = new GetIrcRowsCriteria()
        {
            Page = 0,
            PageSize = 100,
            ChannelId = channel.Guid,
            From = DateTime.Now.AddDays(-10),
            To = DateTime.Now
        };

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
    public async Task StatusCodeShouldBeForbiddenWhenFetchingRowDataWithAccessToADifferentChannelOrWithoutAnyAccessibleChannels(bool hasAccessToAnotherChannel)
    {
        var channel = await PrepareChannel("testChannel");
        var anotherChannel = await PrepareChannel("anotherChannel");
        
        _client = await PrepareHttpClientForUser("tester@tester.com", false, hasAccessToAnotherChannel ? new List<IrcChannel>() { anotherChannel } : null );

        var query = new GetIrcRowsCriteria()
        {
            Page = 0,
            PageSize = 100,
            ChannelId = channel.Guid,
            From = DateTime.Now.AddDays(-10),
            To = DateTime.Now
        };


        var queryString = TransformIrcRowsCriteriaIntoQueryParams(query);
        var endpoint = $"/api/irc/rows?{queryString}";

        var response = await _client.GetAsync(endpoint);

        response.StatusCode.Should().Be(System.Net.HttpStatusCode.Forbidden);

    }



    [Test]
    public async Task AdminGetsAllTheActiveChannelsHavingDefinedAmountOfRows()
    {
        var rowsWithMinimalCount = Enumerable.Range(0, MinRowCountForChannel)
        .Select(x => new IrcRow
        {
            Nick = Guid.NewGuid().ToString().Substring(0, 10),
            Message = Guid.NewGuid().ToString(),
            TimeStamp = DateTime.Now.AddDays(-1),
        });

        var rowsWithLessThanMinimalCount = Enumerable.Range(0, MinRowCountForChannel-1)
        .Select(x => new IrcRow
        {
            Nick = Guid.NewGuid().ToString().Substring(0, 10),
            Message = Guid.NewGuid().ToString(),
            TimeStamp = DateTime.Now.AddDays(-1),
        });

        var shouldBeVisible = await PrepareChannel("channel", true, rowsWithMinimalCount.ToList());
        var inActiveChannel = await PrepareChannel("inActive", false, rowsWithMinimalCount.ToList());
        var channelWithNotEnoughRows = await PrepareChannel("notEnoughRows", true, rowsWithLessThanMinimalCount.ToList());

        _client = await PrepareHttpClientForUser("tester@tester.com", true);

        var endpoint = "/api/irc/channels";

        var response = await _client.GetAsync(endpoint);
        var vmResponse = await response.Content.ReadFromJsonAsync<GetIrcChannelsVm>();

        vmResponse.Channels.Count.Should().Be(1); 
        vmResponse.Channels.First().Guid.Should().Be(shouldBeVisible.Guid);
    }

    [Test]
    public async Task NonAdminSeesOnlyActiveChannelsForWhichHasChannelViewerRole()
    {
        var rowsWithMinimalCount = Enumerable.Range(0, MinRowCountForChannel)
        .Select(x => new IrcRow
        {
            Nick = Guid.NewGuid().ToString().Substring(0, 10),
            Message = Guid.NewGuid().ToString(),
            TimeStamp = DateTime.Now.AddDays(-1),
        });

        var rowsWithLessThanMinimalCount = Enumerable.Range(0, MinRowCountForChannel - 1)
        .Select(x => new IrcRow
        {
            Nick = Guid.NewGuid().ToString().Substring(0, 10),
            Message = Guid.NewGuid().ToString(),
            TimeStamp = DateTime.Now.AddDays(-1),
        });

        var shouldBeVisible = await PrepareChannel("channel", true, rowsWithMinimalCount.ToList());
        var noAccess = await PrepareChannel("noAccess", true, rowsWithMinimalCount.ToList());
        var inActiveChannel = await PrepareChannel("inActive", false, rowsWithMinimalCount.ToList());
        var channelWithNotEnoughRows = await PrepareChannel("notEnoughRows", true, rowsWithLessThanMinimalCount.ToList());

        _client = await PrepareHttpClientForUser("tester@tester.com", false, new List<IrcChannel> { shouldBeVisible, inActiveChannel, channelWithNotEnoughRows });

        var endpoint = "/api/irc/channels";

        var response = await _client.GetAsync(endpoint);
        var vmResponse = await response.Content.ReadFromJsonAsync<GetIrcChannelsVm>();

        vmResponse.Channels.Count.Should().Be(1);
        vmResponse.Channels.First().Guid.Should().Be(shouldBeVisible.Guid);
    }




    private string TransformIrcRowsCriteriaIntoQueryParams(GetIrcRowsCriteria criteria)
    {
        var step1 = JsonSerializer.Serialize(criteria);
        var step2 = JsonSerializer.Deserialize<IDictionary<string, object>>(step1);
        var step3 = step2.Where(d => d.Value != null).Select(x => HttpUtility.UrlEncode($"Criteria.{x.Key}") + "=" + HttpUtility.UrlEncode(x.Value != null ? x.Value.ToString() : ""));

        return string.Join("&", step3);
    }


    #endregion

}
