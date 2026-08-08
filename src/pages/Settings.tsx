import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Monitor,
    Database,
    Globe,
    Shield,
    Trash2,
    Download,
    Key,
    Brain,
    Check,
} from 'lucide-react';
import { useHideBPAndRespiration, setHideBPAndRespiration, usePrivacyMode, setPrivacyMode } from '../utils/preferences';
import {
    AI_MODE_OPTIONS,
    getAIModeLabel,
    getOpenRouterKey,
    getOpenRouterModel,
    setOpenRouterKey,
    setOpenRouterModel,
    type AIFeatureMode,
} from '../utils/aiPreferences';
import { Card, Button, SectionHeader } from '../components/ui';

const AI_FEATURE_MODES: AIFeatureMode[] = ['liveRecording', 'regionalAnalytics', 'assistantChat'];

const Settings: React.FC = () => {
    const [smoothing, setSmoothing] = useState(true);
    const [units, setUnits] = useState('metric');
    const [apiKey, setApiKey] = useState(() => getOpenRouterKey());
    const [models, setModels] = useState<Record<AIFeatureMode, string>>(() => ({
        regionalAnalytics: getOpenRouterModel('regionalAnalytics'),
        assistantChat: getOpenRouterModel('assistantChat'),
        liveRecording: getOpenRouterModel('liveRecording'),
    }));
    const [keySaved, setKeySaved] = useState(false);
    const hideBPAndRespiration = useHideBPAndRespiration();
    const privacyMode = usePrivacyMode();

    // Migrate: clear deprecated/no-longer-free model IDs
    React.useEffect(() => {
        const deprecated = [
            'x-ai/grok-4.1-fast',
            'anthropic/claude-sonnet-4',
            'google/gemini-2.5-flash:free',
            'google/gemini-2.0-flash-001',
            'google/gemini-2.5-pro-preview',
        ];
        (['liveRecording', 'regionalAnalytics', 'assistantChat'] as AIFeatureMode[]).forEach((mode) => {
            const stored = getOpenRouterModel(mode);
            if (deprecated.includes(stored)) {
                setOpenRouterModel(mode, 'google/gemma-4-31b-it:free');
                setModels(prev => ({ ...prev, [mode]: 'google/gemma-4-31b-it:free' }));
            }
        });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
            style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-8)' }}
        >
            <header style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <span
                    style={{
                        fontSize: 'var(--text-xs)',
                        color: 'var(--ink-3)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.16em',
                        fontWeight: 500,
                    }}
                >
                    Settings
                </span>
                <h1
                    style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: 'clamp(36px, 4vw, 56px)',
                        lineHeight: 1.04,
                        letterSpacing: '-0.022em',
                        fontWeight: 400,
                    }}
                >
                    Preferences &amp; <em style={{ fontStyle: 'italic', color: 'var(--accent)' }}>integrations</em>.
                </h1>
                <p style={{ color: 'var(--ink-3)', fontSize: 'var(--text-md)', maxWidth: '60ch' }}>
                    Manage application behavior, AI services, and data hygiene.
                </p>
            </header>

            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'minmax(0, 1fr)',
                    gap: 'var(--sp-6)',
                    maxWidth: 980,
                }}
            >
                {/* ---------- Application ---------- */}
                <Section icon={Monitor} title="Application">
                    <Row
                        label="Privacy mode"
                        description="Blur all patient names and readings across the app — a quick shoulder-surfing screen. Also toggleable instantly from the top bar."
                    >
                        <Toggle
                            checked={privacyMode}
                            onChange={(next) => {
                                setPrivacyMode(next);
                            }}
                        />
                    </Row>
                    <Row
                        label="Graph smoothing"
                        description="Apply a lightweight low-pass filter when rendering live waveforms."
                    >
                        <Toggle checked={smoothing} onChange={setSmoothing} />
                    </Row>
                    <Row
                        label="Hide blood pressure & respiration"
                        description="When enabled, blood pressure and respiration rate metrics are hidden across live recordings, statistics, and reports."
                    >
                        <Toggle
                            checked={hideBPAndRespiration}
                            onChange={(next) => {
                                setHideBPAndRespiration(next);
                            }}
                        />
                    </Row>
                    <Row label="Units" description="Standard weights and measurements.">
                        <select
                            value={units}
                            onChange={(e) => setUnits(e.target.value)}
                            style={{ minWidth: 200 }}
                        >
                            <option value="metric">Metric (kg, cm)</option>
                            <option value="imperial">Imperial (lb, in)</option>
                        </select>
                    </Row>
                </Section>

                {/* ---------- Connection ---------- */}
                <Section icon={Globe} title="Connection &amp; storage">
                    <Row label="Default protocol" description="Preferred method for device pairing.">
                        <span className="num" style={{ color: 'var(--ink-2)', fontSize: 'var(--text-base)' }}>
                            Bluetooth Low Energy
                        </span>
                    </Row>
                    <Row label="Data sync" description="Encrypted cloud storage for patient records.">
                        <span
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 6,
                                fontSize: 'var(--text-sm)',
                                color: 'var(--success)',
                                fontWeight: 500,
                            }}
                        >
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--success)' }} />
                            Active
                        </span>
                    </Row>
                </Section>

                {/* ---------- AI Configuration ---------- */}
                <Section icon={Brain} title="AI configuration">
                    <Row
                        label="OpenRouter API key"
                        description="Required for AI reports and clinical chat. Get one at openrouter.ai/keys."
                    >
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center', minWidth: 360 }}>
                            <input
                                type="password"
                                value={apiKey}
                                onChange={(e) => { setApiKey(e.target.value); setKeySaved(false); }}
                                placeholder="sk-or-..."
                                style={{
                                    flex: 1,
                                    fontFamily: 'var(--font-mono)',
                                    fontSize: 'var(--text-sm)',
                                    letterSpacing: '-0.005em',
                                }}
                            />
                            <Button
                                variant={keySaved ? 'secondary' : 'primary'}
                                size="md"
                                onClick={() => {
                                    setOpenRouterKey(apiKey);
                                    setKeySaved(true);
                                    setTimeout(() => setKeySaved(false), 1800);
                                }}
                                leadingIcon={keySaved ? <Check size={14} /> : <Key size={14} />}
                            >
                                {keySaved ? 'Saved' : 'Save'}
                            </Button>
                        </div>
                    </Row>

                    {AI_FEATURE_MODES.map((mode) => (
                        <Row
                            key={mode}
                            label={`${getAIModeLabel(mode)} model`}
                            description="Select which OpenRouter model this screen should call."
                        >
                            <select
                                value={models[mode]}
                                onChange={(e) => {
                                    const next = e.target.value;
                                    setModels((prev) => ({ ...prev, [mode]: next }));
                                    setOpenRouterModel(mode, next);
                                }}
                                style={{ minWidth: 280 }}
                            >
                                {AI_MODE_OPTIONS.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </Row>
                    ))}
                </Section>

                {/* ---------- Data ---------- */}
                <Section icon={Database} title="Data management">
                    <Row
                        label="Local cache"
                        description="Clear temporary sensor data from this browser."
                    >
                        <Button variant="danger" size="md" leadingIcon={<Trash2 size={14} />}>
                            Clear cache
                        </Button>
                    </Row>
                    <Row
                        label="Export archive"
                        description="Download a full archive of all patient records and sessions."
                    >
                        <Button variant="secondary" size="md" leadingIcon={<Download size={14} />}>
                            Export archive
                        </Button>
                    </Row>
                </Section>

                {/* ---------- Build footer ---------- */}
                <Card pad="var(--sp-5)" style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-5)' }}>
                    <div
                        style={{
                            width: 44, height: 44,
                            borderRadius: 'var(--r-2)',
                            background: 'var(--accent-soft)',
                            color: 'var(--accent)',
                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                            border: '1px solid var(--hairline)',
                        }}
                    >
                        <Shield size={18} strokeWidth={1.8} />
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: 'var(--text-md)', color: 'var(--ink)' }}>
                            Anebilin Suite — Professional v1.2.0
                        </div>
                        <div className="num" style={{ fontSize: 'var(--text-sm)', color: 'var(--ink-3)' }}>
                            Build 2024.05.20.1 · Authorised for medical-screening use only.
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: 16, fontSize: 'var(--text-sm)', color: 'var(--ink-3)' }}>
                        <a href="#privacy" style={{ color: 'inherit' }}>Privacy</a>
                        <a href="#terms" style={{ color: 'inherit' }}>Terms</a>
                    </div>
                </Card>
            </div>
        </motion.div>
    );
};

