// src/components/TagInput.tsx
import React, { useState, useEffect, useRef } from 'react';
import { getOpenRouterKey } from '../utils/aiPreferences';

type TagInputProps = {
  label: string;
  placeholder?: string;
  values: string[];
  setValues: (v: string[]) => void;
};

export const TagInput: React.FC<TagInputProps> = ({ label, placeholder, values, setValues }) => {
  const [input, setInput] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const timerRef = useRef<number | null>(null);

  const fetchSuggestions = async (query: string) => {
    const apiKey = getOpenRouterKey();
    if (!apiKey) return [];
    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: `Give up to 5 short suggestions for ${label.toLowerCase()} that start with "${query}".` }],
          temperature: 0.3,
        }),
      });
      const data = await response.json();
      const text = data?.choices?.[0]?.message?.content || '';
      return text
        .split(/[\,\n]/)
        .map((s) => s.trim())
        .filter((s) => s.length > 0);
    } catch (_) {
      return [];
    }
  };

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (!input) {
      setSuggestions([]);
      return;
    }
    timerRef.current = window.setTimeout(async () => {
      const sug = await fetchSuggestions(input);
      setSuggestions(sug);
      setShowSuggestions(true);
    }, 300);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [input]);

  const addTag = (tag: string) => {
    if (!values.includes(tag)) setValues([...values, tag]);
    setInput('');
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const removeTag = (tag: string) => {
    setValues(values.filter((v) => v !== tag));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && input.trim()) {
      e.preventDefault();
      addTag(input.trim());
    }
  };

  return (
    <div style={{ marginBottom: 24 }}>
      <p style={{ fontWeight: 600, marginBottom: 8 }}>{label}</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
        {values.map((tag) => (
          <span
            key={tag}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              background: 'rgba(99,102,241,0.1)',
              color: '#6366f1',
              padding: '4px 8px',
              borderRadius: 12,
              fontSize: 13,
            }}
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 600,
                color: '#6366f1',
              }}
            >
              ×
            </button>
          </span>
        ))}
      </div>
      <input
        type="text"
        placeholder={placeholder}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => input && setShowSuggestions(true)}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
        style={{
          width: '100%',
          padding: '8px 12px',
          borderRadius: 8,
          border: '1px solid var(--hairline)',
          background: 'var(--surface)',
          color: 'var(--ink)',
        }}
      />
      {showSuggestions && suggestions.length > 0 && (
        <div style={{ position: 'relative', marginTop: 4 }}>
          <ul
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              background: 'var(--paper)',
              border: '1px solid var(--hairline)',
              borderRadius: 8,
              maxHeight: 150,
              overflowY: 'auto',
              zIndex: 10,
              listStyle: 'none',
              margin: 0,
              padding: '4px 0',
            }}
          >
            {suggestions.map((s) => (
              <li
                key={s}
                onMouseDown={() => addTag(s)}
                style={{
                  padding: '6px 12px',
                  cursor: 'pointer',
                }}
              >
                {s}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
