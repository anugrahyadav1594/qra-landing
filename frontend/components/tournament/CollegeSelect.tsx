"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { Monogram } from "@/components/tournament/CollegeWall";
import type { College } from "@/lib/tournament";

/**
 * Searchable college picker — keyboard-first (the list is the only accepted
 * source of truth for college names, so typing must never create a value).
 */
export function CollegeSelect({
  colleges,
  value,
  onChange,
  invalid,
  describedBy,
}: {
  colleges: College[];
  value: string | null;
  onChange: (collegeId: string | null) => void;
  invalid?: boolean;
  describedBy?: string;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selected = useMemo(
    () => colleges.find((college) => college.id === value) ?? null,
    [colleges, value],
  );

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return colleges;
    return colleges.filter(
      (college) =>
        college.name.toLowerCase().includes(needle) ||
        (college.location ?? "").toLowerCase().includes(needle),
    );
  }, [colleges, query]);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: MouseEvent) {
      if (!wrapperRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  useEffect(() => setHighlight(0), [query, open]);

  function commit(college: College) {
    onChange(college.id);
    setQuery("");
    setOpen(false);
    inputRef.current?.blur();
  }

  return (
    <div ref={wrapperRef} className="relative">
      <label
        htmlFor="college-search"
        className="mb-1.5 flex items-center gap-1.5 text-[13px] font-medium text-bone/85"
      >
        College
        <span aria-hidden="true" className="text-flare-500">
          *
        </span>
      </label>

      {selected && !open ? (
        <button
          type="button"
          onClick={() => {
            setOpen(true);
            window.setTimeout(() => inputRef.current?.focus(), 0);
          }}
          className="input-arena arena-focus flex w-full items-center gap-3 rounded-lg text-left"
        >
          {selected.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={selected.logo_url} alt="" className="h-8 w-8 object-contain" />
          ) : (
            <Monogram name={selected.name} className="h-8 w-8 text-[10px]" />
          )}
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm text-bone">{selected.name}</span>
            {selected.location && (
              <span className="block truncate font-mono text-[10px] uppercase tracking-[0.16em] text-ash">
                {selected.location}
              </span>
            )}
          </span>
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-flare-300">
            Change
          </span>
        </button>
      ) : (
        <input
          ref={inputRef}
          id="college-search"
          role="combobox"
          aria-expanded={open}
          aria-controls="college-listbox"
          aria-autocomplete="list"
          aria-activedescendant={open && filtered[highlight] ? `college-option-${filtered[highlight].id}` : undefined}
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
          autoComplete="off"
          value={query}
          placeholder="Search your college…"
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(event) => {
            if (event.key === "ArrowDown") {
              event.preventDefault();
              setOpen(true);
              setHighlight((index) => Math.min(index + 1, filtered.length - 1));
            } else if (event.key === "ArrowUp") {
              event.preventDefault();
              setHighlight((index) => Math.max(index - 1, 0));
            } else if (event.key === "Enter") {
              if (open && filtered[highlight]) {
                event.preventDefault();
                commit(filtered[highlight]);
              }
            } else if (event.key === "Escape") {
              setOpen(false);
            }
          }}
          className="input-arena arena-focus rounded-lg"
        />
      )}

      {open && (
        <div className="absolute z-40 mt-2 max-h-72 w-full overflow-auto rounded-lg border border-white/12 bg-arena-900/98 shadow-arena backdrop-blur-xl">
          {filtered.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-ash">
              No onboarded college matches “{query}”. Only colleges onboarded by the organisers can
              be selected.
            </p>
          ) : (
            <ul id="college-listbox" role="listbox" aria-label="Onboarded colleges" className="py-1">
              {filtered.map((college, index) => (
                <li key={college.id} id={`college-option-${college.id}`} role="option" aria-selected={college.id === value}>
                  <button
                    type="button"
                    onMouseEnter={() => setHighlight(index)}
                    onClick={() => commit(college)}
                    className={`flex w-full items-center gap-3 px-3 py-2.5 text-left transition ${
                      index === highlight ? "bg-flare-500/12" : ""
                    }`}
                  >
                    {college.logo_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={college.logo_url} alt="" className="h-7 w-7 object-contain" />
                    ) : (
                      <Monogram name={college.name} className="h-7 w-7 text-[9px]" />
                    )}
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm text-bone">{college.name}</span>
                      {college.location && (
                        <span className="block truncate font-mono text-[10px] uppercase tracking-[0.16em] text-ash">
                          {college.location}
                        </span>
                      )}
                    </span>
                    {college.id === value && (
                      <span aria-hidden="true" className="text-flare-300">
                        ✓
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
