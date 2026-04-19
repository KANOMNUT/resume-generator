"use client";

import { useState, useRef } from "react";
import Icon from "@/components/ui/Icon";

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
}

export default function TagInput({ tags, onChange, placeholder }: TagInputProps) {
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const add = (raw: string) => {
    const v = raw.trim();
    if (!v) return;
    if (tags.includes(v)) {
      setInput("");
      return;
    }
    onChange([...tags, v]);
    setInput("");
  };

  const remove = (i: number) => {
    onChange(tags.filter((_, ix) => ix !== i));
  };

  return (
    <div
      onClick={() => inputRef.current?.focus()}
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "6px",
        padding: "8px 9px",
        minHeight: "44px",
        border: "1px solid var(--line)",
        borderRadius: "var(--radius-sm)",
        background: "var(--panel)",
        cursor: "text",
      }}
      className="tag-input-wrap"
    >
      {tags.map((t, i) => (
        <span
          key={i}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "5px",
            padding: "4px 4px 4px 10px",
            fontSize: "12.5px",
            background: "var(--chip)",
            borderRadius: "999px",
            color: "var(--ink-2)",
          }}
        >
          {t}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              remove(i);
            }}
            style={{
              width: "16px",
              height: "16px",
              borderRadius: "50%",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              color: "var(--ink-4)",
              display: "grid",
              placeItems: "center",
              padding: 0,
            }}
          >
            <Icon name="x" size={10} />
          </button>
        </span>
      ))}
      <input
        ref={inputRef}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            add(input);
          } else if (e.key === "Backspace" && !input && tags.length) {
            remove(tags.length - 1);
          }
        }}
        onBlur={() => add(input)}
        placeholder={tags.length ? "" : placeholder}
        style={{
          flex: 1,
          minWidth: "120px",
          border: "none",
          outline: "none",
          background: "transparent",
          fontSize: "13.5px",
          padding: "4px",
        }}
      />
    </div>
  );
}
