import joplin from 'api';

export async function getOrCreateMdTasksNotebook(): Promise<string> {
    const folders = await joplin.data.get(['folders']);
    let folder = folders.items.find(f => f.title === '.mdTasks');
    if (!folder) {
        folder = await joplin.data.post(['folders'], null, { title: '.mdTasks' });
    }
    return folder.id;
}
