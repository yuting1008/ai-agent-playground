import { createContext, useContext, Dispatch } from 'react';
import { Task, TaskAction } from '../types/Task';
import { useImmerReducer } from 'use-immer';

const TasksContext = createContext<Task[] | null>(null);

const TasksDispatchContext = createContext<Dispatch<any> | null>(null);

const initialTasks: Task[] = [
  { id: '0', text: 'Philosopher’s Path', done: true },
  { id: '1', text: 'Visit the temple', done: false },
  { id: '2', text: 'Drink matcha', done: false },
];

export function TasksProvider({ children }: { children: React.ReactNode }) {
  const [tasks, dispatch] = useImmerReducer(tasksReducer, initialTasks);

  return (
    <TasksContext.Provider value={tasks}>
      <TasksDispatchContext.Provider value={dispatch}>
        {children}
      </TasksDispatchContext.Provider>
    </TasksContext.Provider>
  );
}

export function useTasks() {
  return useContext(TasksContext);
}

export function useTasksDispatch() {
  return useContext(TasksDispatchContext);
}

function tasksReducer(tasks: Task[], action: TaskAction) {
  switch (action.type) {
    case 'added': {
      return [
        ...tasks,
        {
          id: action.task.id,
          text: action.task.text,
          done: false,
        },
      ];
    }

    case 'changed': {
      return tasks.map((t) => {
        if (t.id === action.task.id) {
          return action.task;
        } else {
          return t;
        }
      });
    }

    case 'deleted': {
      return tasks.filter((t) => t.id !== action.task.id);
    }

    default: {
      throw Error('Unknown action: ' + action.type);
    }
  }
}
