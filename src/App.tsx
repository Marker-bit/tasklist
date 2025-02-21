import {
  closestCenter,
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { IDBPDatabase, openDB } from "idb";
import { Edit2, Loader2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import AddTask from "./components/AddTask";
import Task from "./components/Task";
import upgradeDb, { resetChecks } from "./lib/upgrade-db";
import { cn } from "./lib/utils";

function App() {
  // const [activeId, setActiveId] = useState<string | null>(null);
  const [tasks, setTasks] = useState<
    {
      id: string;
      title: string;
      done: boolean;
      lastReset: Date;
      order: number;
    }[]
  >([]);
  const [db, setDb] = useState<IDBPDatabase>();
  const sensors = useSensors(
    useSensor(MouseSensor),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    (async () => {
      const db = await openDB("tasklist", 3, {
        async upgrade(database, oldVersion, newVersion, transaction) {
          await upgradeDb(database, oldVersion, newVersion, transaction);
        },
      });
      await resetChecks(db);
      const tasks = await db.getAll("tasks");
      tasks.sort((a, b) => a.order - b.order);
      console.log(tasks);
      setTasks(tasks);
      setDb(db);
    })();
  }, []);

  async function addTask(title: string) {
    const id = uuidv4();
    const lastReset = new Date();
    let order;
    if (tasks.length === 0) {
      order = 0;
    } else {
      order = tasks[tasks.length - 1].order + 1;
    }
    await db?.add("tasks", { id, title, done: false, lastReset, order });
    setTasks((tasks) => [
      ...tasks,
      { id, title, done: false, lastReset, order },
    ]);
  }

  async function deleteTask(id: string) {
    await db?.delete("tasks", id);
    let lastOrder = -1;
    const localTasks = tasks.filter((t) => t.id !== id);
    for (const task of localTasks) {
      if (task.order - lastOrder != 1) {
        task.order = lastOrder + 1;
        await db?.put("tasks", task);
      }
      lastOrder = task.order;
    }
    setTasks(localTasks);
  }

  async function updateTitle(
    id: string,
    title: string,
    done: boolean,
    lastReset: Date
  ) {
    await db?.put("tasks", { id, title, done, lastReset });
    setTasks((tasks) => tasks.map((t) => (t.id === id ? { ...t, title } : t)));
  }

  async function setDone(
    id: string,
    title: string,
    done: boolean,
    lastReset: Date
  ) {
    await db?.put("tasks", { id, title, done, lastReset });
    setTasks((tasks) => tasks.map((t) => (t.id === id ? { ...t, done } : t)));
  }

  async function updateOrder(tasks: { order: number }[]) {
    for (let i = 0; i < tasks.length; i++) {
      if (tasks[i].order != i) {
        tasks[i].order = i;
        await db?.put("tasks", tasks[i]);
      }
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;

    if (active.id !== over.id) {
      let t = tasks;
      const oldIndex = t.indexOf(t.find((a) => a.id === active.id)!);
      const newIndex = t.indexOf(t.find((b) => b.id === over.id)!);
      t = arrayMove(t, oldIndex, newIndex);
      setTasks(t);
      updateOrder(t);
    }
    // setActiveId(null);
  }

  const [editing, setEditing] = useState(false);

  if (!db) {
    return (
      <div className="h-[100svh] flex flex-col gap-2 items-center justify-center">
        <Loader2 className="size-8 animate-spin" />
        <p className="text-2xl">Загрузка</p>
      </div>
    );
  }
  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <div className="p-4">
        <div className="flex items-center">
          <div className="mb-2 p-2 border rounded-xl w-fit pr-4">
            <h1 className="font-bold text-3xl">Привет!</h1>
            <h2 className="text-muted-foreground">Задачи на сегодня:</h2>
          </div>
          <button
            className={cn(
              "ml-auto p-2 rounded-full hover:bg-blue-50 dark:hover:bg-blue-950 transition",
              editing &&
                "bg-blue-100 hover:bg-blue-200 dark:bg-blue-900 dark:hover:bg-blue-800"
            )}
            onClick={() => setEditing((editing) => !editing)}
          >
            <Edit2
              className={cn("size-5 transition", editing && "text-blue-500")}
            />
          </button>
        </div>
        <div className="flex flex-col gap-1 items-stretch">
          <SortableContext items={tasks} strategy={verticalListSortingStrategy}>
            {tasks.map(({ id, title, done, lastReset: lr }) => (
              <Task
                key={id}
                id={id}
                title={title}
                done={done}
                editing={editing}
                updateTitle={(t) => updateTitle(id, t, done, lr)}
                deleteTask={() => deleteTask(id)}
                setDone={(d) => setDone(id, title, d, lr)}
              />
            ))}
          </SortableContext>
          {/* <DragOverlay>
            {activeId ? (
              <Task
                key={activeId}
                id={activeId}
                title={tasks.find((t) => t.id === activeId)!.title}
                done={tasks.find((t) => t.id === activeId)!.done}
                editing={editing}
                updateTitle={() => {}}
                deleteTask={() => {}}
                setDone={() => {}}
              />
            ) : null}
          </DragOverlay> */}
          <AnimatePresence mode="popLayout">
            {editing && (
              <motion.div
                initial={{ opacity: 0, y: "100%" }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: "100%" }}
                className="sticky bottom-2"
              >
                <AddTask addTask={addTask} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </DndContext>
  );
}

export default App;
