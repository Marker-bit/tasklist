import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Settings } from "lucide-react";
import ThemeRadio from "./ThemeRadio";
import { Button } from "./ui/button";
import SyncSettings from "./SyncSettings";
import { IDBPDatabase } from "idb";

export default function AdditionalButtons({tasks, setTasks, db}: {tasks: {id: string, title: string, done: boolean, lastReset: Date, order: number}[], setTasks: React.Dispatch<React.SetStateAction<{id: string, title: string, done: boolean, lastReset: Date, order: number}[]>>, db: IDBPDatabase}) {
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="outline" size="icon">
          <Settings className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">Настройки</span>
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Настройки</DrawerTitle>
          <DrawerDescription>
            Вы можете изменить тему и настроить синхронизацию.
          </DrawerDescription>
        </DrawerHeader>
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <ThemeRadio />
          <SyncSettings db={db} tasks={tasks} setTasks={setTasks} />
        </div>
      </DrawerContent>
    </Drawer>
  );
}
