import { LoaderCircleIcon, LogOut } from "lucide-react";
import { Button } from "./ui/button";
import { useState } from "react";

export default function LogoutButton() {
  const [loading, setLoading] = useState(false);
  return (
    <div>
      <Button
        variant="outline"
        disabled={loading}
        data-loading={loading || undefined}
        className="group relative disabled:opacity-100"
        onClick={async () => {
          setLoading(true);
          await fetch((import.meta.env.VITE_API_BASE ?? "") + "/api/logout", {
            credentials: "include",
          });
          setLoading(false);
          window.location.reload();
        }}
      >
        <div className="group-data-loading:text-transparent flex gap-2 items-center">
          Выйти
          <LogOut className="-me-1 opacity-60" size={16} aria-hidden="true" />
        </div>
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
    </div>
  );
}
