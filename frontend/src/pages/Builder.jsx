import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { fetchCurrentUser, generateAIWebsite, fetchWebsite, generateBackendForWebsite } from '../services/api';
import { ArrowLeft, Bot, Coffee, Rocket, Palette, ShoppingCart, Hospital, BookOpen, Scale, Lightbulb, Monitor, Smartphone, Tablet, Check, BarChart, Layers, Server, History, Download, Eye, EyeOff } from 'lucide-react';
import SkeletalTemplateBuilder from '../components/SkeletalTemplateBuilder';
import apiClient from '../services/apiClient';

const STARTER_PROMPTS = [
    { icon: <Coffee size={24} />, label: 'Restaurant Website', prompt: 'Build a modern restaurant website for an Italian fine dining restaurant called Bella Cucina' },
    { icon: <Rocket size={24} />, label: 'SaaS Landing Page', prompt: 'Create a sleek SaaS landing page for an AI-powered analytics platform called DataPulse' },
    { icon: <Palette size={24} />, label: 'Portfolio / Agency', prompt: 'Design a creative agency portfolio website for a design studio called Pixel & Frame' },
    { icon: <ShoppingCart size={24} />, label: 'E-Commerce Store', prompt: 'Build an elegant e-commerce website for a premium fashion brand called LUXE Collective' },
    { icon: <Hospital size={24} />, label: 'Healthcare Clinic', prompt: 'Create a professional healthcare website for a modern medical center called Vitalis Health' },
    { icon: <BookOpen size={24} />, label: 'Online Academy', prompt: 'Build an education platform website for an online academy called BrightPath Academy' },
    { icon: <Scale size={24} />, label: 'Professional Services', prompt: 'Create a law firm website for a corporate law practice called Sterling & Associates' },
    { icon: <Lightbulb size={24} />, label: 'Startup Website', prompt: 'Build a modern startup landing page for an innovative tech company' },
];

const DEFAULT_PIPELINE = {
    frontend: { provider: 'gemini', model: 'gemini-3-flash-preview', status: 'idle' },
    backend: { provider: 'groq', model: 'openai/gpt-oss-120b', status: 'idle' },
};

function statusColor(status) {
    if (status === 'ready') return '#22c55e';
    if (status === 'generating' || status === 'queued') return '#f59e0b';
    if (status === 'error') return '#ef4444';
    return 'var(--text-muted)';
}

function statusLabel(status) {
    if (status === 'ready') return 'Ready';
    if (status === 'generating') return 'Generating';
    if (status === 'queued') return 'Queued';
    if (status === 'error') return 'Error';
    return 'Idle';
}

function BackendPanel({ websiteId }) {
    const [backend, setBackend] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadBackend() {
            try {
                const res = await apiClient.get(`/site-backends/${websiteId}`);
                setBackend(res.data.data);
            } catch {
                setBackend(null);
            } finally {
                setLoading(false);
            }
        }
        loadBackend();
    }, [websiteId]);

    if (loading) return <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span className="spinner" /> Loading backend...</div>;
    if (!backend) return <div style={{ flex: 1, padding: 24, color: 'var(--text-muted)' }}>No dynamic backend generated yet.</div>;

    return (
        <div style={{ flex: 1, overflow: 'auto', padding: 24, borderLeft: '1px solid var(--border-color)' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}><Server size={18} /> Dynamic Backend</h3>
            <div className="mono" style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 16 }}>
                {backend.status} · {backend.apiDefinition?.endpoints?.length || 0} endpoints
            </div>
            {(backend.apiDefinition?.endpoints || []).map((ep, i) => (
                <div key={i} style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-hard)', padding: 12, marginBottom: 8 }}>
                    <div className="mono" style={{ fontSize: 10, color: 'var(--text-muted)' }}>{ep.method}</div>
                    <div style={{ fontWeight: 700 }}>{ep.path}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{ep.description}</div>
                </div>
            ))}
        </div>
    );
}

