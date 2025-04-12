
import { Checkbox } from '../model/checkbox';

export function parseCheckboxesFromMarkdown(body: string): Checkbox[] {
    const lines = body.split('\n');
    const checkboxes: Checkbox[] = [];

    const checkboxRegex = /^[-*] \[( |x)] (.*?)( <!-- inlineTodoId:(.+) -->)?$/;

    for (let i = 0; i < lines.length; i++) {
        const match = lines[i].match(checkboxRegex);
        if (match) {
            checkboxes.push({
                lineText: lines[i],
                isChecked: match[1] === 'x',
                content: match[2],
                todoId: match[4],
                lineIndex: i,
            });
        }
    }

    return checkboxes;
}

function parseCheckboxMetadata(comment: string) {
	const result: {
		id?: string;
		alarm?: string;
		recurrence?: string;
	} = {};

	const idMatch = comment.match(/todoid:([a-f0-9]+)/);
	if (idMatch) result.id = idMatch[1];

	const alarmMatch = comment.match(/alarm:([0-9T:-]+)/);
	if (alarmMatch) result.alarm = alarmMatch[1];

	const recurrenceMatch = comment.match(/recurrence:(\w+)/);
	if (recurrenceMatch) result.recurrence = recurrenceMatch[1];

	return result;
}