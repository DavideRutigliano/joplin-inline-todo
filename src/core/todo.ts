import joplin from 'api';
import { markTaskComplete, setTaskDueDate } from '../utils/joplin';
import { getOrCreateMdTasksNotebook } from '../storage/todo';
import { parseCheckboxesFromMarkdown } from './checkbox';
import { getAllNotes } from '../utils/joplin';
import { Checkbox } from 'src/model/checkbox';

export async function syncCheckboxTodos(noteId: string, body: string): Promise<string> {
    const notebookId = await getOrCreateMdTasksNotebook();

    const checkboxes = parseCheckboxesFromMarkdown(body);
    const newLines = body.split('\n');
    console.info("Checkboxes to sync:", checkboxes);

    // // Track existing todos by their todoId
    const existingTodos = await getAllNotes(notebookId);
    console.log("Existing todos:", existingTodos);
    
    // // Cleanup: delete todos that are no longer referenced in the markdown
    // const markdownTodoIds = new Set(checkboxes.map(cb => cb.metadata.todoId).filter(Boolean));

    // for (const todo of existingTodos) {
    //     if (!markdownTodoIds.has(todo.id)) {
    //         // Delete todos no longer referenced in the markdown
    //         await joplin.data.delete(['notes', todo.id]);
    //     }
    // }

    // Sync checkboxes with todos
    for (const checkbox of checkboxes) {
        console.info("Processing checkbox:", checkbox);

        const todo = {
            title: checkbox.content,
            parent_id: notebookId,
            is_todo: 1,
            body: checkbox.description || '',
            todo_completed: checkbox.isChecked ? Date.now() : 0,
            todo_due: checkbox.alarm ? new Date(checkbox.alarm).getTime() : 0,
        };
        console.info("Todo object:", todo);

        if (!checkbox.todoId) {
            // Create new todo
            const newTodo = await joplin.data.post(['notes'], null, todo);
            newLines[checkbox.lineIndex] += ` ${generateInlineMetadataComment(newTodo.id, checkbox)}`;
            console.info("Created new todo:", newTodo);
        } else {
            // Update existing todo
            const existing = await joplin.data.get(['notes', checkbox.todoId], { fields: ['todo_due', 'todo_completed', 'body'] });
            console.info("Existing todo:", existing);

            // Update completion status if changed
            if ((existing.todo_completed === 1) !== checkbox.isChecked) {
                await markTaskComplete(checkbox.todoId);
                console.info("Updated todo completion status:", checkbox.todoId);
            }

            // Update description if changed
            if (existing.body !== checkbox.description) {
                await joplin.data.put(['notes', checkbox.todoId], null, {
                    body: checkbox.description,
                });
                console.info("Updated todo description:", checkbox.todoId);
            }

            // Update alarm if changed
            if (existing.todo_due !== (checkbox.alarm ? new Date(checkbox.alarm).getTime() : null)) {
                await setTaskDueDate(checkbox.todoId, new Date(checkbox.alarm));
                console.info("Updated todo alarm:", checkbox.todoId);
            }

            const commentRegex = new RegExp(`<!-- inlineTodoId:${checkbox.todoId}[^>]*-->`);
            const comment = generateInlineMetadataComment(checkbox.todoId, checkbox);
            newLines[checkbox.lineIndex] = newLines[checkbox.lineIndex].replace(commentRegex, comment);
            console.info("Updated todo comment:", checkbox.todoId);
        }
    }

    return newLines.join('\n');
}

export function generateInlineMetadataComment(todoId: string, checkbox: Checkbox): string {
    const parts: string[] = [`inlineTodoId:${todoId}`];

    if (checkbox.alarm) {
        parts.push(`alarm:${checkbox.alarm}`);
    }

    if (checkbox.recurrence) {
        parts.push(`recurrence:${checkbox.recurrence}`);
    }

    if (checkbox.description) {
        parts.push(`description:"${checkbox.description}"`);
    }

    return `<!-- ${parts.join(' ')} -->`;
}
