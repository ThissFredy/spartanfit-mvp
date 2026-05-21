"use client";

import { cn } from "@/lib/utils/cn";
import { ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface Props {
  gyms: { id: string; name: string }[];
  initialSelectedIds: string[];
  onChange: (selectedIds: string[]) => void;
}

export function GymMultiSelect({ gyms, initialSelectedIds, onChange }: Props) {
  const [selectedIds, setSelectedIds] = useState<string[]>(initialSelectedIds);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onOutsideClick = (event: MouseEvent) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", onOutsideClick);
    return () => document.removeEventListener("mousedown", onOutsideClick);
  }, []);

  const toggleSelection = (id: string) => {
    const newSelected = selectedIds.includes(id)
      ? selectedIds.filter((selectedId) => selectedId !== id)
      : [...selectedIds, id];

    setSelectedIds(newSelected);
    onChange(newSelected);
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        className="flex w-full items-center justify-between rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-left text-sm text-zinc-100 transition-colors hover:border-zinc-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-spartan/70"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        {selectedIds.length === 0 ? (
          <span className="text-zinc-400">Selecciona uno o más gimnasios...</span>
        ) : (
          <span className="block truncate">
            {selectedIds.length} gimnasio(s) seleccionado(s)
          </span>
        )}
        <ChevronDown
          className={cn("h-4 w-4 text-zinc-400 transition-transform", isOpen && "rotate-180")}
        />
      </button>

      {isOpen && (
        <div
          role="listbox"
          aria-label="Opciones de gimnasio"
          className="absolute z-30 mt-1 max-h-60 w-full overflow-y-auto rounded-xl border border-zinc-700 bg-zinc-900 shadow-2xl"
        >
          {gyms.length === 0 ? (
            <div className="px-4 py-3 text-sm text-zinc-400">No hay gimnasios disponibles</div>
          ) : (
            gyms.map((gym) => {
              const isSelected = selectedIds.includes(gym.id);
              return (
                <button
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  key={gym.id}
                  className="flex w-full items-center gap-3 px-4 py-2 text-left transition hover:bg-zinc-800"
                  onClick={() => toggleSelection(gym.id)}
                >
                  <div
                    className={cn(
                      "flex h-4 w-4 items-center justify-center rounded border",
                      isSelected ? "border-spartan bg-spartan" : "border-zinc-500",
                    )}
                  >
                    {isSelected && <span className="text-xs text-white">?</span>}
                  </div>
                  <span className="text-sm text-zinc-200">{gym.name}</span>
                </button>
              );
            })
          )}
        </div>
      )}

      {selectedIds.map((id) => (
        <input key={id} type="hidden" name="gymIds" value={id} />
      ))}
    </div>
  );
}

