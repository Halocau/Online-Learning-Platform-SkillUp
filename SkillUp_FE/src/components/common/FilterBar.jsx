import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";

export default function FilterBar({ filters = [], onSearch, onFilterChange }) {
  const [search, setSearch] = useState("");

  return (
    <div className="flex flex-wrap items-center gap-3 bg-white p-4 rounded-xl shadow-sm">
      <Input
        placeholder="Search..."
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          onSearch?.(e.target.value);
        }}
        className="w-[250px]"
      />
      
      {filters.map((f) => (
        <Select key={f.key} onValueChange={(v) => onFilterChange(f.key, v)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={f.placeholder} />
          </SelectTrigger>
          <SelectContent>
            {f.options.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
      ))}
      
    </div>
  );
}
