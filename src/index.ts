import joplin from 'api';

import { onNoteChange } from './handlers/noteChangeHandler';

joplin.plugins.register({
	onStart: async function() {
		await joplin.settings.registerSection('settings.daviderutigliano.todo', {
			label: 'Inline TODO',
			iconName: 'fa fa-check'
		});

		await joplin.workspace.onNoteSelectionChange(async () => {
			const currentNote = await joplin.workspace.selectedNote();
			const note = await joplin.workspace.selectedNote();
			if (note) await onNoteChange(note.id);
		});
	},
});
