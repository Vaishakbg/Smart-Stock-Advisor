"use client";

import type { ChangeEvent, FormEvent, KeyboardEvent } from "react";
import { useMemo, useState } from "react";

export type SearchSuggestion = {
  id: string;
  label: string;
  subtitle?: string;
};

export type SearchBarProps = {
  onSearch: (query: string) => void;
  suggestions?: SearchSuggestion[];
  placeholder?: string;
  label?: string;
};

export function SearchBar({
  onSearch,
  suggestions = [],
  placeholder = "Search tickers or companies",
  label = "Search"
}: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const filteredSuggestions = useMemo(() => {
    if (!query) {
      return suggestions.slice(0, 6);
    }

    const normalized = query.trim().toLowerCase();
    return suggestions
      .filter((item) => item.label.toLowerCase().includes(normalized))
      .slice(0, 6);
  }, [query, suggestions]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = query.trim();
    if (!trimmed.length) return;
    onSearch(trimmed);
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value);
  };

  const handleSuggestionSelect = (selected: SearchSuggestion) => {
    setQuery(selected.label);
    onSearch(selected.label);
    setIsFocused(false);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      setIsFocused(false);
      (event.target as HTMLInputElement).blur();
    }
  };

  return (
    <div className="relative w-full max-w-2xl">
      <form onSubmit={handleSubmit} className="flex items-center">
        <label htmlFor="stock-search" className="sr-only">
          {label}
        </label>
        <div className="relative flex w-full items-center">
          <input
            id="stock-search"
            type="search"
            value={query}
            onChange={handleInputChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => {
              // Delay blur to allow click on suggestion
              setTimeout(() => setIsFocused(false), 120);
            }}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="w-full rounded-full border border-slate-800 bg-slate-900/80 py-3 pl-5 pr-24 text-sm text-slate-100 shadow focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
            autoComplete="off"
          />
          <button
            type="submit"
            className="absolute right-2 inline-flex items-center rounded-full bg-brand-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-300"
          >
            Search
          </button>
        </div>
      </form>
      {isFocused && filteredSuggestions.length > 0 && (
        <ul className="absolute z-10 mt-2 w-full overflow-hidden rounded-xl border border-slate-800 bg-slate-950/95 shadow-xl">
          {filteredSuggestions.map((suggestion) => (
            <li key={suggestion.id}>
              <button
                type="button"
                onClick={() => handleSuggestionSelect(suggestion)}
                className="flex w-full flex-col items-start gap-0.5 px-4 py-3 text-left text-sm text-slate-200 transition hover:bg-slate-800/80"
              >
                <span className="font-medium text-white">{suggestion.label}</span>
                {suggestion.subtitle ? (
                  <span className="text-xs text-slate-400">{suggestion.subtitle}</span>
                ) : null}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
