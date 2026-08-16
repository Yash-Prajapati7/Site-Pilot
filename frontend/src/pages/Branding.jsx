import { useState, useEffect, useRef } from 'react';
import { Palette, Type, Image, UploadCloud, Save, Briefcase, X, AlignLeft, Code, Copy, Check, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import { fetchCurrentUser, fetchBranding, modifyTenant, uploadLogo } from '../services/api';
import { formatINR } from '../lib/currency';

export default function BrandingPage() {
    const [user, setUser] = useState(null);
    const [branding, setBranding] = useState({});
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [loading, setLoading] = useState(true);
    const [copiedHex, setCopiedHex] = useState(null);
    const [serviceForm, setServiceForm] = useState({ name: '', description: '', price: '' });
    const logoInputRef = useRef(null);

    useEffect(() => {
        async function init() {
            const [{ user: u }, { branding: b }] = await Promise.all([
                fetchCurrentUser(),
                fetchBranding(),
            ]);
            setUser(u);
            setBranding(b || u?.tenant?.branding || {});
            setLoading(false);
        }
        init();
    }, []);

    function normalizeHex(val) {
        if (!val) return null;
        let s = String(val).trim();
        if (!s) return null;
        if (!s.startsWith('#')) s = `#${s}`;
        
        const three = /^#([0-9a-fA-F])([0-9a-fA-F])([0-9a-fA-F])$/i;
        const six = /^#([0-9a-fA-F]{6})$/i;
        
        const m3 = s.match(three);
        if (m3) return `#${m3[1]}${m3[1]}${m3[2]}${m3[2]}${m3[3]}${m3[3]}`.toLowerCase();
        
        const m6 = s.match(six);
        if (m6) return s.toLowerCase();
        
        return null;
    }

    function hexToRgba(hex, alpha = 1) {
        const h = normalizeHex(hex);
        if (!h) return null;
        const n = parseInt(h.slice(1), 16);
        const r = (n >> 16) & 255;
        const g = (n >> 8) & 255;
        const b = n & 255;
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }

    function isLightHex(hex) {
        const h = normalizeHex(hex);
        if (!h) return false;
        const n = parseInt(h.slice(1), 16);
        const r = (n >> 16) & 255;
        const g = (n >> 8) & 255;
        const b = n & 255;
        const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        return lum > 0.7;
    }

    function parseCssColorVariables(text) {
        if (!text || typeof text !== 'string') return [];
        const results = [];
        const seenHex = new Set();

        // 1. Match CSS variable definitions: --var-name: #hexCode;
        const varRegex = /(--[a-zA-Z0-9_-]+)\s*:\s*(#[0-9a-fA-F]{3,8})/g;
        let match;
        while ((match = varRegex.exec(text)) !== null) {
            const varName = match[1];
            const hex = normalizeHex(match[2]);
            if (hex) {
                results.push({ varName, hex });
                seenHex.add(hex.toLowerCase());
            }
        }

        // 2. If no CSS variables were matched, match standalone hex codes: #6C63FF, #FFF, etc.
        if (results.length === 0) {
            const hexRegex = /#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b/g;
            let count = 1;
            while ((match = hexRegex.exec(text)) !== null) {
                const hex = normalizeHex(match[0]);
                if (hex && !seenHex.has(hex.toLowerCase())) {
                    seenHex.add(hex.toLowerCase());
                    results.push({ varName: `--color-${count++}`, hex });
                }
            }
        }

        return results;
    }

    function copyToClipboard(hex) {
        if (!hex) return;
        navigator.clipboard.writeText(hex);
        setCopiedHex(hex);
        toast.success(`Copied ${hex} to clipboard!`, { duration: 1500 });
        setTimeout(() => setCopiedHex(null), 2000);
    }

    async function handleSave() {
        setSaving(true);
        const result = await modifyTenant(branding);
        setSaving(false);
        if (result.ok) {
            toast.success('Branding saved successfully!');
        } else {
            toast.error(result.error || 'Failed to save branding. Please try again.');
        }
    }

    async function handleLogoUpload(e) {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        const result = await uploadLogo(file);
        if (result.ok) {
            setBranding(prev => ({ ...prev, logo: result.logo }));
            toast.success('Logo uploaded successfully!');
        } else {
            toast.error(result.error || 'Failed to upload logo.');
        }
        setUploading(false);
    }

    function handleAddService() {
        if (!serviceForm.name.trim()) {
            toast.error('Service name is required');
            return;
        }
        const newService = {
            name: serviceForm.name,
            description: serviceForm.description,
            price: serviceForm.price ? parseFloat(serviceForm.price) : 0,
        };
        setBranding(prev => ({
            ...prev,
            services: [...(prev.services || []), newService],
        }));
        setServiceForm({ name: '', description: '', price: '' });
        toast.success(`Service "${newService.name}" added`);
    }

    function handleRemoveService(index) {
        setBranding(prev => ({
            ...prev,
            services: prev.services?.filter((_, i) => i !== index) || [],
        }));
    }

    if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner" style={{ width: 32, height: 32 }} /></div>;

    const FONTS = ['Inter', 'Outfit', 'Roboto', 'Open Sans', 'Poppins', 'Montserrat', 'Playfair Display', 'Raleway'];
    
    const COLOR_CONFIG = [
        { key: 'primaryColor', label: 'Primary Color', defaultHex: '#8b5cf6' },
        { key: 'secondaryColor', label: 'Secondary Color', defaultHex: '#10b981' },
        { key: 'accentColor', label: 'Accent Color', defaultHex: '#f59e0b' },
        { key: 'bgColor', label: 'Background Color', defaultHex: '#ffffff' },
        { key: 'textColor', label: 'Text Color', defaultHex: '#ffffff' },
    ];

    const parsedPalette = parseCssColorVariables(branding.userProvidedColorPallete || '');

    const brandName = branding.brandName || branding.companyName || user?.tenant?.name || 'Company';
    const brandDescription = branding.brandDescription || branding.companyDescription || 'Your tagline or mission statement goes here';
    const headingFont = branding.fontHeading || branding.headingFont || 'Outfit';
    const bodyFont = branding.fontBody || branding.bodyFont || 'Inter';
    const pBgColor = normalizeHex(branding.bgColor) || normalizeHex(branding.backgroundColor) || '#ffffff';
    const pTextColor = normalizeHex(branding.textColor) || '#ffffff';
    const pPrimaryColor = parsedPalette.length > 0 
        ? parsedPalette[0].hex 
        : (normalizeHex(branding.primaryColor) || '#8b5cf6');
    
    const previewServices = branding.services?.length > 0 
        ? branding.services 
        : [
            { name: 'Feature One', description: 'Description of this feature', price: 0 },
            { name: 'Feature Two', description: 'Description of this feature', price: 0 },
            { name: 'Feature Three', description: 'Description of this feature', price: 0 }
          ];

    return (
        <div className="animate-slide-up">
            <div style={{ marginBottom: 'clamp(24px, 4vw, 40px)' }}>
                <h1 style={{ fontSize: 'clamp(24px, 5vw, 32px)', fontWeight: 800, marginBottom: 8, letterSpacing: '-0.03em', textTransform: 'uppercase' }}>Branding</h1>
                <p className="mono" style={{ color: 'var(--text-muted)', fontSize: 13, textTransform: 'uppercase' }}>Customize your brand colors, typography, services, and visual identity</p>
            </div>

            {/* Fluid flexbox layout */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, alignItems: 'flex-start' }}>
                
                {/* Controls */}
                <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', gap: 24 }}>
                    
                    {/* Brand Details */}
                    <div className="card" style={{ padding: 'clamp(20px, 4vw, 32px)', borderRadius: 'var(--radius-subtle)' }}>
                        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 24, textTransform: 'uppercase', letterSpacing: '0.05em' }}><AlignLeft size={16}/> Brand Details</h3>
                        <div style={{ marginBottom: 16 }}>
                            <label className="mono" style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Brand Name</label>
                            <input className="input" type="text" placeholder={user?.tenant?.name || 'Company Name'} value={branding.brandName || ''} onChange={e => setBranding({ ...branding, brandName: e.target.value })} style={{ width: '100%' }} />
                        </div>
                        <div>
                            <label className="mono" style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tagline / Description</label>
                            <textarea className="input" placeholder="Your brand's mission statement" value={branding.brandDescription || ''} onChange={e => setBranding({ ...branding, brandDescription: e.target.value })} style={{ width: '100%', minHeight: 60, fontFamily: 'Inter', fontSize: 13 }} />
                        </div>
                    </div>

                    {/* Custom Color Palette (:root CSS / Hex Input) */}
                    <div className="card" style={{ padding: 'clamp(20px, 4vw, 32px)', borderRadius: 'var(--radius-subtle)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
                            <h3 style={{ fontSize: 16, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                                <Code size={16}/> Custom Color Palette (:root CSS)
                            </h3>
                            <button 
                                type="button" 
                                className="btn btn-ghost btn-sm mono" 
                                style={{ fontSize: 10, padding: '4px 8px', textTransform: 'uppercase' }}
                                onClick={() => setBranding({
                                    ...branding,
                                    userProvidedColorPallete: `:root {\n  --color-1: #6C63FF;\n  --color-2: #7D6AFF;\n  --color-3: #9C87FF;\n  --color-4: #B8A9FF;\n  --color-5: #D4CBFF;\n}`
                                })}
                            >
                                <Sparkles size={12}/> Load Example
                            </button>
                        </div>
                        <p className="mono" style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 16, textTransform: 'uppercase', lineHeight: 1.5 }}>
                            Paste a CSS <code>:root</code> block with hex codes. The AI will design your website using these exact color variables.
                        </p>

                        <textarea 
                            className="input mono" 
                            placeholder={`:root {\n  --color-1: #6C63FF;\n  --color-2: #7D6AFF;\n  --color-3: #9C87FF;\n  --color-4: #B8A9FF;\n  --color-5: #D4CBFF;\n}`}
                            value={branding.userProvidedColorPallete || ''} 
                            onChange={e => setBranding({ ...branding, userProvidedColorPallete: e.target.value })} 
                            style={{ width: '100%', minHeight: 120, fontSize: 12, lineHeight: 1.5, background: 'var(--bg-primary)', padding: 12, resize: 'vertical' }} 
                        />

                        {/* Live Parsed Palette Grid */}
                        <div style={{ marginTop: 16 }}>
                            <div className="mono" style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>
                                Parsed Color Palette ({parsedPalette.length} {parsedPalette.length === 1 ? 'color' : 'colors'})
                            </div>
                            {parsedPalette.length > 0 ? (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 10 }}>
                                    {parsedPalette.map((col, idx) => (
                                        <div 
                                            key={idx}
                                            onClick={() => copyToClipboard(col.hex)}
                                            style={{
                                                background: 'var(--bg-primary)',
                                                border: '1px solid var(--border-color)',
                                                borderRadius: 'var(--radius-hard)',
                                                padding: 8,
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 8,
                                                cursor: 'pointer',
                                                transition: 'transform 0.15s ease, border-color 0.15s ease',
                                            }}
                                            title="Click to copy hex"
                                            onMouseEnter={e => e.currentTarget.style.borderColor = col.hex}
                                            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-color)'}
                                        >
                                            <div style={{
                                                width: 28,
                                                height: 28,
                                                borderRadius: 6,
                                                background: col.hex,
                                                border: '1px solid rgba(255,255,255,0.15)',
                                                flexShrink: 0
                                            }} />
                                            <div style={{ overflow: 'hidden', flex: 1 }}>
                                                <div className="mono" style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-high)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                                                    {col.varName}
                                                </div>
                                                <div className="mono" style={{ fontSize: 10, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                                                    {col.hex}
                                                    {copiedHex === col.hex ? <Check size={10} color="#10b981" /> : <Copy size={10} style={{ opacity: 0.5 }} />}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="mono" style={{ padding: 16, background: 'var(--bg-primary)', border: '1px dashed var(--border-color)', borderRadius: 'var(--radius-hard)', fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', textTransform: 'uppercase' }}>
                                    No colors detected yet. Paste :root CSS or hex codes above.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Standard Color Pickers */}
                    <div className="card" style={{ padding: 'clamp(20px, 4vw, 32px)', borderRadius: 'var(--radius-subtle)' }}>
                        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 24, textTransform: 'uppercase', letterSpacing: '0.05em' }}><Palette size={16}/> Standard Colors</h3>
                        {COLOR_CONFIG.map(({ key, label, defaultHex }) => {
                            const currentHex = normalizeHex(branding[key]) || defaultHex;
                            return (
                                <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
                                    <span className="mono" style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                        <input type="color" value={currentHex} onChange={e => setBranding({ ...branding, [key]: e.target.value })} style={{ width: 32, height: 32, border: '1px solid var(--border-color)', borderRadius: 'var(--radius-hard)', cursor: 'pointer', padding: 0, background: 'none' }} />
                                        <code className="mono" style={{ fontSize: 11, color: 'var(--text-high)', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', padding: '4px 8px', borderRadius: 'var(--radius-hard)', textTransform: 'uppercase' }}>{currentHex}</code>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Services */}
                    <div className="card" style={{ padding: 'clamp(20px, 4vw, 32px)', borderRadius: 'var(--radius-subtle)' }}>
                        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 24, textTransform: 'uppercase', letterSpacing: '0.05em' }}><Briefcase size={16}/> Services</h3>
                        <div style={{ marginBottom: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
                            <input className="input" type="text" placeholder="Service name" value={serviceForm.name} onChange={e => setServiceForm({ ...serviceForm, name: e.target.value })} style={{ width: '100%' }} />
                            <textarea className="input" placeholder="Description" value={serviceForm.description} onChange={e => setServiceForm({ ...serviceForm, description: e.target.value })} style={{ width: '100%', minHeight: 60, fontFamily: `'${bodyFont}', sans-serif`, fontSize: 13 }} />
                            <input className="input" type="number" placeholder="Price (₹)" value={serviceForm.price} onChange={e => setServiceForm({ ...serviceForm, price: e.target.value })} style={{ width: '100%' }} />
                            <button className="btn btn-primary mono" onClick={handleAddService} style={{ textTransform: 'uppercase', letterSpacing: '0.05em', padding: '10px', fontSize: 12 }}>
                                + Add Service
                            </button>
                        </div>
                        {branding.services?.length > 0 && (
                            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: 16 }}>
                                {branding.services.map((service, idx) => (
                                    <div key={idx} style={{ marginBottom: 12, padding: 12, background: 'var(--bg-primary)', borderRadius: 'var(--radius-hard)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <div style={{ flex: 1, paddingRight: 12 }}>
                                            <div style={{ fontWeight: 700, fontSize: 12, color: 'var(--text-high)', marginBottom: 4, fontFamily: `'${headingFont}', sans-serif` }}>{service.name}</div>
                                            {service.description && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4, fontFamily: `'${bodyFont}', sans-serif` }}>{service.description}</div>}
                                            <div className="mono" style={{ fontSize: 11, color: 'var(--text-muted)' }}>{formatINR(service.price || 0)}</div>
                                        </div>
                                        <button onClick={() => handleRemoveService(idx)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 4, flexShrink: 0 }}>
                                            <X size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Typography */}
                    <div className="card" style={{ padding: 'clamp(20px, 4vw, 32px)', borderRadius: 'var(--radius-subtle)' }}>
                        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 24, textTransform: 'uppercase', letterSpacing: '0.05em' }}><Type size={16}/> Typography</h3>
                        <div style={{ marginBottom: 24 }}>
                            <label className="mono" style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Heading Font</label>
                            <select className="input" value={branding.fontHeading || 'Outfit'} onChange={e => setBranding({ ...branding, fontHeading: e.target.value, headingFont: e.target.value })} style={{ width: '100%', fontFamily: `'${headingFont}', sans-serif` }}>
                                {FONTS.map(f => <option key={f} value={f} style={{ fontFamily: `'${f}', sans-serif` }}>{f}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="mono" style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Body Font</label>
                            <select className="input" value={branding.fontBody || 'Inter'} onChange={e => setBranding({ ...branding, fontBody: e.target.value, bodyFont: e.target.value })} style={{ width: '100%', fontFamily: `'${bodyFont}', sans-serif` }}>
                                {FONTS.map(f => <option key={f} value={f} style={{ fontFamily: `'${f}', sans-serif` }}>{f}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Logo */}
                    <div className="card" style={{ padding: 'clamp(20px, 4vw, 32px)', borderRadius: 'var(--radius-subtle)' }}>
                        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 24, textTransform: 'uppercase', letterSpacing: '0.05em' }}><Image size={16}/> Logo</h3>
                        <input ref={logoInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleLogoUpload} />
                        {branding.logo && (
                            <div style={{ marginBottom: 16, padding: 16, border: '1px solid var(--border-color)', borderRadius: 'var(--radius-hard)', textAlign: 'center' }}>
                                <img src={branding.logo} alt="Logo" style={{ maxHeight: 64, maxWidth: '100%', objectFit: 'contain' }} />
                            </div>
                        )}
                        <div
                            onClick={() => logoInputRef.current?.click()}
                            style={{ border: '1px dashed var(--border-color)', borderRadius: 'var(--radius-hard)', padding: 'clamp(20px, 5vw, 40px)', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s' }}
                            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--text-muted)'}
                            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-color)'}
                        >
                            <div style={{ fontSize: 32, marginBottom: 16 }}>{uploading ? <span className="spinner" style={{ width: 32, height: 32 }} /> : <UploadCloud size={32} />}</div>
                            <p className="mono" style={{ fontSize: 12, color: 'var(--text-high)', marginBottom: 8, textTransform: 'uppercase' }}>{uploading ? 'Uploading...' : branding.logo ? 'Click to replace logo' : 'Click to upload logo'}</p>
                            <p className="mono" style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase' }}>PNG, SVG or JPG (max 5MB)</p>
                        </div>
                    </div>

                    <button className="btn btn-primary mono" onClick={handleSave} disabled={saving} style={{ textTransform: 'uppercase', letterSpacing: '0.05em', padding: '16px' }}>
                        {saving ? 'Saving...' : <> <Save size={16}/> Save Branding</>}
                    </button>
                </div>

                {/* Live Preview - Fluid responsive card */}
                <div className="card" style={{ flex: '1.2 1 320px', position: 'sticky', top: 24, padding: 0, overflow: 'hidden', borderRadius: 'var(--radius-subtle)', display: 'flex', flexDirection: 'column', minHeight: 'min(600px, 80vh)' }}>
                    <div className="mono" style={{ padding: '16px clamp(16px, 3vw, 24px)', borderBottom: '1px solid var(--border-color)', fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', background: 'var(--bg-primary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>Live Preview</span>
                        {parsedPalette.length > 0 && (
                            <span style={{ fontSize: 10, color: pPrimaryColor, fontWeight: 700 }}>
                                Custom Palette Active ({parsedPalette.length} tokens)
                            </span>
                        )}
                    </div>
                    
                    <div style={{ background: pBgColor, flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                        
                        {/* Preview Header */}
                        <div style={{ padding: 'clamp(16px, 3vw, 24px) clamp(16px, 3vw, 32px)', borderBottom: `1px solid ${hexToRgba(pPrimaryColor, 0.2)}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                {branding.logo && <img src={branding.logo} alt="Logo" style={{ maxHeight: 32, maxWidth: 100, objectFit: 'contain' }} />}
                                {!branding.logo && (
                                    <div style={{ fontFamily: `'${headingFont}', sans-serif`, fontWeight: 800, fontSize: 'clamp(18px, 4vw, 24px)', color: pPrimaryColor, textTransform: 'uppercase', letterSpacing: '-0.03em' }}>
                                        {brandName}
                                    </div>
                                )}
                            </div>
                            <div style={{ display: 'flex', gap: 'clamp(12px, 2vw, 24px)', flexWrap: 'wrap', fontFamily: `'${bodyFont}', sans-serif`, fontSize: 12, color: pTextColor, textTransform: 'uppercase' }}>
                                <span style={{ cursor: 'pointer', opacity: 0.8 }}>Home</span>
                                <span style={{ cursor: 'pointer', opacity: 0.8 }}>Services</span>
                                <span style={{ cursor: 'pointer', opacity: 0.8 }}>Contact</span>
                            </div>
                        </div>

                        {/* Custom Palette Strip in Preview */}
                        {parsedPalette.length > 0 && (
                            <div style={{ display: 'flex', height: 4, width: '100%' }}>
                                {parsedPalette.map((col, idx) => (
                                    <div key={idx} style={{ flex: 1, background: col.hex }} title={`${col.varName}: ${col.hex}`} />
                                ))}
                            </div>
                        )}

                        {/* Preview Hero */}
                        <div style={{ padding: 'clamp(32px, 6vw, 60px) clamp(16px, 4vw, 40px)', textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', overflow: 'auto' }}>
                            <h1 style={{ fontFamily: `'${headingFont}', sans-serif`, fontSize: 'clamp(28px, 6vw, 42px)', fontWeight: 800, marginBottom: 16, color: pTextColor, letterSpacing: '-0.03em', textTransform: 'uppercase' }}>
                                Welcome to {brandName}
                            </h1>
                            <p style={{ fontFamily: `'${bodyFont}', sans-serif`, color: hexToRgba(pTextColor, 0.75) || pTextColor, fontSize: 'clamp(13px, 2vw, 15px)', marginBottom: 'clamp(24px, 5vw, 40px)', textTransform: 'none', maxWidth: 500, lineHeight: 1.6 }}>
                                {brandDescription}
                            </p>
                            <span style={{ background: pPrimaryColor, color: isLightHex(pPrimaryColor) ? '#111827' : '#ffffff', padding: '14px 32px', borderRadius: 'var(--radius-hard)', fontWeight: 700, fontSize: 13, fontFamily: `'${bodyFont}', sans-serif`, textTransform: 'uppercase', letterSpacing: '0.05em', cursor: 'pointer', transition: 'opacity 0.2s', opacity: 0.9 }}>
                                Get Started
                            </span>
                        </div>

                        {/* Preview Services */}
                        <div style={{ padding: 'clamp(24px, 4vw, 40px) clamp(16px, 4vw, 32px)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 20 }}>
                            {previewServices.slice(0, 3).map((service, i) => {
                                const cardColor = parsedPalette.length > (i + 1) ? parsedPalette[i + 1].hex : pPrimaryColor;
                                return (
                                    <div key={i} style={{ border: `1px solid ${hexToRgba(cardColor, 0.3)}`, borderRadius: 'var(--radius-hard)', padding: 'clamp(16px, 3vw, 24px)', textAlign: 'center', background: hexToRgba(cardColor, 0.05) }}>
                                        <div className="mono" style={{ width: 40, height: 40, borderRadius: 'var(--radius-hard)', border: `2px solid ${cardColor}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: cardColor, fontWeight: 700, fontSize: 16 }}>
                                            {i + 1}
                                        </div>
                                        <div style={{ fontFamily: `'${headingFont}', sans-serif`, fontWeight: 700, fontSize: 15, marginBottom: 8, color: pTextColor, textTransform: 'uppercase' }}>
                                            {service.name}
                                        </div>
                                        <div style={{ fontFamily: `'${bodyFont}', sans-serif`, fontSize: 12, color: hexToRgba(pTextColor, 0.65) || pTextColor, textTransform: 'none', marginBottom: 8, lineHeight: 1.5 }}>
                                            {service.description || 'Service details'}
                                        </div>
                                        {service.price > 0 && (
                                            <div className="mono" style={{ fontSize: 12, fontWeight: 700, color: cardColor }}>
                                                ${service.price}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Preview Footer */}
                        <div style={{ padding: '24px 32px', borderTop: `1px solid ${hexToRgba(pPrimaryColor, 0.2)}`, textAlign: 'center', fontFamily: `'${bodyFont}', sans-serif`, fontSize: 11, color: hexToRgba(pTextColor, 0.6) || pTextColor }}>
                            © 2026 {brandName}. All rights reserved.
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}