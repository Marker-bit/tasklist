import {
  Loader2,
  SendIcon
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import CodeInputDrawer from "./CodeInputDrawer";
import LogoutButton from "./LogoutButton";
import SyncButton from "./SyncButton";
import { Input } from "./ui/input";
import { IDBPDatabase } from "idb";

export default function SyncSettings({tasks, setTasks, db}: {tasks: {id: string, title: string, done: boolean, lastReset: Date, order: number}[], setTasks: React.Dispatch<React.SetStateAction<{id: string, title: string, done: boolean, lastReset: Date, order: number}[]>>, db: IDBPDatabase}) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [codeOpen, setCodeOpen] = useState(false);
  const [state, setState] = useState<string | false | null>(null);

  useEffect(() => {
    (async () => {
      const res = await fetch(
        (import.meta.env.VITE_API_BASE ?? "") + "/api/whoami",
        {
          credentials: "include",
        }
      );
      const data = await res.json();
      if (data.ok === false) {
        setState(false);
      } else {
        setState(data.user.email);
      }
    })();
  }, []);

  return (
    <fieldset className="space-y-4">
      <legend className="text-foreground text-sm leading-none font-medium">
        Синхронизация
      </legend>
      {state === false ? (
        <form
          className="*:not-first:mt-2 max-w-sm"
          onSubmit={async (e) => {
            e.preventDefault();
            if (loading) return;
            const regex =
              /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/g;
            if (!regex.test(email)) {
              alert("Некорректная почта");
              return;
            }
            setLoading(true);
            const res = await fetch(
              (import.meta.env.VITE_API_BASE ?? "") + "/api/signin",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ email }),
              }
            ).catch((err) => {
              console.error(err);
            });
            if (!res?.ok || res.status !== 200) {
              toast.error("Произошла ошибка при авторизации", {
                description: "Попробуйте позже",
              });
            } else {
              const data = await res.json();
              if (data.ok) {
                setCodeOpen(true);
              }
            }

            setLoading(false);
          }}
        >
          <div className="relative">
            <Input
              id="email"
              className="pe-9"
              placeholder="Введите почту..."
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button
              className="text-muted-foreground/80 hover:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-md transition-[color,box-shadow] outline-none focus:z-10 focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Subscribe"
              type="submit"
            >
              {loading ? (
                <Loader2
                  className="animate-spin"
                  size={16}
                  aria-hidden="true"
                />
              ) : (
                <SendIcon size={16} aria-hidden="true" />
              )}
            </button>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Мы отправим на почту код, чтобы вы могли войти в аккаунт для
            синхронизации.
          </p>
        </form>
      ) : state === null ? (
        <div>
          <p className="mt-2 text-sm text-muted-foreground">
            Отправка запроса на сервер...
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2 items-start">
          <p className="text-sm text-muted-foreground">
            Вы вошли в аккаунт под {state}
          </p>
          <SyncButton db={db} tasks={tasks} setTasks={setTasks} />
          {/* <Button variant="outline">
            Синхронизировать
            <RotateCw
              className="-me-1 opacity-60"
              size={16}
              aria-hidden="true"
            />
          </Button> */}
          <LogoutButton />
        </div>
      )}

      <CodeInputDrawer email={email} open={codeOpen} setOpen={setCodeOpen} />
    </fieldset>
  );
}
