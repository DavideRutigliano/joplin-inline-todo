import joplin from 'api';
import { getOrCreateMdTasksNotebook } from '../storage/todo';
import { parseCheckboxesFromMarkdown } from './checkbox';

export async function syncCheckboxTodos(noteId: string, body: string): Promise<string> {
    const notebookId = await getOrCreateMdTasksNotebook();

    const checkboxes = parseCheckboxesFromMarkdown(body);
    const newLines = body.split('\n');

    for (const checkbox of checkboxes) {
        if (!checkbox.todoId) {
            const todo = await joplin.data.post(['notes'], null, {
                title: checkbox.content,
                is_todo: 1,
                parent_id: notebookId,
                todo_completed: checkbox.isChecked ? 1 : 0,
            });
            newLines[checkbox.lineIndex] += ` <!-- inlineTodoId:${todo.id} -->`;
        } else {
            const existing = await joplin.data.get(['notes', checkbox.todoId], { fields: ['todo_completed'] });
            if ((existing.todo_completed === 1) !== checkbox.isChecked) {
                await joplin.data.put(['notes', checkbox.todoId], null, {
                    todo_completed: checkbox.isChecked ? 1 : 0,
                });
            }
        }
    }
    return newLines.join('\n');
}
