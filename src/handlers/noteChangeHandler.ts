import joplin from 'api';
import { syncCheckboxTodos } from '../core/todo';

export async function onNoteChange(noteId: string) {
    const note = await joplin.data.get(['notes', noteId], { fields: ['body', 'title'] });
    const updatedBody = await syncCheckboxTodos(noteId, note.body);

    if (updatedBody !== note.body) {
        await joplin.data.put(['notes', noteId], null, { body: updatedBody });
    }
}
