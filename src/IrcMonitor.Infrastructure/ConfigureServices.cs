using System.Security.Cryptography;
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
using Azure.Security.KeyVault.Secrets;
using Azure.Core;
using Hangfire;
using IrcMonitor.Infrastructure.Jobs;

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

        services.AddScoped<IEncryptionService, EncryptionService>();
        services.AddScoped<IGoogleAuthService, GoogleAuthService>();
 
        services.AddSingleton(authSettings);
        services.AddSingleton(configuration.GetRequiredSection(nameof(IrcStatisticsSettings)).Get<IrcStatisticsSettings>());
        services.AddHangfireServices(configuration);

        TokenCredential keyVaultCredential = !string.IsNullOrEmpty(authSettings.KeyVault.KeyVaultUrl) ? GetKeyVaultCredential(authSettings.KeyVault) : null;
        KeyClient keyClient = keyVaultCredential != null ?
            new KeyClient(new Uri(authSettings.KeyVault.KeyVaultUrl), keyVaultCredential) : null;
        services.AddSingleton(x =>
        {
            return keyClient;
        });

        authSettings.CookieKeyBytes = LoadCookieKey(authSettings, keyVaultCredential);

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

	private static IServiceCollection AddHangfireServices(this IServiceCollection services, IConfiguration configuration)
	{
		var settings = configuration.GetSection(nameof(HangfireSettings)).Get<HangfireSettings>() ?? new HangfireSettings();
		services.AddSingleton(settings);

		if (!settings.Enabled)
		{
			return services;
		}

		services.AddScoped<IRowInsertService, RowInsertService>();
		services.AddTransient<LogFileProcessorJob>();
		services.AddHangfire(config => config
			.SetDataCompatibilityLevel(CompatibilityLevel.Version_180)
			.UseSimpleAssemblyNameTypeSerializer()
			.UseRecommendedSerializerSettings()
			.UseSqlServerStorage(configuration.GetConnectionString("DefaultConnection")));
		services.AddHangfireServer();

		return services;
	}

	public static IServiceProvider RegisterHangfireJobs(this IServiceProvider serviceProvider)
	{
		var settings = serviceProvider.GetRequiredService<HangfireSettings>();
		if (!settings.Enabled)
		{
			return serviceProvider;
		}

		serviceProvider.GetRequiredService<IRecurringJobManager>().AddOrUpdate<LogFileProcessorJob>(
			LogFileProcessorJob.JobId,
			job => job.Run(CancellationToken.None),
			settings.ProcessLogFilesCron);

		return serviceProvider;
	}

    private static byte[] LoadCookieKey(AuthenticationSettings authSettings, TokenCredential keyVaultCredential)
    {
        string base64Key;
        if (authSettings.UseCookieKeyFromKeyVault)
        {
            if (keyVaultCredential == null || string.IsNullOrEmpty(authSettings.KeyVault.CookieKeyName))
            {
                throw new InvalidOperationException("KeyVaultUrl and KeyVault:CookieKeyName must be set when UseCookieKeyFromKeyVault is true");
            }
            var secretClient = new SecretClient(new Uri(authSettings.KeyVault.KeyVaultUrl), keyVaultCredential);
            base64Key = secretClient.GetSecret(authSettings.KeyVault.CookieKeyName).Value.Value;
        }
        else
        {
            base64Key = authSettings.CookieKey;
        }

        if (string.IsNullOrEmpty(base64Key))
        {
            throw new InvalidOperationException("Cookie encryption key is not configured");
        }

        var key = Convert.FromBase64String(base64Key);
        if (key.Length != 32)
        {
            throw new InvalidOperationException("Cookie encryption key must be 32 bytes (256 bits), base64 encoded");
        }
        return key;
    }

    private static TokenCredential GetKeyVaultCredential(KeyVaultSettings settings)
    {
        var hasSecret = !string.IsNullOrEmpty(settings.ClientSecret);
        Console.WriteLine($"KeyVault auth: ClientId={(string.IsNullOrEmpty(settings.ClientId) ? "<not set>" : settings.ClientId)}, TenantId={(string.IsNullOrEmpty(settings.TenantId) ? "<not set>" : settings.TenantId)}, ClientSecret={(hasSecret ? $"<set, length {settings.ClientSecret.Length}>" : "<not set>")}");

        if (hasSecret)
        {
            if (string.IsNullOrEmpty(settings.TenantId) || string.IsNullOrEmpty(settings.ClientId))
            {
                throw new InvalidOperationException("KeyVault TenantId and ClientId must be set when ClientSecret is used");
            }
            Console.WriteLine("KeyVault auth: using ClientSecretCredential");
            return new ClientSecretCredential(settings.TenantId, settings.ClientId, settings.ClientSecret);
        }

        Console.WriteLine("KeyVault auth: using DefaultAzureCredential");
        return new DefaultAzureCredential();
    }
}
