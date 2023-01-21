using System.Globalization;
using IrcMonitor.Application.Common.Interfaces;
using IrcMonitor.Application.TodoLists.Queries.ExportTodos;
using IrcMonitor.Infrastructure.Files.Maps;
using CsvHelper;

namespace IrcMonitor.Infrastructure.Files;

public class CsvFileBuilder : ICsvFileBuilder
{
    public byte[] BuildTodoItemsFile(IEnumerable<TodoItemRecord> records)
    {
        using var memoryStream = new MemoryStream();
        using (var streamWriter = new StreamWriter(memoryStream))
        {
            using var csvWriter = new CsvWriter(streamWriter, CultureInfo.InvariantCulture);

            csvWriter.Configuration.RegisterClassMap<TodoItemRecordMap>();
            csvWriter.WriteRecords(records);
        }

        return memoryStream.ToArray();
    }
}
