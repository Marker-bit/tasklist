import { cn } from "@/lib/utils";
import { useSortable } from "@dnd-kit/sortable";
import { Check, Edit2, GripVertical, Trash } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useRef, useState } from "react";
import { CSS } from "@dnd-kit/utilities";
import EditDrawer from "./EditDrawer";

export default function Task({
  title,
  done,
  setDone,
  editing,
  updateTitle,
  deleteTask,
  id,
}: {
  id: string;
  title: string;
  done: boolean;
  setDone: (done: boolean) => void;
  editing: boolean;
  updateTitle: (title: string) => void;
  deleteTask: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  const [editingTitle, setEditingTitle] = useState(false);
  const [newTitle, setNewTitle] = useState(title);
  const inputRef = useRef<HTMLInputElement>(null);
  const [editOpen, setEditOpen] = useState(false);

  return (
    <button
      className={cn(
        "border rounded-md p-2 flex gap-2 items-center transition-colors overflow-hidden",
        !editing &&
          (done
            ? "bg-green-200 border-green-300 dark:bg-green-900 dark:border-green-800"
            : "bg-red-100 border-red-200 dark:bg-red-900 dark:border-red-800")
      )}
      onClick={() => {
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        !editing && setDone(!done);
      }}
      ref={setNodeRef}
      style={style}
      {...attributes}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        {done ? (
          <motion.div
            initial={{ scale: 0, rotateZ: 0 }}
            animate={{ scale: 1, rotateZ: 360 }}
            exit={{ scale: 0, rotateZ: 0 }}
            transition={{ duration: 0.5, type: "spring", bounce: 0 }}
            className="bg-green-500 border-2 border-green-500 rounded-full w-6 h-6 flex items-center justify-center aspect-square"
            key="b"
          >
            <Check className="w-4 h-4 text-white" />
          </motion.div>
        ) : (
          <motion.div
            initial={{ scale: 2, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 2, opacity: 0 }}
            transition={{ duration: 0.5, type: "spring", bounce: 0 }}
            className="border-2 border-red-300 dark:border-red-700 rounded-full w-6 h-6 flex items-center justify-center aspect-square"
            key="a"
          />
        )}
      </AnimatePresence>

      {editing && (
        <form
          className={cn(
            "w-full",
            !editingTitle && "opacity-0 scale-0 pointer-events-none absolute"
          )}
          onSubmit={(e) => {
            e.preventDefault();
            setEditingTitle(false);
            updateTitle(newTitle);
          }}
        >
          <input
            ref={inputRef}
            className={cn(
              "bg-transparent outline-none w-full",
              !editingTitle && "absolute pointer-events-none opacity-0 scale-0"
            )}
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Введите название..."
          />
        </form>
      )}
      {!editingTitle && title}

      <EditDrawer open={editOpen} setOpen={setEditOpen} />

      <AnimatePresence>
        {editing && (
          <motion.div
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 100, opacity: 0 }}
            className="ml-auto flex items-center gap-1"
          >
            <button {...listeners}>
              <GripVertical className="w-6 h-6" />
            </button>
            <button
              onClick={() => {
                // if (!editingTitle) {
                //   inputRef.current?.focus();
                //   setNewTitle(title);
                // } else {
                //   inputRef.current?.blur();
                // }
                // setEditingTitle((a) => !a);
                setEditOpen(true);
              }}
            >
              <Edit2 className="size-5" />
            </button>
            <button onClick={deleteTask}>
              <Trash className="size-5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  );
}
