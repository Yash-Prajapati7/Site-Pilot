import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchCurrentUser, generateAIWebsite, fetchWebsite, createWebsite } from '../services/api';
import { ArrowLeft, Bot, Coffee, Rocket, Palette, ShoppingCart, Hospital, BookOpen, Scale, Lightbulb, Monitor, Smartphone, Tablet, Check, BarChart, Layers } from 'lucide-react';
import SkeletalTemplateBuilder from '../components/SkeletalTemplateBuilder';

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

export default function BuilderPage() {
    const { id } = useParams();
    const navigate = useNavigate();
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
    const chatEndRef = useRef(null);
    const iframeRef = useRef(null);
    const textareaRef = useRef(null);

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
                    if (existingHtml) {
                        setGeneratedHTML(existingHtml);
                        setShowTemplateBuilder(false);
                        if (iframeRef.current) iframeRef.current.srcdoc = existingHtml;
                        const v = website.activeVersion;
                        setMessages([{
                            role: 'assistant',
                            content: `Loaded v${v.versionNumber || 1} of "${website.name}".\n\nYou can type a prompt below to regenerate or modify it.`,
                            timestamp: new Date(),
                        }]);
                    }
                }
            }
        }
        init();
    }, [id]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    function handleTemplateGenerate(payload) {
        setTemplatePayload(payload);
        setShowTemplateBuilder(false);
        handleSend(null, payload);
    }

    async function handleSend(promptText, injectedPayload) {
        const text = promptText || prompt;
        const activePayload = injectedPayload || templatePayload;
        const aiPrompt = (activePayload && messages.length === 0)
            ? activePayload.enhancedPrompt
            : (text || activePayload?.enhancedPrompt);
        if (!aiPrompt?.trim() || streaming) return;

        // Ensure the project ID is valid (guard for edge cases)
        if (!id) {
            setMessages(prev => [...prev, { role: 'assistant', content: 'Error: No project selected. Please go back and open a project first.', timestamp: new Date(), error: true }]);
            return;
        }

        const displayText = text || (activePayload?.templateName
            ? `Generate with ${activePayload.templateName} template`
            : 'Generate website');
        const userMsg = { role: 'user', content: displayText, timestamp: new Date(), templateName: activePayload?.templateName };
        setMessages(prev => [...prev, userMsg]);
        setPrompt('');
        setStreaming(true);

        const aiMsgId = Date.now();
        setMessages(prev => [...prev, { role: 'assistant', content: '', streaming: true, id: aiMsgId, timestamp: new Date() }]);

        try {
            // Call the real backend → Gemini API, pass previous version for styling consistency
            const result = await generateAIWebsite(aiPrompt, history, id, generatedHTML);

            if (!result.ok) {
                setMessages(prev => prev.map(m => m.id === aiMsgId
                    ? { ...m, content: `Error: ${result.error}`, streaming: false, error: true }
                    : m));
                setStreaming(false);
                return;
            }

            const htmlContent = result.html;
            setGeneratedHTML(htmlContent);
            if (iframeRef.current) iframeRef.current.srcdoc = htmlContent;

            setHistory(prev => [...prev, { prompt: text, businessType: result.businessType }]);
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

    const previewWidth = previewDevice === 'desktop' ? '100%' : previewDevice === 'tablet' ? '768px' : '375px';
    const hasGenerated = generatedHTML.length > 0;

    return (
        <div style={{ margin: '-32px -40px', height: 'calc(100vh)', display: 'flex', flexDirection: 'column', background: 'var(--bg-primary)' }}>
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
            <div className="builder-toolbar" style={{ height: 56, background: 'var(--bg-primary)', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', flexShrink: 0, zIndex: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <button className="btn btn-ghost btn-sm mono" style={{ textTransform: 'uppercase', display:'flex', alignItems:'center', gap:4 }} onClick={() => navigate(`/dashboard/websites/${id}`)}><ArrowLeft size={14}/> Back</button>
                    <div style={{ height: 24, width: 1, background: 'var(--border-color)' }} />
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Bot size={16} />
                        <span className="mono" style={{ fontWeight: 700, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>AI Builder</span>
                        {projectName && (
                            <span className="mono" style={{ fontSize: 11, color: 'var(--text-muted)', borderLeft: '1px solid var(--border-color)', paddingLeft: 8 }}>
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
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    {hasGenerated && (
                        <>
                            <div style={{ display: 'flex', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-hard)', padding: 2, gap: 2 }}>
                                {[{ id: 'desktop', icon: <Monitor size={16}/> }, { id: 'tablet', icon: <Tablet size={16}/> }, { id: 'mobile', icon: <Smartphone size={16}/> }].map(d => (
                                    <button key={d.id} onClick={() => setPreviewDevice(d.id)}
                                        style={{ padding: '6px 12px', borderRadius: 'var(--radius-hard)', border: 'none', background: previewDevice === d.id ? 'var(--text-high)' : 'transparent', color: previewDevice === d.id ? 'var(--bg-primary)' : 'var(--text-muted)', cursor: 'pointer', fontSize: 12, transition: 'all 0.15s' }}>
                                        {d.icon}
                                    </button>
                                ))}
                            </div>
                            <div style={{ display: 'flex', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-hard)', padding: 2, gap: 2 }}>
                                {[{ id: 'preview', label: 'Preview' }, { id: 'code', label: 'Code' }].map(v => (
                                    <button key={v.id} className="mono" onClick={() => setViewMode(v.id)}
                                        style={{ padding: '6px 16px', borderRadius: 'var(--radius-hard)', border: 'none', background: viewMode === v.id ? 'var(--text-high)' : 'transparent', color: viewMode === v.id ? 'var(--bg-primary)' : 'var(--text-muted)', cursor: 'pointer', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', transition: 'all 0.15s' }}>
                                        {v.label}
                                    </button>
                                ))}
                            </div>
                            <div style={{ display: 'flex', gap: 8 }}>
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

            <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
                {/* Chat Panel */}
                <div style={{ width: hasGenerated ? 400 : '100%', maxWidth: hasGenerated ? 400 : '100%', margin: 0, background: 'var(--bg-primary)', borderRight: hasGenerated ? '1px solid var(--border-color)' : 'none', display: 'flex', flexDirection: 'column', flexShrink: 0, transition: 'all 0.3s ease', overflow: 'hidden' }}>
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
                                    maxWidth: hasGenerated ? '85%' : '70%',
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
                                        msg.content.split('\n').map((line, j) => (
                                            <span key={j}>
                                                {line.replace(/\*\*(.*?)\*\*/g, (_, text) => text).split('•').map((part, k) => (
                                                    k > 0 ? <span key={k}><br />• {part}</span> : <span key={k}>{part}</span>
                                                ))}
                                                {j < msg.content.split('\n').length - 1 && <br />}
                                            </span>
                                        ))
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

                {hasGenerated && (
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'var(--bg-primary)' }}>
                        {viewMode === 'preview' ? (
                            <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'flex-start', padding: previewDevice === 'desktop' ? 0 : 32, overflow: 'auto' }}>
                                <div style={{ width: previewWidth, height: '100%', transition: 'width 0.3s ease', border: previewDevice !== 'desktop' ? '1px solid var(--border-color)' : 'none', borderLeft: previewDevice === 'desktop' ? '1px solid var(--border-color)' : 'none' }}>
                                    <iframe ref={iframeRef} srcDoc={generatedHTML} style={{ width: '100%', height: '100%', border: 'none', background: 'white' }} title="Website Preview" sandbox="allow-scripts" />
                                </div>
                            </div>
                        ) : (
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
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
