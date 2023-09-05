using System.Security.Cryptography;
using IrcMonitor.Application.Common.Interfaces;
using IrcMonitor.Application.Common.Utils;
using IrcMonitor.Domain.Models;
using IrcMonitor.Infrastructure.Identity;
using IrcMonitor.Infrastructure.Persistence;
using IrcMonitor.Infrastructure.Persistence.Interceptors;
using IrcMonitor.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace Microsoft.Extensions.DependencyInjection;

public static class ConfigureServices
{
    public static IServiceCollection AddInfrastructureServices(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddScoped<AuditableEntitySaveChangesInterceptor>();

        if (configuration.GetValue<bool>("UseInMemoryDatabase"))
        {
            services.AddDbContext<ApplicationDbContext>(options =>
                options.UseInMemoryDatabase("IrcMonitorDb"));
        }
        else
        {
            services.AddDbContext<ApplicationDbContext>(options =>
                options.UseSqlServer(configuration.GetConnectionString("DefaultConnection"),
                    builder => builder.MigrationsAssembly(typeof(ApplicationDbContext).Assembly.FullName)));
        }

        services.AddScoped<IApplicationDbContext>(provider => provider.GetRequiredService<ApplicationDbContext>());

        services.AddScoped<ApplicationDbContextInitialiser>();


        services.AddTransient<IDateTime, DateTimeService>();
        services.AddTransient<IIdentityService, IdentityService>();
        services.AddScoped<IJwtGenerator, JwtGenerator>();
        services.AddScoped(typeof(IPaginationService<>), typeof(PaginationService<>)); // Todo Check?

        // Add some settings

        var authSettings = configuration.GetRequiredSection("AuthenticationSettings").Get<AuthenticationSettings>();
        services.AddSingleton(authSettings);
        services.AddSingleton(configuration.GetRequiredSection(nameof(IrcStatisticsSettings)).Get<IrcStatisticsSettings>());

        var publicRsaParameters = TokenUtils.ConvertPemToRSAPublicParameters(authSettings.JwtPublicKey);
        RSA rsa = RSA.Create();
        rsa.ImportParameters(publicRsaParameters);

        services.AddAuthentication()
            .AddJwtBearer(cfg =>
            {
                cfg.RequireHttpsMetadata = false;
                cfg.SaveToken = true;

                cfg.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new RsaSecurityKey(rsa),
                    ValidateIssuer = true,
                    ValidIssuer = "IrcMonitor",
                    ValidateAudience = true,
                    ValidAudience = "IrcMonitor",
                    CryptoProviderFactory = new CryptoProviderFactory()
                    {
                        CacheSignatureProviders = false
                    }
                };
            });

        services.AddAuthorization(options =>
            options.AddPolicy("CanPurge", policy => policy.RequireRole("Administrator")));

        return services;
    }
}
