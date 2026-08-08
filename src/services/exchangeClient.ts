/**
 * exchangeClient.ts
 * Generates a structured clinical report by calling OpenRouter directly.
 * No separate exchange/backend server is required.
 */

import { getOpenRouterKey, getOpenRouterModel } from '../utils/aiPreferences';

// ─── Payload types ────────────────────────────────────────────────────────────

export interface ExchangePatientPayload {
  id: string;
  name: string;
  age: number;
  sex: string;
}

export interface ExchangeBiomarkersPayload {
  spo2: number | null;
  heartRate: number | null;
  perfusionIndex: number | null;
  signalQuality: number | null;
  sdnn: number | null;
  rmssd: number | null;
  hemoglobin: number | null;
  bilirubin: number | null;
  systolicBP: number | null;
  diastolicBP: number | null;
  pulseRate: number | null;
  respirationRate: number | null;
}

export interface ExchangeRequestPayload {
  deviceName: string;
  patient: ExchangePatientPayload;
  timestamp: string;
  biomarkers: ExchangeBiomarkersPayload;
}

// ─── Report types ─────────────────────────────────────────────────────────────

export interface LiveReportFinding {
  parameter: string;
  value: string;
  status: 'normal' | 'borderline' | 'abnormal';
  interpretation: string;
}

export interface LiveReportResult {
  healthScore: number;
  summary: string;
  findings: LiveReportFinding[];
  recommendations: string[];
  warnings: string[];
  disclaimer: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseStatus(value: unknown): 'normal' | 'borderline' | 'abnormal' {
  const lower = String(value ?? '').toLowerCase();
  if (lower === 'normal' || lower === 'borderline' || lower === 'abnormal') return lower;
  return 'normal';
}

function normalizeFindings(value: unknown): LiveReportFinding[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => {
    const r = typeof item === 'object' && item !== null ? (item as Record<string, unknown>) : {};
    return {
      parameter: String(r.parameter ?? 'PARAMETER'),
      value: String(r.value ?? '--'),
      status: parseStatus(r.status),
      interpretation: String(r.interpretation ?? ''),
    };
  });
}

export function normalizeMedicalReport(rawReport: unknown, fallbackSummary = ''): LiveReportResult {
  const report =
    typeof rawReport === 'object' && rawReport !== null
      ? (rawReport as Record<string, unknown>)
      : {};
  return {
    healthScore: Number(report.healthScore ?? 5),
    summary: String(report.summary ?? fallbackSummary),
    findings: normalizeFindings(report.findings),
    recommendations: Array.isArray(report.recommendations)
      ? report.recommendations.map((i) => String(i))
      : [],
    warnings: Array.isArray(report.warnings)
      ? report.warnings.map((i) => String(i))
      : [],
    disclaimer: String(
      report.disclaimer ??
        'This report is for screening purposes only and does not replace professional medical evaluation.'
    ),
  };
}

// ─── Main function ────────────────────────────────────────────────────────────

/**
 * Generate a clinical report by calling OpenRouter directly.
 * Uses the OpenRouter key and model stored in the user's settings.
 */
