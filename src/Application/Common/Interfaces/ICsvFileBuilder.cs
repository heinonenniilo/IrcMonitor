using IrcMonitor.Application.TodoLists.Queries.ExportTodos;

namespace IrcMonitor.Application.Common.Interfaces;

public interface ICsvFileBuilder
{
    byte[] BuildTodoItemsFile(IEnumerable<TodoItemRecord> records);
}
