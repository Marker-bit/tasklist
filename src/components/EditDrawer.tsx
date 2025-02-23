import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "./ui/button";
import DaySelector from "./DaySelector";
import TitleEdit from "./TitleEdit";

export default function EditDrawer({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
}) {
  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Настройки этой задачи</DrawerTitle>
          <DrawerDescription>
            Вы можете выбрать дни недели и название.
          </DrawerDescription>
        </DrawerHeader>
        <div className="p-4 py-0">
          <TitleEdit />
        </div>
        <div className="p-4 pb-0">
          <DaySelector />
        </div>
        <DrawerFooter>
          <Button>Сохранить</Button>
          <DrawerClose>
            <Button variant="outline">Отмена</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
