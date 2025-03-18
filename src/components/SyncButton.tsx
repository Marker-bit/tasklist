import { CloudDownloadIcon, CloudUploadIcon } from "lucide-react";
import { Button } from "./ui/button";
import { useState } from "react";
import { toast } from "sonner";

export default function SyncButton({
  tasks,
  setTasks,
}: {
  tasks: {
    id: string;
    title: string;
    done: boolean;
    lastReset: Date;
    order: number;
  }[];
  setTasks: React.Dispatch<
    React.SetStateAction<
      {
        id: string;
        title: string;
        done: boolean;
        lastReset: Date;
        order: number;
      }[]
    >
  >;
}) {
  const [loading, setLoading] = useState(false);

  const pushTasks = async () => {
    setLoading(true);
    const response = await fetch(
      (import.meta.env.VITE_API_BASE ?? "") + "/api/tasks",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ tasks }),
        credentials: "include",
      }
    );

    if (!response.ok) {
      toast.error("Произошла ошибка при отправке задач", {
        description: "Попробуйте позже",
      });
    } else {
      const data = await response.json();
      if (!data.ok) {
        toast.error("Произошла ошибка при отправке задач", {
          description: "Попробуйте позже",
        });
      } else {
        toast.success("Задачи успешно отправлены");
      }
    }
    setLoading(false);
  };

  const getTasks = async () => {
    setLoading(true);
    const response = await fetch(
      (import.meta.env.VITE_API_BASE ?? "") + "/api/tasks",
      {
        method: "GET",
        credentials: "include",
      }
    );

    if (!response.ok) {
      toast.error("Произошла ошибка при получении задач", {
        description: "Попробуйте позже",
      });
    } else {
      const data = await response.json();
      if (!data.ok) {
        toast.error("Произошла ошибка при получении задач", {
          description: "Попробуйте позже",
        });
      } else {
        setTasks(data.tasks);
        toast.success("Задачи успешно получены");
      }
    }
    setLoading(false);
  };

  return (
    <div className="inline-flex -space-x-px rounded-md shadow-xs rtl:space-x-reverse">
      <Button
        className="rounded-none shadow-none first:rounded-s-md last:rounded-e-md focus-visible:z-10"
        variant="outline"
        disabled={loading}
        onClick={() => pushTasks()}
      >
        <CloudUploadIcon
          className="-mb-1 opacity-60"
          size={16}
          aria-hidden="true"
        />
        Отправить
      </Button>
      <Button
        className="rounded-none shadow-none first:rounded-s-md last:rounded-e-md focus-visible:z-10"
        variant="outline"
        disabled={loading}
        onClick={() => getTasks()}
      >
        <CloudDownloadIcon
          className="-mb-1 opacity-60"
          size={16}
          aria-hidden="true"
        />
        Получить
      </Button>
    </div>
  );
}
