import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TextCursorInput } from "lucide-react";
import { useId } from "react";

export default function TitleEdit() {
  const id = useId();
  return (
    <div className="*:not-first:mt-2">
      <Label htmlFor={id}>Название задачи</Label>
      <div className="relative">
        <Input id={id} className="peer ps-9" placeholder="Введите название задачи" />
        <div className="text-muted-foreground/80 pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 peer-disabled:opacity-50">
          <TextCursorInput size={16} aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}
