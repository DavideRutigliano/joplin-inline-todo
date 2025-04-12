
import { Checkbox } from '../model/checkbox';

export function parseCheckboxesFromMarkdown(body: string): Checkbox[] {
	const lines = body.split('\n');
	const checkboxes: Checkbox[] = [];

	// Match checkbox and optional comment
	const checkboxRegex = /^[-*] \[( |x)] (.*?)( <!-- (.*?) -->)?$/;

	for (let i = 0; i < lines.length; i++) {
		const match = lines[i].match(checkboxRegex);
		if (match) {
			const isChecked = match[1] === 'x';
			const content = match[2];
			const metadataRaw = match[4] || '';

            const todoId = getMetadataValue(metadataRaw, /inlineTodoId:([^\s]+)/);
            const alarm = getMetadataValue(metadataRaw, /alarm:([^\s]+)/);
            const recurrence = getMetadataValue(metadataRaw, /recurrence:([^\s]+)/);
            const description = getMetadataValue(metadataRaw, /description:"([^"]+)"/);
			checkboxes.push({
				lineIndex: i,
				lineText: lines[i],
				isChecked,
				content,
				todoId: todoId,
                alarm: alarm ? alarm : "",
                recurrence: recurrence ? recurrence : "",
                description: description ? description : "",
			});
		}
	}
    console.info("Parsed checkboxes:", checkboxes);

	return checkboxes;
}

function getMetadataValue(metadataRaw: string, pattern: RegExp): string | undefined {
    return metadataRaw.match(pattern)?.[1];
}
