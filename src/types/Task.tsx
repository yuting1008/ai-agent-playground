export type Task = {
    id: string;
    text: string;
    done: boolean;
}

export type TaskAction = {
    type: 'added' | 'changed' | 'deleted';
    task: Task;
}
