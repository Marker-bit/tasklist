import {
  closestCenter,
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { IDBPDatabase, openDB } from "idb";
import { Edit2, Loader2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import AddTask from "./components/AddTask";
import { ModeToggle } from "./components/ModeToggle";
import Task from "./components/Task";
import { Toggle } from "./components/ui/toggle";
import upgradeDb, { resetChecks } from "./lib/upgrade-db";
import { numWord } from "./lib/utils";
import confetti from "canvas-confetti";

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

  const tasksNotDone = useMemo(
    () => tasks.filter((t) => !t.done).length,
    [tasks]
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
    lastReset: Date,
    order: number
  ) {
    await db?.put("tasks", { id, title, done, lastReset, order });
    setTasks((tasks) =>
      tasks.map((t) => (t.id === id ? { ...t, title, order } : t))
    );
  }

  async function setDone(
    id: string,
    title: string,
    done: boolean,
    lastReset: Date,
    order: number
  ) {
    if (!done) {
      setTasks((tasks) =>
        tasks.map((t) => (t.id === id ? { ...t, done, order } : t))
      );
      await db?.put("tasks", { id, title, done, lastReset, order });
      return;
    }
    setTasks((tasks) =>
      tasks.map((t) => (t.id === id ? { ...t, done, order } : t))
    );
    let showConfetti = true;
    for (const task of tasks) {
      if (!task.done && task.id !== id) {
        showConfetti = false;
        break;
      }
    }
    if (showConfetti) {
      const defaults = {
        spread: 360,
        ticks: 50,
        gravity: 0,
        decay: 0.94,
        startVelocity: 30,
        colors: ["FFE400", "FFBD00", "E89400", "FFCA6C", "FDFFB8"],
      };

      function shoot() {
        confetti({
          ...defaults,
          particleCount: 40,
          scalar: 1.2,
          shapes: ["star"],
        });

        confetti({
          ...defaults,
          particleCount: 10,
          scalar: 0.75,
          shapes: ["circle"],
        });
      }

      setTimeout(shoot, 0);
      setTimeout(shoot, 100);
      setTimeout(shoot, 200);
    }
    await db?.put("tasks", { id, title, done, lastReset, order });
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
            <h2 className="text-muted-foreground">
              {format(new Date(), "d MMMM yyyy 'года'", { locale: ru })}
            </h2>
            <h3 className="text-muted-foreground text-sm">
              {tasksNotDone === 0
                ? "Все задачи выполнены!"
                : tasksNotDone +
                  " " +
                  numWord(
                    tasksNotDone,
                    "задача не выполнена",
                    "задачи не выполнены",
                    "задач не выполнено"
                  )}
            </h3>
          </div>
          <div className="ml-auto flex gap-2 items-center">
            <ModeToggle />
            <Toggle
              pressed={editing}
              onPressedChange={setEditing}
              aria-label="Переключить режим редактирования"
            >
              <Edit2 className="h-4 w-4" />
            </Toggle>
          </div>
        </div>
        <div className="flex flex-col gap-1 items-stretch">
          <SortableContext items={tasks} strategy={verticalListSortingStrategy}>
            {tasks.map(({ id, title, done, lastReset: lr, order: or }) => (
              <Task
                key={id}
                id={id}
                title={title}
                done={done}
                editing={editing}
                updateTitle={(t) => updateTitle(id, t, done, lr, or)}
                deleteTask={() => deleteTask(id)}
                setDone={(d) => setDone(id, title, d, lr, or)}
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
