import { useState, useEffect } from 'react';
import { fetchCurrentUser, fetchWebsites, deployWebsite } from '../services/api';
import { Globe, FileText, PenTool, Rocket, Globe2, FileText as FileIcon, Eye, Edit2, Zap, Cpu } from 'lucide-react';

export default function DeploymentsPage() {
    const [user, setUser] = useState(null);
    const [websites, setWebsites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deploying, setDeploying] = useState(null);

    useEffect(() => {
        async function init() {
            const u = await fetchCurrentUser();
            const w = await fetchWebsites();
            setUser(u.user);
            setWebsites(w.websites || []);
            setLoading(false);
        }
        init();
    }, []);

    async function handleDeploy(siteId) {
        setDeploying(siteId);
        await deployWebsite(siteId);
        setTimeout(() => {
            fetchWebsites().then((w) => {
                setWebsites(w.websites || []);
                setDeploying(null);
            });
        }, 2000);
    }

    if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner" style={{ width: 32, height: 32 }} /></div>;

    const deployments = [
        { id: 1, site: websites[0]?.name, version: 'v3', env: 'Production', status: 'live', user: user?.name, time: '2h ago', duration: '12s' },
        { id: 2, site: websites[0]?.name, version: 'v2', env: 'Production', status: 'superseded', user: user?.name, time: '3 weeks ago', duration: '8s' },
        { id: 3, site: websites[0]?.name, version: 'v1', env: 'Production', status: 'superseded', user: user?.name, time: '2 months ago', duration: '10s' },
        ...(websites[1] ? [{ id: 4, site: websites[1]?.name, version: 'v1', env: 'Preview', status: 'preview', user: user?.name, time: '1 week ago', duration: '6s' }] : []),
    ];

    const statusBadge = (s) => {
        if (s === 'live') return 'badge-success';
        if (s === 'preview') return 'badge-info';
        if (s === 'failed') return 'badge-danger';
        return 'badge-warning';
    };

    return (
        <div className="animate-slide-up">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 40 }}>
                <div>
                    <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 8, letterSpacing: '-0.03em', textTransform: 'uppercase' }}>Deployments</h1>
                    <p className="mono" style={{ color: 'var(--text-muted)', fontSize: 13, textTransform: 'uppercase' }}>Deploy and manage website versions</p>
                </div>
            </div>

            <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 24, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Quick Deploy</h2>
            <div className="grid grid-3" style={{ marginBottom: 40, gap: 24 }}>
                {websites.map(site => (
                    <div key={site.id} className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 24, borderRadius: 'var(--radius-subtle)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                            <div style={{ width: 40, height: 40, background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-hard)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>{site.settings?.favicon || <Globe size={20} />} </div>
                            <div>
                                <div className="mono" style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-high)', marginBottom: 4 }}>{site.name}</div>
                                <span className="badge mono" style={{ textTransform: 'uppercase' }}>{site.status}</span>
                            </div>
                        </div>
                        <button className="btn btn-primary mono" style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }} onClick={() => handleDeploy(site.id)} disabled={deploying === site.id}>
                            {deploying === site.id ? 'Deploying...' : 'Deploy'}
                        </button>
                    </div>
                ))}
            </div>

            <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 24, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Deployment History</h2>
            <div className="card" style={{ padding: 0, borderRadius: 'var(--radius-subtle)', overflow: 'hidden', marginBottom: 40 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--border-color)', background: 'var(--bg-surface)' }}>
                            <th className="mono" style={{ padding: '16px 24px', textAlign: 'left', fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Website</th>
                            <th className="mono" style={{ padding: '16px 24px', textAlign: 'left', fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Version</th>
                            <th className="mono" style={{ padding: '16px 24px', textAlign: 'left', fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Environment</th>
                            <th className="mono" style={{ padding: '16px 24px', textAlign: 'left', fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Status</th>
                            <th className="mono" style={{ padding: '16px 24px', textAlign: 'left', fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>By</th>
                            <th className="mono" style={{ padding: '16px 24px', textAlign: 'left', fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Time</th>
                            <th className="mono" style={{ padding: '16px 24px', textAlign: 'left', fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Duration</th>
                            <th className="mono" style={{ padding: '16px 24px', textAlign: 'right', fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {deployments.map((d, i) => (
                            <tr key={d.id} style={{ borderBottom: i === deployments.length - 1 ? 'none' : '1px solid var(--border-color)' }}>
                                <td className="mono" style={{ padding: '16px 24px', fontSize: 13, color: 'var(--text-high)', fontWeight: 600 }}>{d.site}</td>
                                <td style={{ padding: '16px 24px' }}><span className="badge mono" style={{ textTransform: 'uppercase' }}>{d.version}</span></td>
                                <td className="mono" style={{ padding: '16px 24px', fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{d.env}</td>
                                <td style={{ padding: '16px 24px' }}><span className="badge mono" style={{ textTransform: 'uppercase' }}>{d.status}</span></td>
                                <td className="mono" style={{ padding: '16px 24px', fontSize: 12, color: 'var(--text-muted)' }}>{d.user}</td>
                                <td className="mono" style={{ padding: '16px 24px', fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{d.time}</td>
                                <td className="mono" style={{ padding: '16px 24px', fontSize: 12, color: 'var(--text-high)' }}>{d.duration}</td>
                                <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                                    {d.status === 'superseded' && <button className="btn btn-ghost btn-sm mono" style={{ textTransform: 'uppercase' }}>Rollback</button>}
                                    {d.status === 'live' && <span className="mono" style={{ fontSize: 11, color: 'var(--text-high)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Live</span>}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 24, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Deployment Pipeline</h2>
            <div className="card" style={{ padding: 40, borderRadius: 'var(--radius-subtle)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0 }}>
                    {[
                        { label: 'Draft', icon: <FileIcon size={20} />, desc: 'Edit in Builder', done: true },
                        { label: 'Preview', icon: <Eye size={20} />, desc: 'Review changes', done: true },
                        { label: 'Build', icon: <Edit2 size={20} />, desc: 'Compile assets', done: true },
                        { label: 'Deploy', icon: <Rocket size={20} />, desc: 'Push to CDN', done: true },
                        { label: 'Live', icon: <Globe2 size={20} />, desc: 'Available online', done: true },
                    ].map((step, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
                            <div style={{ textAlign: 'center', width: 120 }}>
                                <div style={{ width: 48, height: 48, borderRadius: 'var(--radius-hard)', background: step.done ? 'var(--text-high)' : 'var(--bg-primary)', color: step.done ? 'var(--bg-primary)' : 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, margin: '0 auto 16px', border: step.done ? '1px solid var(--text-high)' : '1px solid var(--border-color)' }}>{step.icon}</div>
                                <div className="mono" style={{ fontWeight: 700, fontSize: 12, color: 'var(--text-high)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>{step.label}</div>
                                <div className="mono" style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{step.desc}</div>
                            </div>
                            {i < 4 && <div style={{ width: 60, height: 1, background: step.done ? 'var(--text-high)' : 'var(--border-color)', margin: '0 8px', marginBottom: 40 }} />}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
