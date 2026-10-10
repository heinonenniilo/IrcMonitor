using System;
using IrcMonitor.Infrastructure.Persistence;
using Microsoft.AspNetCore.HttpOverrides;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddApplicationServices();
builder.Services.AddInfrastructureServices(builder.Configuration);
builder.Services.AddWebUIServices();

builder.Services.Configure<ForwardedHeadersOptions>(options =>
{
    options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto | ForwardedHeaders.XForwardedHost;
});


if (builder.Environment.IsDevelopment())
{
    // TODO FIX IN UI
    builder.Services.AddCors(opts =>
    {
        opts.AddPolicy("AllowAll", builder =>
        {
            builder.WithOrigins("https://localhost:5173", "http://localhost:5173")
                    .AllowAnyMethod()
                    .AllowAnyHeader()
            .AllowCredentials();
        });
    });
}


var app = builder.Build();

app.UseForwardedHeaders();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseMigrationsEndPoint();
    app.UseCors("AllowAll");

    // Initialise and seed database
    using (var scope = app.Services.CreateScope())
    {
        var initialiser = scope.ServiceProvider.GetRequiredService<ApplicationDbContextInitialiser>();
        await initialiser.InitialiseAsync();
    }
}
else
{
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}


app.UseHealthChecks("/health");
app.UseHttpsRedirection();
app.UseDefaultFiles();
app.UseStaticFiles();


/*
app.UseSwaggerUi3(settings =>
{
    settings.Path = "/api";
    settings.DocumentPath = "/api/specification.json";
});
*/
app.UseSwaggerUi();
app.UseRouting();

app.UseOpenApi();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller}/{action=Index}/{id?}");

app.UseSpa(spa =>
{
    spa.Options.SourcePath = "wwwroot";
});

app.Run();
