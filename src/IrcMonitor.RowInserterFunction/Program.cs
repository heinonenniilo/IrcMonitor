using IrcMonitor.Application.Common.Interfaces;
using IrcMonitor.Infrastructure.Persistence;
using IrcMonitor.Infrastructure.Persistence.Interceptors;
using IrcMonitor.Infrastructure.Services;
using IrcMonitor.RowInserterFunction.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;


var host = new HostBuilder()
        .ConfigureFunctionsWorkerDefaults()
        .ConfigureAppConfiguration(builder =>
        {
            builder.AddConfiguration(new ConfigurationBuilder().AddUserSecrets<Program>().Build());
        })
        .ConfigureServices((hostContext, services) =>
        {
            services.AddDbContext<ApplicationDbContext>((s, options) =>
                {
                    var configuration = s.GetService<IConfiguration>();
                    var connectionString = configuration.GetValue<string>("DBConnectionString");
                    options.UseSqlServer(connectionString);
                }
            );
            services.AddScoped<IApplicationDbContext>(provider => provider.GetRequiredService<ApplicationDbContext>());
            services.AddScoped<IRowInsertService, RowInsertService>();
            services.AddScoped<AuditableEntitySaveChangesInterceptor>();
            services.AddScoped<IStatisticsService, StatisticsService>();
            services.AddTransient<IDateTime, DateTimeService>();
            services.AddSingleton<ICurrentUserService, FunctionIdentifierService>();
        })
        .Build();

    host.Run();



