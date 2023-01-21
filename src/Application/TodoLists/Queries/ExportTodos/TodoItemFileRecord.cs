using IrcMonitor.Application.Common.Mappings;
using IrcMonitor.Domain.Entities;

namespace IrcMonitor.Application.TodoLists.Queries.ExportTodos;

public class TodoItemRecord : IMapFrom<TodoItem>
{
    public string? Title { get; set; }

    public bool Done { get; set; }
}