function DeploymentPanel({ websiteId, projectName }) {
    const token = localStorage.getItem('authToken');
    const href = `http://localhost:5000/api/export/${websiteId}/docker?token=${token}`;

    return (
        <div style={{ flex: 1, overflow: 'auto', padding: 24, borderLeft: '1px solid var(--border-color)' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}><Download size={18} /> Deployment Bundle</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: 12 }}>Download a Docker bundle for {projectName || 'this website'}.</p>
            <a className="btn btn-primary" style={{ textDecoration: 'none' }} href={href} download>Download Docker Bundle</a>
        </div>
    );
}

function VersionPanel({ websiteId, onRestore }) {
    const [versions, setVersions] = useState([]);

    useEffect(() => {
        async function loadVersions() {
            try {
                const res = await apiClient.get(`/websites/${websiteId}/versions`);
                setVersions(res.data.data || []);
            } catch {
                setVersions([]);
            }
        }
        loadVersions();
    }, [websiteId]);

    return (
        <div style={{ flex: 1, overflow: 'auto', padding: 24, borderLeft: '1px solid var(--border-color)' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}><History size={18} /> Version History</h3>
            {versions.map((v, i) => (
                <div key={i} style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-hard)', padding: 12, marginBottom: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                        <strong>{v.label || `v${v.version}`}</strong>
                        <button className="btn btn-ghost btn-sm" disabled={v.isCurrent} onClick={() => onRestore(v.version)}>{v.isCurrent ? 'Current' : 'Restore'}</button>
                    </div>
                    <div className="mono" style={{ fontSize: 11, color: 'var(--text-muted)' }}>{v.prompt || 'Manual edit'}</div>
                </div>
            ))}
        </div>
    );
}