// ---------- Helpers ----------

const Section: React.FC<React.PropsWithChildren<{ icon: React.ElementType; title: React.ReactNode }>> = ({
    icon: Icon, title, children,
}) => (
    <section style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
        <SectionHeader
            eyebrow={<><Icon size={12} strokeWidth={2} style={{ verticalAlign: -1, marginRight: 6 }} />Section</>}
            title={title}
        />
        <Card pad="0">
            {React.Children.map(children, (child, i) =>
                React.isValidElement(child)
                    ? React.cloneElement(child as React.ReactElement<{ first?: boolean }>, { first: i === 0 })
                    : child
            )}
        </Card>
    </section>
);

const Row: React.FC<React.PropsWithChildren<{ label: string; description?: string; first?: boolean }>> = ({
    label, description, first, children,
}) => (
    <div
        style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 'var(--sp-5)',
            padding: 'var(--sp-5) var(--sp-6)',
            borderTop: first ? 'none' : '1px solid var(--hairline)',
        }}
    >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: '54ch' }}>
            <span style={{ fontWeight: 600, color: 'var(--ink)', fontSize: 'var(--text-md)' }}>{label}</span>
            {description && (
                <span style={{ fontSize: 'var(--text-sm)', color: 'var(--ink-3)' }}>{description}</span>
            )}
        </div>
        <div style={{ flexShrink: 0 }}>{children}</div>
    </div>
);

const Toggle: React.FC<{ checked: boolean; onChange: (v: boolean) => void }> = ({ checked, onChange }) => (
    <button
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        style={{
            width: 40,
            height: 22,
            borderRadius: 999,
            background: checked ? 'var(--accent)' : 'var(--surface-tint)',
            border: `1px solid ${checked ? 'var(--accent)' : 'var(--hairline-strong)'}`,
            position: 'relative',
            cursor: 'pointer',
            transition: 'background-color var(--t-2) var(--ease), border-color var(--t-2) var(--ease)',
            padding: 0,
        }}
    >
        <span
            aria-hidden
            style={{
                position: 'absolute',
                top: 2, left: checked ? 20 : 2,
                width: 16, height: 16,
                borderRadius: '50%',
                background: checked ? 'var(--paper)' : 'var(--surface)',
                boxShadow: '0 1px 2px rgba(11,11,12,0.18)',
                transition: 'left var(--t-2) var(--ease)',
            }}
        />
    </button>
);

export default Settings;
