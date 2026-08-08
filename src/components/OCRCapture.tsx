// Phase 4: OCR Vital Extraction — uses OpenRouter (key from Settings), no Gemini API key needed
import { useState } from "react";
import { getOpenRouterKey } from "../utils/aiPreferences";

interface Props { onExtracted: (text: string) => void; }

// Vision-capable model routed via OpenRouter
const OCR_MODEL = "google/gemini-2.0-flash-001";

export default function OCRCapture({ onExtracted }: Props) {
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading]   = useState(false);
  const [result, setResult]     = useState("");
  const [error, setError]       = useState("");

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      const base64  = dataUrl.split(",")[1];
      setPreview(dataUrl);
      setLoading(true);
      setError("");
      setResult("");

      try {
        const apiKey = getOpenRouterKey();
        if (!apiKey) {
          throw new Error("No OpenRouter API key found. Please add it in Settings.");
        }

        const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`,
            "HTTP-Referer": window.location.origin,
            "X-Title": "Anebilin OCR",
          },
          body: JSON.stringify({
            model: OCR_MODEL,
            messages: [
              {
                role: "user",
                content: [
                  {
                    type: "text",
                    text: "Extract all numeric vital sign values from this medical monitor image. List them as:\nHeart Rate: X bpm\nSpO2: X%\nBlood Pressure: X/X mmHg\nHemoglobin: X g/dL\nBilirubin: X mg/dL\n\nOnly include values clearly visible in the image. If a value is not present, omit it.",
                  },
                  {
                    type: "image_url",
                    image_url: {
                      url: `data:${file.type};base64,${base64}`,
                    },
                  },
                ],
              },
            ],
            max_tokens: 300,
          }),
        });

        if (!res.ok) {
          const errJson = await res.json().catch(() => ({}));
          throw new Error((errJson as any)?.error?.message ?? `API error ${res.status}`);
        }

        const json = await res.json();
        const text: string =
          json.choices?.[0]?.message?.content ?? "No values found.";
        setResult(text);
        onExtracted(text);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div style={{ border: "1.5px solid #e2e8f0", borderRadius: 12, padding: "16px 20px", background: "#f8fafc" }}>
      <p style={{ fontWeight: 600, marginBottom: 10 }}>📷 OCR Vital Extraction</p>
      <p style={{ fontSize: 12, color: "#64748b", marginBottom: 10 }}>
        Uses your OpenRouter key (set in Settings) — no separate API key needed.
      </p>
      <input
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFile}
        style={{ fontSize: 13, marginBottom: 12 }}
      />
      {preview && (
        <img src={preview} alt="preview" style={{ maxHeight: 120, borderRadius: 8, marginBottom: 10, display: "block" }} />
      )}
      {loading && (
        <p style={{ fontSize: 13, color: "#6366f1" }}>⏳ Analysing with Vision AI via OpenRouter…</p>
      )}
      {result && (
        <pre style={{ fontSize: 12, background: "#f0fdf4", border: "1px solid #86efac", borderRadius: 8, padding: "10px 12px", whiteSpace: "pre-wrap" }}>
          {result}
        </pre>
      )}
      {error && (
        <p style={{ color: "#dc2626", fontSize: 12 }}>⚠️ {error}</p>
      )}
    </div>
  );
}
