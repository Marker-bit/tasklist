"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useEffect, useRef, useState } from "react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "./ui/input-otp";
import { LoaderCircleIcon, LockIcon } from "lucide-react";
import { toast } from "sonner";

// const CORRECT_CODE = "6548";

export default function CodeInputDrawer({
  open,
  setOpen,
  email,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  email: string;
}) {
  const [value, setValue] = useState("");
  const [hasGuessed, setHasGuessed] = useState<undefined | boolean>(undefined);
  const inputRef = useRef<HTMLInputElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (hasGuessed) {
      closeButtonRef.current?.focus();
    }
  }, [hasGuessed]);

  async function onSubmit(e?: React.FormEvent<HTMLFormElement>) {
    e?.preventDefault?.();

    if (loading) return;

    setLoading(true);

    const res = await fetch(
      (import.meta.env.VITE_API_BASE ?? "") + "/api/verify",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, code: value }),
        credentials: "include",
      }
    ).catch((err) => {
      console.error(err);
    });

    if (!res?.ok) {
      toast.error("Произошла ошибка при авторизации", {
        description: "Попробуйте позже",
      });
      setLoading(false);
      return;
    }

    const data = await res.json();
    if (data.ok === true) {
      setHasGuessed(true);
      setLoading(false);
      setTimeout(() => {
        inputRef.current?.blur();
      }, 20);
      return;
    }

    if (data.error === "invalid email or code") {
      toast.error("Неверный код", {
        description: "Попробуйте ещё раз",
      });
      setValue("");
      setLoading(false);
      setHasGuessed(false);
      // setTimeout(() => {
      //   inputRef.current?.focus();
      // }, 20);
      return;
    }

    if (data.error === "code expired") {
      toast.error("Код истек", {
        description: "Отправьте его заново",
      });
      setValue("");
      setLoading(false);
      return;
    }
  }

  async function resendCode() {
    if (loading) return;

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
      toast.error("Произошла ошибка при переотправке кода", {
        description: "Попробуйте найти предыдущий в папке Спам",
      });
    } else {
      const data = await res.json();
      if (!data.ok) {
        toast.error("Произошла ошибка при переотправке кода", {
          description: "Попробуйте найти предыдущий в папке Спам",
        });
      }
    }

    setLoading(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <div className="flex flex-col items-center gap-2">
          <div
            className="flex size-11 shrink-0 items-center justify-center rounded-full border"
            aria-hidden="true"
          >
            <LockIcon className="size-4 text-muted-foreground" />
          </div>
          <DialogHeader>
            <DialogTitle className="sm:text-center">
              {hasGuessed ? "Код ввёден!" : "Введите код подтверждения"}
            </DialogTitle>
            <DialogDescription className="sm:text-center">
              {hasGuessed
                ? "Обновите страницу, чтобы продолжить"
                : "Проверьте почту и введите код"}
            </DialogDescription>
          </DialogHeader>
        </div>

        {hasGuessed ? (
          <div className="text-center">
            <Button
              type="button"
              ref={closeButtonRef}
              onClick={() => window.location.reload()}
            >
              Обновить
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-center">
              <InputOTP
                maxLength={4}
                id="cofirmation-code"
                ref={inputRef}
                value={value}
                onChange={setValue}
                onFocus={() => setHasGuessed(undefined)}
                onComplete={onSubmit}
                disabled={loading}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                </InputOTPGroup>
              </InputOTP>
            </div>
            {hasGuessed === false && (
              <p
                className="text-muted-foreground text-center text-xs"
                role="alert"
                aria-live="polite"
              >
                Неверный код. Попробуйте снова.
              </p>
            )}
            <p className="text-center text-sm">
              <Button
                variant="link"
                disabled={loading}
                data-loading={loading || undefined}
                className="group relative disabled:opacity-100"
                onClick={() => resendCode()}
              >
                <span className="group-data-loading:text-transparent">
                  Заново отправить код
                </span>
                {loading && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <LoaderCircleIcon
                      className="animate-spin"
                      size={16}
                      aria-hidden="true"
                    />
                  </div>
                )}
              </Button>
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
