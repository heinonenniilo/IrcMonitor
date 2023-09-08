using System.Text.RegularExpressions;
using IrcMonitor.Application.Common.Interfaces;
using IrcMonitor.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace IrcMonitor.Infrastructure.Services;
public class RowInsertService : IRowInsertService
{
    private readonly IApplicationDbContext _context;
    private readonly ILogger _logger;
    public RowInsertService(IApplicationDbContext context, ILoggerFactory loggerFactory)
    {
        _context = context;
        _logger = loggerFactory.CreateLogger<RowInsertService>();
    }

    public async Task ProcessFile(string fileName, string content)
    {

        if (await _context.ProcessedLogFiles.AnyAsync(x => x.FileName == fileName)) {
            _logger.LogWarning($"File {fileName} already processed");
            return;
        }

        // Capture everything before the last dot, then capture the date pattern, followed by ".log"
        var regex = new Regex(@"^(.*)\.(?=\d{4}-\d{2}-\d{2}\.log$)(\d{4}-\d{2}-\d{2})");

        var match = regex.Match(fileName);
        if (!match.Success)
        {
            throw new Exception("Invalid filename");
        }

        var channel = match.Groups[1].Value;
        var date = DateTime.Parse(match.Groups[2].Value);

        var correspondingChannel = await _context.IrcChannels.FirstOrDefaultAsync(x => x.Name == channel);
        correspondingChannel ??= new IrcChannel()
            {
                Name = channel,
            };

        var messageRegex = new Regex(@"^(\d{2}):(\d{2})\s+<[@+\s]?([^\s>]+)>\s+(.+)$");
        var ircRowsToInsert = new List<IrcRow>();

        using (var reader = new StringReader(content))
        {
            var line = await reader.ReadLineAsync();
            while (line != null)
            {
                var rowMatch = messageRegex.Match(line.Trim());

                if (rowMatch.Success)
                {
                    var hour = int.Parse(rowMatch.Groups[1].Value);
                    var minute = int.Parse(rowMatch.Groups[2].Value);

                    var timestamp = new DateTime(date.Year, date.Month, date.Day, hour, minute, 0);
                    ircRowsToInsert.Add(new IrcRow()
                    {
                        Channel = correspondingChannel,
                        Nick = rowMatch.Groups[3].Value,
                        Message = rowMatch.Groups[4].Value,
                        TimeStamp = timestamp
                });
                } else
                {
                    _logger.LogInformation($"Invalid row with content {line}");
                }
                line = await reader.ReadLineAsync();
            }
        }

        await _context.ProcessedLogFiles.AddAsync (new ProcessedLogFile() {
            FileName = fileName,
            Channel = correspondingChannel,
            RowCount = ircRowsToInsert.Count
        });

        await _context.IrcRows.AddRangeAsync( ircRowsToInsert );
        await _context.SaveChangesAsync(CancellationToken.None);

        _logger.LogInformation($"Finished processing file {fileName}. Inserted a total of {ircRowsToInsert.Count} rows");
    }
}
