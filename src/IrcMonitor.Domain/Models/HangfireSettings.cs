namespace IrcMonitor.Domain.Models;

public class HangfireSettings
{
    public bool Enabled { get; set; }
    public string LogFolderPath { get; set; }
    public string ProcessedFolderPath { get; set; }
    public string LogFileSearchPattern { get; set; } = "*.log";
    public bool Recursive { get; set; } = true;
    public string ProcessLogFilesCron { get; set; } = "*/5 * * * *";
    public bool EnableDashboard { get; set; }
}
