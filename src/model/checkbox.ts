export interface Checkbox {
    lineText: string;       // Full raw line text
    isChecked: boolean;     // Checked status
    content: string;        // Main checkbox text (title of todo)
    lineIndex: number;      // Line number in the markdown body

    // Mapped metadata
    todoId: string;
	alarm?: string;
	recurrence?: string;
	description?: string;
}