export default function BuilderPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [messages, setMessages] = useState([]);
    const [prompt, setPrompt] = useState('');
    const [streaming, setStreaming] = useState(false);
    const [generatedHTML, setGeneratedHTML] = useState('');
    const [viewMode, setViewMode] = useState('preview');
    const [previewDevice, setPreviewDevice] = useState('desktop');
    const [history, setHistory] = useState([]);
    const [user, setUser] = useState(null);
    const [aiUsage, setAiUsage] = useState(null);
    const [templatePayload, setTemplatePayload] = useState(null);
    const [showTemplateBuilder, setShowTemplateBuilder] = useState(true);
    const [projectName, setProjectName] = useState('');
    const [currentVersion, setCurrentVersion] = useState(1);
    const [pipeline, setPipeline] = useState(DEFAULT_PIPELINE);
    const [backendInfo, setBackendInfo] = useState('');
    const [showPreviewPane, setShowPreviewPane] = useState(true);
    const [isWideScreen, setIsWideScreen] = useState(typeof window !== 'undefined' ? window.innerWidth >= 1200 : true);
    const [isMobileScreen, setIsMobileScreen] = useState(typeof window !== 'undefined' ? window.innerWidth < 768 : false);
    const chatEndRef = useRef(null);
    const iframeRef = useRef(null);
    const textareaRef = useRef(null);
    const addPageMode = searchParams.get('addPage') === '1';
    const designMode = searchParams.get('design');
    const forceTemplateSelector = addPageMode && designMode === 'different';

    useEffect(() => {
        function handleResize() {
            const wide = window.innerWidth >= 1200;
            const mobile = window.innerWidth < 768;
            setIsWideScreen(wide);
            setIsMobileScreen(mobile);
            if (!wide) setShowPreviewPane(true);
        }
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    async function runBackendGenerationFlow(projectId) {
        setPipeline(prev => ({ ...prev, backend: { ...prev.backend, status: 'generating' } }));
        const backendResult = await generateBackendForWebsite(projectId);
        if (!backendResult.ok) {
            setPipeline(prev => ({ ...prev, backend: { ...prev.backend, status: 'error' } }));
            setBackendInfo(backendResult.error || 'Backend generation failed');
            return;
        }

        setPipeline(prev => ({
            ...prev,
            backend: {
                provider: backendResult.generation?.provider || 'groq',
                model: backendResult.generation?.model || 'openai/gpt-oss-120b',
                status: 'ready',
            }
        }));

        const endpointCount = backendResult.backend?.apiDefinition?.endpoints?.length || 0;
        setBackendInfo(`Generated ${endpointCount} backend endpoint${endpointCount === 1 ? '' : 's'} with ${backendResult.generation?.provider || 'groq'}.`);
    }

    useEffect(() => {
        async function init() {
            // Load current user
            const data = await fetchCurrentUser();
            setUser(data.user);

            // Load project and its active version (if any)
            if (id) {
                const { website } = await fetchWebsite(id);
                if (website) {
                    setProjectName(website.name);
                    // If there is an existing generated version, display it
                    const existingHtml = website.activeVersion?.htmlCode;
                    if (existingHtml && !forceTemplateSelector) {
                        setGeneratedHTML(existingHtml);
                        setCurrentVersion(website.activeVersion?.versionNumber || 1);
                        setShowTemplateBuilder(false);
                        setShowPreviewPane(true);
                        if (iframeRef.current) iframeRef.current.srcdoc = existingHtml;
                    }

                    if (forceTemplateSelector) {
                        setGeneratedHTML('');
                        setMessages([]);
                        setHistory([]);
                        setTemplatePayload(null);
                        setShowTemplateBuilder(true);
                    }
                }

                if (!forceTemplateSelector) {
                    try {
                        const chatRes = await apiClient.get(`/websites/${id}/chat`);
                        const chatData = chatRes?.data?.data || {};
                        const chatHistory = Array.isArray(chatData.chatHistory) ? chatData.chatHistory : [];
                        const promptHistory = Array.isArray(chatData.promptHistory) ? chatData.promptHistory : [];

                        if (promptHistory.length > 0) {
                            setHistory(promptHistory.map(entry => ({
                                prompt: entry?.prompt || '',
                                businessType: 'ai-generated',
                            })).filter(entry => entry.prompt));
                        }

                        if (chatHistory.length > 0) {
                            const mappedMessages = chatHistory
                                .filter(item => item?.content)
                                .map(item => ({
                                    role: item.role === 'user' ? 'user' : 'assistant',
                                    content: item.content,
                                    timestamp: item.ts ? new Date(item.ts) : new Date(),
                                }));
                            if (mappedMessages.length > 0) {
                                setMessages(mappedMessages);
                                setShowTemplateBuilder(false);
                            }
                        } else if (promptHistory.length > 0) {
                            const promptMessages = promptHistory
                                .filter(entry => entry?.prompt)
                                .map(entry => ({
                                    role: 'user',
                                    content: entry.prompt,
                                    timestamp: new Date(),
                                }));
                            if (promptMessages.length > 0) {
                                setMessages(promptMessages);
                                setShowTemplateBuilder(false);
                            }
                        }
                    } catch {
                        // chat history unavailable; continue with default state
                    }
                }

                // Fallback message when there is generated HTML but no persisted chat.
                if (website?.activeVersion?.htmlCode && !forceTemplateSelector) {
                    setMessages(prev => {
                        if (prev.length > 0) return prev;
                        const v = website.activeVersion;
                        return [{
                            role: 'assistant',
                            content: `Loaded v${v.versionNumber || 1} of "${website.name}".\n\nYou can type a prompt below to regenerate or modify it.`,
                            timestamp: new Date(),
                        }];
                    });
                }

                try {
                    const backendRes = await apiClient.get(`/site-backends/${id}`);
                    if (backendRes?.data?.success) {
                        setPipeline(prev => ({
                            ...prev,
                            backend: {
                                provider: backendRes.data.generation?.provider || 'groq',
                                model: backendRes.data.generation?.model || 'openai/gpt-oss-120b',
                                status: 'ready',
                            }
                        }));
                        const endpointCount = backendRes.data.data?.apiDefinition?.endpoints?.length || 0;
                        setBackendInfo(`Existing dynamic backend detected with ${endpointCount} endpoint${endpointCount === 1 ? '' : 's'}.`);
                    }
                } catch {
                    // no backend generated yet
                }
            }
        }
        init();
    }, [id, forceTemplateSelector]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    function handleTemplateGenerate(payload) {
        setTemplatePayload(payload);
        setShowTemplateBuilder(false);
        handleSend(null, payload);
    }

    async function handleSend(promptText, injectedPayload, overrideHTML = '') {
        const text = promptText || prompt;
        const activePayload = injectedPayload || templatePayload;
        const userEnteredPrompt = text?.trim() || activePayload?.userPrompt?.trim() || '';
        const aiPrompt = (activePayload && messages.length === 0)
            ? activePayload.enhancedPrompt
            : (text || activePayload?.enhancedPrompt);
        if (!aiPrompt?.trim() || streaming) return;

        // Ensure the project ID is valid (guard for edge cases)
        if (!id) {
            setMessages(prev => [...prev, { role: 'assistant', content: 'Error: No project selected. Please go back and open a project first.', timestamp: new Date(), error: true }]);
            return;
        }

        const displayText = userEnteredPrompt || 'Generate website';
        const userMsg = { 
            role: 'user', 
            content: displayText, 
            timestamp: new Date(), 
            templateName: activePayload?.templateName
        };
        setMessages(prev => [...prev, userMsg]);
        setPrompt('');
        setStreaming(true);

        const aiMsgId = Date.now();
        setMessages(prev => [...prev, { role: 'assistant', content: '', streaming: true, id: aiMsgId, timestamp: new Date() }]);

        try {
            // Call the real backend → Gemini API, pass previous version for styling consistency
            setPipeline(prev => ({ ...prev, frontend: { ...prev.frontend, status: 'generating' } }));
            const result = await generateAIWebsite(aiPrompt, history, id, overrideHTML || generatedHTML);

            if (!result.ok) {
                setMessages(prev => prev.map(m => m.id === aiMsgId
                    ? { ...m, content: `Error: ${result.error}`, streaming: false, error: true }
                    : m));
                setPipeline(prev => ({ ...prev, frontend: { ...prev.frontend, status: 'error' } }));
                setStreaming(false);
                return;
            }

            const htmlContent = result.html;
            setGeneratedHTML(htmlContent);
            setCurrentVersion(result.versionNumber || currentVersion);
            setShowPreviewPane(true);
            if (iframeRef.current) iframeRef.current.srcdoc = htmlContent;
            setPipeline(prev => ({
                ...prev,
                frontend: {
                    provider: result.generation?.provider || 'gemini',
                    model: result.generation?.model || 'gemini-3-flash-preview',
                    status: 'ready',
                },
                backend: { ...prev.backend, status: 'queued' }
            }));
            runBackendGenerationFlow(id);

            setHistory(prev => [...prev, { prompt: userEnteredPrompt || 'Generate website', businessType: result.businessType }]);
            setAiUsage(result.usage);

            const sectionCount = (htmlContent.match(/<section/g) || []).length;
            const lineCount    = htmlContent.split('\n').length;
            setMessages(prev => prev.map(m => m.id === aiMsgId ? {
                ...m,
                content: `Website generated successfully!\n\n**${lineCount} lines** of code | **${sectionCount} sections** | **v${result.versionNumber || 1}** saved\n\nYour website is live in the preview. You can:\n• Type another prompt to modify it\n• Switch to code view to see the source\n• Change the preview device size`,
                streaming: false,
                meta: { versionNumber: result.versionNumber },
            } : m));
        } catch (err) {
            setMessages(prev => prev.map(m => m.id === aiMsgId
                ? { ...m, content: `Unexpected error: ${err.message}`, streaming: false, error: true }
                : m));
            setPipeline(prev => ({ ...prev, frontend: { ...prev.frontend, status: 'error' } }));
        }
        setStreaming(false);
    }

    function handleKeyDown(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    }

    function copyCode() {
        navigator.clipboard.writeText(generatedHTML);
    }

    function downloadCode() {
        const blob = new Blob([generatedHTML], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'website.html';
        a.click();
        URL.revokeObjectURL(url);
    }

    async function handleRestoreVersion(version) {
        try {
            const res = await apiClient.post(`/websites/${id}/versions/${version}/restore`);
            setGeneratedHTML(res.data.data.html);
            setCurrentVersion(res.data.data.version);
            setViewMode('preview');
        } catch (err) {
            console.error('Restore failed', err);
        }
    }

    const previewWidth = previewDevice === 'desktop' ? '100%' : previewDevice === 'tablet' ? '768px' : '375px';
    const hasGenerated = generatedHTML.length > 0;

    return (
        <div style={{ margin: '-32px -40px', width: 'calc(100% + 80px)', maxWidth: '100vw', height: 'calc(100vh)', display: 'flex', flexDirection: 'column', background: 'var(--bg-primary)', overflow: 'hidden' }}>
            <style>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                }
                @keyframes pulse {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.4; transform: scale(0.8); }
                }
                .builder-toolbar {
                    opacity: 0.5;
                    transition: opacity 0.2s;
                }
                .builder-toolbar:hover {
                    opacity: 1;
                }
            `}</style>
            {/* Top Bar */}
            <div className="builder-toolbar" style={{ minHeight: 56, background: 'var(--bg-primary)', borderBottom: '1px solid var(--border-color)', display: 'flex', flexDirection: isMobileScreen ? 'column' : 'row', alignItems: isMobileScreen ? 'stretch' : 'center', justifyContent: 'space-between', padding: isMobileScreen ? '10px 12px' : '8px 16px', flexShrink: 0, zIndex: 10, gap: isMobileScreen ? 8 : 12, flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', minWidth: 0, flex: '1 1 320px', width: isMobileScreen ? '100%' : 'auto' }}>
                    <button className="btn btn-ghost btn-sm mono" style={{ textTransform: 'uppercase', display:'flex', alignItems:'center', gap:4 }} onClick={() => navigate(`/dashboard/websites/${id}`)}><ArrowLeft size={14}/> Back</button>
                    <div style={{ height: 24, width: 1, background: 'var(--border-color)' }} />
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                        <Bot size={16} />
                        <span className="mono" style={{ fontWeight: 700, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>AI Builder</span>
                        {projectName && (
                            <span className="mono" style={{ fontSize: 11, color: 'var(--text-muted)', borderLeft: '1px solid var(--border-color)', paddingLeft: 8, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 220 }}>
                                {projectName}
                            </span>
                        )}
                    </div>
                    {messages.length === 0 && !showTemplateBuilder && (
                        <button className="btn btn-ghost btn-sm mono" style={{ textTransform: 'uppercase', display:'flex', alignItems:'center', gap:4 }} onClick={() => setShowTemplateBuilder(true)}>
                            <Layers size={12}/> Templates
                        </button>
                    )}
                    {templatePayload?.templateName && messages.length > 0 && (
                        <div className="mono" style={{ fontSize: 10, color: 'var(--text-muted)', padding: '4px 10px', border: '1px solid var(--border-color)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                            {templatePayload.templateName}
                        </div>
                    )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: isMobileScreen ? 'flex-start' : 'flex-end', gap: 8, flexWrap: 'wrap', minWidth: 0, flex: '1 1 480px', width: isMobileScreen ? '100%' : 'auto' }}>
                    {hasGenerated && (
                        <>
                            {isWideScreen && (
                                <button
                                    className="btn btn-ghost btn-sm mono"
                                    style={{ textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 6 }}
                                    onClick={() => setShowPreviewPane(prev => !prev)}
                                >
                                    {showPreviewPane ? <EyeOff size={14} /> : <Eye size={14} />}
                                    {showPreviewPane ? 'Close Preview' : 'Open Preview'}
                                </button>
                            )}
                            <div style={{ display: 'flex', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-hard)', padding: 2, gap: 2, flexShrink: 0 }}>
                                {[{ id: 'desktop', icon: <Monitor size={16}/> }, { id: 'tablet', icon: <Tablet size={16}/> }, { id: 'mobile', icon: <Smartphone size={16}/> }].map(d => (
                                    <button key={d.id} onClick={() => setPreviewDevice(d.id)}
                                        style={{ padding: isMobileScreen ? '6px 10px' : '6px 12px', borderRadius: 'var(--radius-hard)', border: 'none', background: previewDevice === d.id ? 'var(--text-high)' : 'transparent', color: previewDevice === d.id ? 'var(--bg-primary)' : 'var(--text-muted)', cursor: 'pointer', fontSize: 12, transition: 'all 0.15s' }}>
                                        {d.icon}
                                    </button>
                                ))}
                            </div>
                            <div style={{ display: 'flex', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-hard)', padding: 2, gap: 2, flexWrap: 'wrap' }}>
                                {[{ id: 'preview', label: 'Preview' }, { id: 'code', label: 'Code' }, { id: 'backend', label: 'Backend' }, { id: 'deploy', label: 'Deploy' }, { id: 'history', label: 'History' }].map(v => (
                                    <button key={v.id} className="mono" onClick={() => setViewMode(v.id)}
                                        style={{ padding: isMobileScreen ? '6px 12px' : '6px 16px', borderRadius: 'var(--radius-hard)', border: 'none', background: viewMode === v.id ? 'var(--text-high)' : 'transparent', color: viewMode === v.id ? 'var(--bg-primary)' : 'var(--text-muted)', cursor: 'pointer', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', transition: 'all 0.15s' }}>
                                        {v.label}
                                    </button>
                                ))}
                            </div>
                            <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                                <button className="btn btn-ghost btn-sm mono" style={{ textTransform: 'uppercase' }} onClick={copyCode}>Copy</button>
                                <button className="btn btn-ghost btn-sm mono" style={{ textTransform: 'uppercase' }} onClick={downloadCode}>Download</button>
                            </div>
                        </>
                    )}
                    {aiUsage && (
                        <div className="mono" style={{ fontSize: 11, color: 'var(--text-muted)', padding: '6px 12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-hard)', textTransform: 'uppercase' }}>
                            AI: {aiUsage.used}/{aiUsage.limit}
                        </div>
                    )}
                </div>
            </div>

            {hasGenerated && backendInfo && (
                <div className="mono" style={{ fontSize: 10, color: 'var(--text-muted)', borderBottom: '1px solid var(--border-color)', padding: '8px 24px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {backendInfo}
                </div>
            )}

            <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
                {/* Chat Panel */}
                <div style={{ width: hasGenerated && showPreviewPane ? 400 : '100%', maxWidth: hasGenerated && showPreviewPane ? 400 : '100%', margin: 0, background: 'var(--bg-primary)', borderRight: hasGenerated && showPreviewPane ? '1px solid var(--border-color)' : 'none', display: 'flex', flexDirection: 'column', flexShrink: 0, transition: 'all 0.3s ease', overflow: 'hidden' }}>
                    <div style={{ flex: 1, overflow: 'auto', padding: (messages.length === 0 && showTemplateBuilder) ? 0 : (hasGenerated ? 24 : '64px 32px') }}>
                        {messages.length === 0 && showTemplateBuilder && (
                            <div style={{ height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                                <SkeletalTemplateBuilder onGenerate={handleTemplateGenerate} />
                            </div>
                        )}

                        {messages.length === 0 && !showTemplateBuilder && (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
                                <Bot size={32} style={{ marginBottom: 16, animation: 'float 3s ease-in-out infinite', opacity: 0.5 }} />
                                <p className="mono" style={{ color: 'var(--text-muted)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Building your website...</p>
                            </div>
                        )}

                        {messages.map((msg, i) => (
                            <div key={i} style={{ marginBottom: 24, display: 'flex', gap: 16, justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                                {msg.role === 'assistant' && (
                                    <div style={{ width: 32, height: 32, border: '1px solid var(--border-color)', borderRadius: 'var(--radius-hard)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}><Bot size={14} /></div>
                                )}
                                <div className="mono" style={{
                                    maxWidth: isMobileScreen
                                        ? '88%'
                                        : (hasGenerated
                                            ? (msg.role === 'user' ? '56%' : '62%')
                                            : (msg.role === 'user' ? '64%' : '70%')),
                                    padding: '16px 20px',
                                    borderRadius: 'var(--radius-hard)',
                                    background: msg.role === 'user' ? 'var(--text-high)' : 'transparent',
                                    color: msg.role === 'user' ? 'var(--bg-primary)' : msg.error ? 'var(--error)' : 'var(--text-high)',
                                    border: msg.role === 'user' ? 'none' : `1px solid ${msg.error ? 'var(--error)' : 'var(--border-color)'}`,
                                    fontSize: 12, lineHeight: 1.6, whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                                }}>
                                    {msg.streaming ? (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                            <div style={{ display: 'flex', gap: 6 }}>
                                                <span style={{ width: 6, height: 6, background: 'var(--text-high)', animation: 'pulse 1.4s ease infinite' }} />
                                                <span style={{ width: 6, height: 6, background: 'var(--text-high)', animation: 'pulse 1.4s ease infinite', animationDelay: '0.2s' }} />
                                                <span style={{ width: 6, height: 6, background: 'var(--text-high)', animation: 'pulse 1.4s ease infinite', animationDelay: '0.4s' }} />
                                            </div>
                                            <span style={{ color: 'var(--text-muted)', textTransform: 'uppercase' }}>Building...</span>
                                        </div>
                                    ) : (
                                        <>
                                            {msg.content.split('\n').map((line, j) => (
                                                <span key={j}>
                                                    {line.replace(/\*\*(.*?)\*\*/g, (_, text) => text).split('•').map((part, k) => (
                                                        k > 0 ? <span key={k}><br />• {part}</span> : <span key={k}>{part}</span>
                                                    ))}
                                                    {j < msg.content.split('\n').length - 1 && <br />}
                                                </span>
                                            ))}
                                        </>
                                    )}
                                </div>
                                {msg.role === 'user' && (
                                    <div className="mono" style={{ width: 32, height: 32, border: '1px solid var(--border-color)', borderRadius: 'var(--radius-hard)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, flexShrink: 0, textTransform: 'uppercase' }}>
                                        {user?.name?.charAt(0) || 'U'}
                                    </div>
                                )}
                            </div>
                        ))}
                        <div ref={chatEndRef} />
                    </div>

                    {/* Hide chat input while template builder is showing its own input */}
                    <div style={{ padding: hasGenerated ? '16px 24px' : '24px 32px', borderTop: '1px solid var(--border-color)', background: 'var(--bg-primary)', display: (messages.length === 0 && showTemplateBuilder) ? 'none' : undefined }}>
                        {hasGenerated && messages.length > 0 && (
                            <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
                                {['Change colors to blue', 'Make it more minimal', 'Add a pricing section', 'Update the hero text'].map(s => (
                                    <button key={s} className="mono" onClick={() => { setPrompt(s); handleSend(s); }}
                                        style={{ padding: '6px 12px', background: 'transparent', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-hard)', fontSize: 10, color: 'var(--text-muted)', cursor: 'pointer', textTransform: 'uppercase', transition: 'all 0.2s', whiteSpace: 'nowrap' }}
                                        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--text-high)'; e.currentTarget.style.color = 'var(--text-high)'; }}
                                        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.color = 'var(--text-muted)'; }}>
                                        {s}
                                    </button>
                                ))}
                            </div>
                        )}
                        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
                            <textarea ref={textareaRef} value={prompt} onChange={e => setPrompt(e.target.value)} onKeyDown={handleKeyDown}
                                placeholder={messages.length === 0 ? 'Describe the website you want to build...' : 'Describe changes to your website...'}
                                rows={1} className="mono" style={{ flex: 1, resize: 'none', padding: '16px', borderRadius: 'var(--radius-hard)', background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-high)', fontSize: 12, outline: 'none', transition: 'border-color 0.2s', lineHeight: 1.5, minHeight: 52, maxHeight: 160 }}
                                onFocus={e => e.target.style.borderColor = 'var(--text-high)'}
                                onBlur={e => e.target.style.borderColor = 'var(--border-color)'}
                                onInput={e => { e.target.style.height = 'auto'; e.target.style.height = Math.min(e.target.scrollHeight, 160) + 'px'; }}
                            />
                            <button onClick={() => handleSend()} disabled={!prompt.trim() || streaming}
                                style={{ width: 52, height: 52, borderRadius: 'var(--radius-hard)', border: '1px solid', borderColor: prompt.trim() && !streaming ? 'var(--text-high)' : 'var(--border-color)', background: prompt.trim() && !streaming ? 'var(--text-high)' : 'transparent', color: prompt.trim() && !streaming ? 'var(--bg-primary)' : 'var(--text-muted)', cursor: prompt.trim() && !streaming ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, transition: 'all 0.2s', flexShrink: 0 }}>
                                {streaming ? <span className="spinner" style={{ width: 20, height: 20, borderWidth: 2, borderColor: 'var(--text-muted)', borderTopColor: 'transparent' }} /> : '→'}
                            </button>
                        </div>
                        <div className="mono" style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 12, textAlign: 'center', textTransform: 'uppercase' }}>Press Enter to send · Shift+Enter for new line</div>
                    </div>
                </div>

                {hasGenerated && showPreviewPane && (
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'var(--bg-primary)' }}>
                        {viewMode === 'preview' ? (
                            <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'flex-start', padding: previewDevice === 'desktop' ? 0 : 32, overflow: 'auto' }}>
                                <div style={{ width: previewWidth, height: '100%', transition: 'width 0.3s ease', border: previewDevice !== 'desktop' ? '1px solid var(--border-color)' : 'none', borderLeft: previewDevice === 'desktop' ? '1px solid var(--border-color)' : 'none' }}>
                                    <iframe ref={iframeRef} srcDoc={generatedHTML} style={{ width: '100%', height: '100%', border: 'none', background: 'white' }} title="Website Preview" sandbox="allow-scripts" />
                                </div>
                            </div>
                        ) : viewMode === 'code' ? (
                            <div style={{ flex: 1, overflow: 'auto', padding: 0, borderLeft: '1px solid var(--border-color)' }}>
                                <div style={{ position: 'sticky', top: 0, background: 'var(--bg-primary)', padding: '12px 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10 }}>
                                    <span className="mono" style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase' }}>index.html — {generatedHTML.split('\n').length} lines</span>
                                    <div style={{ display: 'flex', gap: 8 }}>
                                        <button className="btn btn-ghost btn-sm mono" onClick={copyCode} style={{ textTransform: 'uppercase' }}>Copy</button>
                                        <button className="btn btn-ghost btn-sm mono" onClick={downloadCode} style={{ textTransform: 'uppercase' }}>Download</button>
                                    </div>
                                </div>
                                <pre className="mono" style={{ padding: '24px', margin: 0, fontSize: 12, lineHeight: 1.6, color: 'var(--text-muted)', background: 'var(--bg-primary)', whiteSpace: 'pre-wrap', wordBreak: 'break-all', overflow: 'auto', tabSize: 2 }}>
                                    <code>{generatedHTML}</code>
                                </pre>
                            </div>
                        ) : viewMode === 'backend' ? (
                            <BackendPanel websiteId={id} />
                        ) : viewMode === 'deploy' ? (
                            <DeploymentPanel websiteId={id} projectName={projectName} />
                        ) : (
                            <VersionPanel websiteId={id} onRestore={handleRestoreVersion} />
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
