using IrcMonitor.Application.Common.Interfaces;
using IrcMonitor.Infrastructure.Persistence;
using IrcMonitor.Infrastructure.Persistence.Interceptors;
using IrcMonitor.Infrastructure.Services;
using IrcMonitor.RowInserterFunction.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

var host = new HostBuilder()
    .ConfigureFunctionsWorkerDefaults()
        .ConfigureServices((hostContext, services) =>
        {
            var dbConnectionString = Environment.GetEnvironmentVariable("DBConnectionString");
            services.AddDbContext<ApplicationDbContext>(options =>
                options.UseSqlServer(dbConnectionString));
            services.AddScoped<IApplicationDbContext>(provider => provider.GetRequiredService<ApplicationDbContext>());
            services.AddScoped<IRowInsertService, RowInsertService>();
            services.AddScoped<AuditableEntitySaveChangesInterceptor>();
            services.AddScoped<IStatisticsService, StatisticsService>();
            services.AddTransient<IDateTime, DateTimeService>();
            services.AddSingleton<ICurrentUserService, FunctionIdentifierService>();
        })
    .Build();

host.Run();
