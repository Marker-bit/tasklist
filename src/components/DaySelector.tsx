import { Checkbox } from "@/components/ui/checkbox";
import { useId } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

export default function DaySelector() {
  const id = useId();

  const items = [
    { value: "1", label: "Понедельник", short: "Пн" },
    { value: "2", label: "Вторник", short: "Вт" },
    { value: "3", label: "Среда", short: "Ср" },
    { value: "4", label: "Четверг", short: "Чт" },
    { value: "5", label: "Пятница", short: "Пт" },
    { value: "6", label: "Суббота", short: "Сб" },
    { value: "7", label: "Воскресенье", short: "Вс" },
  ];

  return (
    <TooltipProvider delayDuration={0}>
      <fieldset className="space-y-4">
        <legend className="text-foreground text-sm leading-none font-medium">
          Дни недели
        </legend>
        <div className="flex gap-1.5">
          {items.map((item) => (
            <Tooltip key={`${id}-${item.value}`}>
              <TooltipTrigger asChild>
                <label className="border-input has-data-[state=checked]:border-primary has-data-[state=checked]:bg-primary has-data-[state=checked]:text-primary-foreground outline-ring/30 dark:outline-ring/40 relative flex size-9 cursor-pointer flex-col items-center justify-center gap-3 rounded-full border text-center shadow-xs outline-offset-2 transition-colors has-focus-visible:outline-2 has-data-disabled:cursor-not-allowed has-data-disabled:opacity-50">
                  <Checkbox
                    id={`${id}-${item.value}`}
                    value={item.value}
                    className="sr-only after:absolute after:inset-0"
                  />
                  <span aria-hidden="true" className="text-sm font-medium">
                    {item.short}
                  </span>
                  <span className="sr-only">{item.label}</span>
                </label>
              </TooltipTrigger>
              <TooltipContent className="px-2 py-1 text-xs">
                {item.label}
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </fieldset>
    </TooltipProvider>
  );
}