export async function requestLiveRecordingReport(payload: ExchangeRequestPayload): Promise<{
  requestId: string;
  report: LiveReportResult;
}> {
  const apiKey = getOpenRouterKey();
  if (!apiKey) {
    throw new Error(
      'OpenRouter API key not set. Please add your key in Settings → AI Settings.'
    );
  }

  const model = getOpenRouterModel('liveRecording');
  const b = payload.biomarkers;

  // Build a human-readable biomarker summary for the prompt
  const lines: string[] = [];
  if (b.heartRate != null)      lines.push(`Heart Rate: ${b.heartRate.toFixed(1)} bpm`);
  if (b.spo2 != null)           lines.push(`SpO₂: ${b.spo2.toFixed(1)}%`);
  if (b.hemoglobin != null)     lines.push(`Hemoglobin: ${b.hemoglobin.toFixed(2)} g/dL`);
  if (b.bilirubin != null)      lines.push(`Bilirubin: ${b.bilirubin.toFixed(2)} mg/dL`);
  if (b.sdnn != null)           lines.push(`HRV SDNN: ${b.sdnn.toFixed(1)} ms`);
  if (b.rmssd != null)          lines.push(`HRV RMSSD: ${b.rmssd.toFixed(1)} ms`);
  if (b.systolicBP != null)     lines.push(`Blood Pressure: ${b.systolicBP.toFixed(0)}/${b.diastolicBP?.toFixed(0) ?? '?'} mmHg`);
  if (b.respirationRate != null) lines.push(`Respiration Rate: ${b.respirationRate.toFixed(1)} br/min`);
  if (b.perfusionIndex != null) lines.push(`Perfusion Index: ${b.perfusionIndex.toFixed(2)}%`);
  if (b.signalQuality != null)  lines.push(`Signal Quality: ${b.signalQuality}%`);

  const biomarkerText = lines.length > 0 ? lines.join('\n') : 'No biomarker data provided.';

  const systemPrompt = `You are a clinical AI assistant for the Anebilin non-invasive screening device.
Generate a structured medical screening report from the provided biomarker readings.

Return ONLY valid JSON (no markdown, no extra text) in this exact structure:
{
  "healthScore": <number 0-10>,
  "summary": "<2-3 sentence clinical overview>",
  "findings": [
    {
      "parameter": "<parameter name>",
      "value": "<value with unit>",
      "status": "<normal|borderline|abnormal>",
      "interpretation": "<brief clinical interpretation>"
    }
  ],
  "recommendations": ["<actionable recommendation>", ...],
  "warnings": ["<clinical warning if any>", ...],
  "disclaimer": "This report is for screening purposes only and does not replace professional medical evaluation."
}

Clinical reference ranges:
- Heart Rate: 60-100 bpm (normal), 50-60 or 100-110 (borderline), <50 or >110 (abnormal)
- SpO₂: ≥95% (normal), 90-94% (borderline), <90% (abnormal)
- Hemoglobin: Male 13.5-17.5 g/dL, Female 12.0-15.5 g/dL (adjust by sex)
- Bilirubin: <1.2 mg/dL (normal), 1.2-3.0 (borderline), >3.0 (abnormal)
- HRV SDNN: >50ms (normal), 30-50ms (borderline), <30ms (abnormal)
- Blood Pressure: <120/80 (normal), 120-139/80-89 (borderline/elevated), ≥140/90 (abnormal)
- Respiration Rate: 12-20 br/min (normal), 10-12 or 20-24 (borderline), <10 or >24 (abnormal)

Only include findings for parameters that have data. Be clinically precise but accessible.`;

  const userPrompt = `Patient: ${payload.patient.age} year old ${payload.patient.sex}
Device: ${payload.deviceName}
Timestamp: ${payload.timestamp}

Biomarker Readings:
${biomarkerText}

Generate a comprehensive screening report.`;

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
      'HTTP-Referer': window.location.origin,
      'X-Title': 'Anebilin Spectru',
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.3,
      max_tokens: 1500,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenRouter error ${response.status}: ${errorText || response.statusText}`);
  }

  const data = await response.json();
  const rawContent: unknown = data.choices?.[0]?.message?.content;
  const content =
    Array.isArray(rawContent)
      ? rawContent.map((p) => (typeof p?.text === 'string' ? p.text : '')).join('\n')
      : typeof rawContent === 'string'
      ? rawContent
      : '';

  if (!content) throw new Error('No response from AI model.');

  // Extract JSON from response (model may wrap it in markdown fences)
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('AI response did not contain valid JSON. Please try again.');

  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonMatch[0]);
  } catch {
    throw new Error('Failed to parse AI response as JSON. Please try again.');
  }

  const report = normalizeMedicalReport(parsed);
  const requestId = `local-${Date.now()}`;

  return { requestId, report };
}
