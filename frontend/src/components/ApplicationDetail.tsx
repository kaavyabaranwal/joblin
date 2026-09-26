import { useEffect, useState } from 'react';
import { API_URL, authHeaders } from '../api';
import type { Application, SimilarApplication, GapAnalysisResult } from '../types';
import { StatusBadge } from './StatusBadge';

interface Props {
    app: Application;
    token: string | null;
    hasResume: boolean;
    onBack: () => void;
}

type Tab = 'overview' | 'resumeFit' | 'fullJd' | 'notes';

export function ApplicationDetail({ app, token, hasResume, onBack }: Props) {
    const [tab, setTab] = useState<Tab>('overview');

    const [similar, setSimilar] = useState<SimilarApplication[]>([]);
    const [similarLoading, setSimilarLoading] = useState(false);

    const [gapResult, setGapResult] = useState<GapAnalysisResult | null>(null);
    const [gapLoading, setGapLoading] = useState(false);
    const [gapError, setGapError] = useState('');

    const [notes, setNotes] = useState(app.notes ?? '');
    const [savingNotes, setSavingNotes] = useState(false);
    const [notesSaved, setNotesSaved] = useState(false);

    useEffect(() => {
        if (app.parseStatus !== 'done') return;
        setSimilarLoading(true);
        fetch(`${API_URL}/applications/${app.id}/similar`, { headers: authHeaders(token) })
            .then((r) => r.json())
            .then(setSimilar)
            .catch(() => setSimilar([]))
            .finally(() => setSimilarLoading(false));
    }, [app.id]);

    const runGapAnalysis = async () => {
        setGapLoading(true);
        setGapError('');
        try {
            const res = await fetch(`${API_URL}/applications/${app.id}/gap-analysis`, {
                method: 'POST',
                headers: authHeaders(token),
            });
            const data = await res.json();
            if (!res.ok) {
                setGapError(data.error || 'Failed to analyze');
                return;
            }
            setGapResult(data);
        } catch (err) {
            console.error(err);
            setGapError('Network error');
        } finally {
            setGapLoading(false);
        }
    };

    const saveNotes = async () => {
        setSavingNotes(true);
        try {
            await fetch(`${API_URL}/applications/${app.id}/notes`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
                body: JSON.stringify({ notes }),
            });
            setNotesSaved(true);
            setTimeout(() => setNotesSaved(false), 2000);
        } catch (err) {
            console.error(err);
        } finally {
            setSavingNotes(false);
        }
    };

    const tabs: { key: Tab; label: string }[] = [
        { key: 'overview', label: 'Overview' },
        { key: 'resumeFit', label: 'Resume Fit' },
        { key: 'fullJd', label: 'Full JD' },
        { key: 'notes', label: 'Notes' },
    ];

    return (
        <div className="fade-in">
            <button onClick={onBack} className="btn-ghost" style={{ fontSize: 13, padding: '6px 12px', marginBottom: 16 }}>
                ← Back to applications
            </button>

            <div className="card" style={{ padding: 24, marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                    <div>
                        <h1 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 4px' }}>{app.company}</h1>
                        <div className="text-muted" style={{ fontSize: 14, marginBottom: 12 }}>{app.role}</div>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                            <StatusBadge status={app.status} />
                            {app.seniority && <span className="skill-tag" style={{ background: 'rgba(56,52,63,0.7)', color: '#a8a3b0', border: '1px solid #38343f' }}>{app.seniority}</span>}
                            {app.remotePolicy && <span className="skill-tag" style={{ background: 'rgba(56,52,63,0.7)', color: '#a8a3b0', border: '1px solid #38343f' }}>{app.remotePolicy}</span>}
                            {app.salaryRange && <span className="skill-tag" style={{ background: 'rgba(74,124,92,0.1)', color: '#6aad84', border: '1px solid rgba(74,124,92,0.25)' }}>{app.salaryRange}</span>}
                        </div>
                    </div>
                </div>
            </div>

            <div style={{ display: 'flex', gap: 2, marginBottom: 20, borderBottom: '1px solid #38343f', overflowX: 'auto' }}>
                {tabs.map((t) => (
                    <button
                        key={t.key}
                        onClick={() => setTab(t.key)}
                        style={{
                            padding: '10px 16px', background: 'none', border: 'none',
                            borderBottom: `2px solid ${tab === t.key ? '#8b6dd6' : 'transparent'}`,
                            color: tab === t.key ? '#8b6dd6' : '#a8a3b0',
                            fontSize: 13, fontWeight: 600, fontFamily: 'Montserrat, sans-serif',
                            cursor: 'pointer', marginBottom: -1, whiteSpace: 'nowrap',
                        }}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            {tab === 'overview' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(240px, 1fr)', gap: 20 }}>
                    <div className="card" style={{ padding: 20 }}>
                        <h3 style={{ fontSize: 14, fontWeight: 700, marginTop: 0, marginBottom: 12 }}>Extracted Skills</h3>
                        {app.parseStatus === 'done' ? (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                {app.skills.map((s) => (
                                    <span key={s} className="skill-tag" style={{ background: '#1c1a20', border: '1px solid #38343f', color: '#a8a3b0' }}>{s}</span>
                                ))}
                                {app.skills.length === 0 && <span className="text-muted" style={{ fontSize: 13 }}>No skills extracted.</span>}
                            </div>
                        ) : (
                            <span className="text-muted" style={{ fontSize: 13 }}>{app.parseStatus === 'pending' ? 'Still analyzing...' : 'Parsing failed.'}</span>
                        )}
                    </div>

                    <div className="card" style={{ padding: 20 }}>
                        <h3 style={{ fontSize: 14, fontWeight: 700, marginTop: 0, marginBottom: 12 }}>Similar Applications</h3>
                        {similarLoading && <span className="text-muted" style={{ fontSize: 13 }}>Loading...</span>}
                        {!similarLoading && similar.length === 0 && <span className="text-muted" style={{ fontSize: 13 }}>None yet.</span>}
                        {!similarLoading && similar.map((s) => (
                            <div key={s.id} style={{ marginBottom: 10 }}>
                                <div style={{ fontSize: 13, fontWeight: 600 }}>{s.role}</div>
                                <div className="text-muted" style={{ fontSize: 12, marginBottom: 4 }}>{s.company}</div>
                                <div className="progress-bar">
                                    <div className="progress-fill" style={{ width: `${s.similarity * 100}%`, background: 'linear-gradient(90deg, #6d5aa8, #8b6dd6)' }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {tab === 'resumeFit' && (
                <div className="card" style={{ padding: 24 }}>
                    {!hasResume ? (
                        <div className="text-muted" style={{ fontSize: 14 }}>
                            Upload your resume in the Resume section to unlock this analysis.
                        </div>
                    ) : !gapResult ? (
                        <div style={{ textAlign: 'center', padding: '20px 0' }}>
                            <button onClick={runGapAnalysis} disabled={gapLoading} className="btn-primary">
                                {gapLoading ? 'Analyzing...' : 'Analyze Resume Fit'}
                            </button>
                            {gapError && <div style={{ marginTop: 12, fontSize: 13, color: '#e08a8a' }}>{gapError}</div>}
                        </div>
                    ) : (
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
                                <div style={{
                                    width: 72, height: 72, borderRadius: '50%',
                                    border: `4px solid ${gapResult.matchScore >= 70 ? '#4a7c5c' : gapResult.matchScore >= 40 ? '#8b6dd6' : '#6b6575'}`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 700,
                                }}>
                                    {gapResult.matchScore}%
                                </div>
                                <div>
                                    <div style={{ fontSize: 15, fontWeight: 700 }}>Resume Fit Score</div>
                                    <div className="text-muted" style={{ fontSize: 13 }}>Based on skill overlap with this posting</div>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                                <div>
                                    <h4 style={{ fontSize: 13, fontWeight: 700, marginBottom: 8, color: '#6aad84' }}>Matched Skills</h4>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                        {gapResult.matchedSkills.map((s) => (
                                            <span key={s} className="skill-tag" style={{ background: 'rgba(74,124,92,0.15)', color: '#6aad84', border: '1px solid rgba(74,124,92,0.3)' }}>{s}</span>
                                        ))}
                                        {gapResult.matchedSkills.length === 0 && <span className="text-muted" style={{ fontSize: 12 }}>None</span>}
                                    </div>
                                </div>
                                <div>
                                    <h4 style={{ fontSize: 13, fontWeight: 700, marginBottom: 8, color: '#a8a3b0' }}>Missing Skills</h4>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                        {gapResult.missingSkills.map((s) => (
                                            <span key={s} className="skill-tag" style={{ background: '#1c1a20', border: '1px solid #38343f', color: '#a8a3b0' }}>{s}</span>
                                        ))}
                                        {gapResult.missingSkills.length === 0 && <span className="text-muted" style={{ fontSize: 12 }}>None — great match!</span>}
                                    </div>
                                </div>
                            </div>

                            {gapResult.suggestions.length > 0 && (
                                <div>
                                    <h4 style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>Suggested Rewrites</h4>
                                    {gapResult.suggestions.map((s, i) => (
                                        <div key={i} style={{ background: '#1c1a20', border: '1px solid #38343f', borderRadius: 8, padding: 14, marginBottom: 10 }}>
                                            <div style={{ fontSize: 12, color: '#6b6575', marginBottom: 6, textDecoration: 'line-through' }}>{s.original}</div>
                                            <div style={{ fontSize: 13, marginBottom: 6 }}>{s.improved}</div>
                                            <div className="text-accent" style={{ fontSize: 11 }}>{s.reason}</div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <button onClick={runGapAnalysis} disabled={gapLoading} className="btn-ghost" style={{ fontSize: 12, marginTop: 8 }}>
                                {gapLoading ? 'Re-analyzing...' : 'Re-run analysis'}
                            </button>
                        </div>
                    )}
                </div>
            )}

            {tab === 'fullJd' && (
                <div className="card" style={{ padding: 20 }}>
                    <div className="text-muted" style={{ fontSize: 13, lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                        {app.jobDescription || 'No job description on file.'}
                    </div>
                </div>
            )}

            {tab === 'notes' && (
                <div className="card" style={{ padding: 20 }}>
                    <textarea
                        className="input-field"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Interview prep, impressions, follow-up items..."
                        style={{ minHeight: 160, resize: 'vertical', fontFamily: 'Montserrat, sans-serif', marginBottom: 12 }}
                    />
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <button onClick={saveNotes} disabled={savingNotes} className="btn-primary" style={{ fontSize: 13 }}>
                            {savingNotes ? 'Saving...' : 'Save Notes'}
                        </button>
                        {notesSaved && <span className="text-success" style={{ fontSize: 12 }}>Saved ✓</span>}
                    </div>
                </div>
            )}
        </div>
    );
}