﻿using System.Security.Cryptography;
using Google.Apis.Auth.OAuth2.Flows;
using Google.Apis.Auth.OAuth2;
using IrcMonitor.Application.Common.Interfaces;
using IrcMonitor.Domain.Models;
using IrcMonitor.Infrastructure.Identity;
using IrcMonitor.Infrastructure.Persistence;
using IrcMonitor.Infrastructure.Persistence.Interceptors;
using IrcMonitor.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using Google.Apis.Auth;
using Azure.Identity;
using Azure.Security.KeyVault.Keys;

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
        services.AddScoped<ICookieService, CookieService>();
        services.AddScoped<IStatisticsService, StatisticsService>();
        services.AddScoped(typeof(IPaginationService<>), typeof(PaginationService<>)); // Todo Check?

        // Add some settings

        var authSettings = configuration.GetRequiredSection("AuthenticationSettings").Get<AuthenticationSettings>();

        services.AddScoped(x =>
        {
            var flow = new GoogleAuthorizationCodeFlow(new GoogleAuthorizationCodeFlow.Initializer()
            {
                ClientSecrets = new ClientSecrets()
                {
                    ClientId = authSettings.GoogleAuth.ClientId,
                    ClientSecret = authSettings.GoogleAuth.ClientSecret
                },
            });
            var settings = new GoogleJsonWebSignature.ValidationSettings();
            settings.Audience = new List<string>() { authSettings.GoogleAuth.ClientId };
            return flow;
        });

        services.AddScoped<IGoogleAuthService, GoogleAuthService>();
 
        services.AddSingleton(authSettings);
        services.AddSingleton(configuration.GetRequiredSection(nameof(IrcStatisticsSettings)).Get<IrcStatisticsSettings>());

        KeyClient keyClient = !string.IsNullOrEmpty(authSettings.KeyVault.KeyVaultUrl) ? new KeyClient(new Uri(authSettings.KeyVault.KeyVaultUrl), new DefaultAzureCredential()) : null;
        services.AddSingleton(x =>
        {
            return keyClient;
        });

        RsaSecurityKey signKey;
        if (authSettings.UseKeyFromKeyVault)
        {
            var key = keyClient.GetKey(authSettings.KeyVault.KeyName);
            signKey = new RsaSecurityKey(new RSAParameters()
            {
                Modulus = key.Value.Key.N,
                Exponent = key.Value.Key.E
            });
        } else
        {
            if (!string.IsNullOrEmpty(authSettings.RsaPrivateKeyLocation) && !string.IsNullOrEmpty(authSettings.RsaPublicKeyLocation))
            {
                var publicKey = RSA.Create();
                publicKey.ImportFromPem(File.ReadAllText(authSettings.RsaPublicKeyLocation));

                var privateKey = RSA.Create();
                privateKey.ImportFromPem(File.ReadAllText(authSettings.RsaPrivateKeyLocation));
                authSettings.RsaPrivateParameters = privateKey.ExportParameters(true);

                signKey = new RsaSecurityKey(publicKey.ExportParameters(false));
            } else
            {
                var rsa = RSA.Create();
                authSettings.RsaPrivateParameters = rsa.ExportParameters(true);
                signKey = new RsaSecurityKey(rsa.ExportParameters(false));
            }

        }

        services.AddAuthentication()
            .AddJwtBearer(cfg =>
            {
                cfg.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = signKey,
                    ValidateIssuer = true,
                    ValidIssuer = authSettings.GetIssuer,
                    ValidateAudience = true,
                    ValidAudience = authSettings.PageUrl,
                    CryptoProviderFactory = new CryptoProviderFactory()
                    {
                        CacheSignatureProviders = false
                    }
                };
            });

        return services;
    }
}
