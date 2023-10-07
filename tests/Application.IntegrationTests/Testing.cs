using System.Net.Http.Headers;
using System.Net.NetworkInformation;
using IrcMonitor.Application.Common.Interfaces;
using IrcMonitor.Domain.Entities;
using IrcMonitor.Infrastructure.Constants;
using IrcMonitor.Infrastructure.Persistence;
using MediatR;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using NUnit.Framework;
using Respawn;
using static System.Formats.Asn1.AsnWriter;

namespace IrcMonitor.Application.IntegrationTests;

[SetUpFixture]
public partial class Testing
{
    private static WebApplicationFactory<Program> _factory = null!;
    private static IConfiguration _configuration = null!;
    private static IServiceScopeFactory _scopeFactory = null!;
    private static Checkpoint _checkpoint = null!;
    private static string? _currentUserId;

    [OneTimeSetUp]
    public void RunBeforeAnyTests()
    {
        _factory = new CustomWebApplicationFactory();
        _scopeFactory = _factory.Services.GetRequiredService<IServiceScopeFactory>();
        _configuration = _factory.Services.GetRequiredService<IConfiguration>();

        _checkpoint = new Checkpoint
        {
            TablesToIgnore = new[] { "__EFMigrationsHistory" }
        };
    }

    public static async Task<TResponse> SendAsync<TResponse>(IRequest<TResponse> request)
    {
        using var scope = _scopeFactory.CreateScope();

        var mediator = scope.ServiceProvider.GetRequiredService<ISender>();

        return await mediator.Send(request);
    }

    public static string? GetCurrentUserId()
    {
        return _currentUserId;
    }


    public static async Task ResetState()
    {
        await _checkpoint.Reset(_configuration.GetConnectionString("DefaultConnection"));

        _currentUserId = null;
    }

    public static async Task<TEntity?> FindAsync<TEntity>(params object[] keyValues)
        where TEntity : class
    {
        using var scope = _scopeFactory.CreateScope();

        var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        return await context.FindAsync<TEntity>(keyValues);
    }

    public static async Task AddAsync<TEntity>(TEntity entity)
        where TEntity : class
    {
        using var scope = _scopeFactory.CreateScope();

        var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        context.Add(entity);

        await context.SaveChangesAsync();
    }

    public static async Task<int> CountAsync<TEntity>() where TEntity : class
    {
        using var scope = _scopeFactory.CreateScope();

        var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        return await context.Set<TEntity>().CountAsync();
    }

    public static HttpClient CreateClient(string? token = null)
    {
        var client = _factory.CreateClient();

        if (token != null)
        {
            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
        }

        return client;
    }

    public static async Task<HttpClient> PrepareHttpClientForUser(string userEmail, bool giveAdminRole, IList<IrcChannel> channelsWithViewAccess = null)
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

    public static async Task UpdateStatistics()
    {
        using var scope = _scopeFactory.CreateScope();
        var statisticsService = scope.ServiceProvider.GetRequiredService<IStatisticsService>();
        await statisticsService.PopulateChannelStatistics(CancellationToken.None);
    }

    public static IServiceScopeFactory GetScopeFactory()
    {
        return _scopeFactory;
    }

    [OneTimeTearDown]
    public void RunAfterAnyTests()
    {
    }
}
