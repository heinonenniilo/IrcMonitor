using Hangfire;
using IrcMonitor.Application.Common.Interfaces;
using IrcMonitor.Domain.Models;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace IrcMonitor.Infrastructure.Jobs;

public class LogFileProcessorJob
{
    public const string JobId = "process-log-files";

    private readonly IServiceScopeFactory _scopeFactory;
    private readonly HangfireSettings _settings;
    private readonly ILogger<LogFileProcessorJob> _logger;

    public LogFileProcessorJob(IServiceScopeFactory scopeFactory, HangfireSettings settings, ILogger<LogFileProcessorJob> logger)
    {
        _scopeFactory = scopeFactory;
        _settings = settings;
        _logger = logger;
    }

    [DisableConcurrentExecution(timeoutInSeconds: 600)]
    [AutomaticRetry(Attempts = 0)]
    public async Task Run(CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(_settings.LogFolderPath) || !Directory.Exists(_settings.LogFolderPath))
        {
            _logger.LogWarning("Log folder {Folder} does not exist", _settings.LogFolderPath);
            return;
        }

        if (!string.IsNullOrWhiteSpace(_settings.ProcessedFolderPath) && !Directory.Exists(_settings.ProcessedFolderPath))
        {
            _logger.LogError("Processed folder {Folder} does not exist", _settings.ProcessedFolderPath);
            return;
        }

        var searchOption = _settings.Recursive ? SearchOption.AllDirectories : SearchOption.TopDirectoryOnly;
        var files = Directory.GetFiles(_settings.LogFolderPath, _settings.LogFileSearchPattern ?? "*.log", searchOption)
            .Where(x => !IsInProcessedFolder(x))
            .ToArray();
        if (files.Length == 0)
        {
            return;
        }

        _logger.LogInformation("Found {Count} log files in {Folder}", files.Length, _settings.LogFolderPath);

        foreach (var filePath in files)
        {
            cancellationToken.ThrowIfCancellationRequested();
            var fileName = Path.GetFileName(filePath);
            try
            {
                await ProcessFile(filePath, fileName, cancellationToken);
                MoveToProcessed(filePath, fileName);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to process file {FileName}", fileName);
            }
        }
    }

    private async Task ProcessFile(string filePath, string fileName, CancellationToken cancellationToken)
    {
        using var scope = _scopeFactory.CreateScope();
        var rowInsertService = scope.ServiceProvider.GetRequiredService<IRowInsertService>();
        var statisticsService = scope.ServiceProvider.GetRequiredService<IStatisticsService>();

        _logger.LogInformation("Start processing file with name {FileName}", fileName);
        var content = await File.ReadAllTextAsync(filePath, cancellationToken);
        var res = await rowInsertService.ProcessFile(fileName, content);
        _logger.LogInformation("Finished processing file with name {FileName}", fileName);

        if (res == null)
        {
            return;
        }

        _logger.LogInformation("Daily aggregate for channel id {ChannelId} / date {Date} triggered", res.Channel.Guid, res.Date);
        await statisticsService.UpdateChannelMonthlyStatistics(res.Channel.Guid, res.Date.Year, res.Date.Month, res.Date.Day, cancellationToken);
        _logger.LogInformation("Daily aggregates formed for channel id {ChannelId}", res.Channel.Guid);
    }

    private bool IsInProcessedFolder(string filePath)
    {
        if (string.IsNullOrWhiteSpace(_settings.ProcessedFolderPath))
        {
            return false;
        }

        var processedFolder = Path.TrimEndingDirectorySeparator(Path.GetFullPath(_settings.ProcessedFolderPath)) + Path.DirectorySeparatorChar;
        return Path.GetFullPath(filePath).StartsWith(processedFolder, StringComparison.OrdinalIgnoreCase);
    }

    private void MoveToProcessed(string filePath, string fileName)
    {
        if (string.IsNullOrWhiteSpace(_settings.ProcessedFolderPath))
        {
            return;
        }

        var destination = Path.Combine(_settings.ProcessedFolderPath, fileName);
        if (File.Exists(destination))
        {
            var uniqueName = $"{Path.GetFileNameWithoutExtension(fileName)}_{DateTime.UtcNow:yyyyMMddHHmmssfff}{Path.GetExtension(fileName)}";
            _logger.LogWarning("File {FileName} already exists in processed folder, moving as {UniqueName}", fileName, uniqueName);
            destination = Path.Combine(_settings.ProcessedFolderPath, uniqueName);
        }

        File.Move(filePath, destination);
    }
}
