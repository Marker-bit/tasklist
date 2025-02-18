import { TextCursorInput } from "lucide-react";
import { useState } from "react";

export default function AddTask({
  addTask,
}: {
  addTask: (task: string) => void;
}) {
  const [task, setTask] = useState("");
  return (
    <div className="border rounded-md p-2 flex gap-2 items-center bg-background">
      <TextCursorInput className="size-6 text-muted-foreground" />
      <form
        className="w-full"
        onSubmit={(e) => {
          e.preventDefault();
          if (task != "") {
            addTask(task);
          }
          setTask("");
        }}
      >
        <input
          className="bg-transparent outline-none w-full"
          placeholder="Добавить задачу"
          value={task}
          onChange={(e) => setTask(e.target.value)}
          onBlur={() => setTask("")}
        />
      </form>
    </div>
  );
}
