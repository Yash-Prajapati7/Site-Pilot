import { useState, useEffect, useRef } from 'react';
import { modifyWebsite } from '../services/api';
import toast from 'react-hot-toast';

function slugify(text) {
    if (!text) return '';
    return text
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
}

export default function RenameWebsiteModal({ isOpen, website, onClose, onSuccess }) {
    const [name, setName] = useState('');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const inputRef = useRef(null);

    useEffect(() => {
        if (isOpen && website) {
            setName(website.name || '');
            setError('');
            setTimeout(() => inputRef.current?.focus(), 50);
        }
    }, [isOpen, website]);

    useEffect(() => {
        function handleKeyDown(e) {
            if (e.key === 'Escape' && isOpen && !saving) {
                onClose();
            }
        }
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, saving, onClose]);

    if (!isOpen || !website) return null;

    const currentSlug = slugify(name) || 'website';

    async function handleSubmit(e) {
        e.preventDefault();
        const trimmed = name.trim();
        if (!trimmed) {
            setError('Website name cannot be empty');
            return;
        }

        if (trimmed === website.name) {
            onClose();
            return;
        }

        setSaving(true);
        setError('');

        try {
            const result = await modifyWebsite(website.id, { name: trimmed });
            if (result.ok && result.website) {
                toast.success('Website renamed successfully');
                if (onSuccess) onSuccess(result.website);
                onClose();
            } else {
                setError(result.error || 'Failed to rename website');
            }
        } catch (err) {
            setError(err.message || 'An unexpected error occurred');
        } finally {
            setSaving(false);
        }
    }

    return (
        <div
            style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0,0,0,0.8)',
                backdropFilter: 'blur(4px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 100,
            }}
            onClick={() => !saving && onClose()}
        >
            <div
                className="card"
                style={{
                    width: '100%',
                    maxWidth: 440,
                    padding: 32,
                    borderRadius: 'var(--radius-subtle)',
                    animation: 'slideUp 0.3s ease',
                }}
                onClick={e => e.stopPropagation()}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                    <h3 style={{ fontSize: 18, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Rename Website
                    </h3>
                    <button
                        style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--text-muted)',
                            cursor: 'pointer',
                            fontSize: 16,
                        }}
                        disabled={saving}
                        onClick={onClose}
                    >
                        ✕
                    </button>
                </div>

                {error && (
                    <div
                        className="mono"
                        style={{
                            background: 'var(--bg-primary)',
                            border: '1px solid var(--error)',
                            padding: 12,
                            marginBottom: 20,
                            color: 'var(--error)',
                            fontSize: 11,
                            textTransform: 'uppercase',
                        }}
                    >
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: 20 }}>
                        <label
                            className="mono"
                            style={{
                                display: 'block',
                                fontSize: 11,
                                fontWeight: 600,
                                color: 'var(--text-muted)',
                                marginBottom: 8,
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                            }}
                        >
                            Website Name
                        </label>
                        <input
                            ref={inputRef}
                            className="input"
                            value={name}
                            onChange={e => {
                                setName(e.target.value);
                                if (error) setError('');
                            }}
                            placeholder="Enter new website name"
                            required
                            disabled={saving}
                            style={{ width: '100%' }}
                        />
                    </div>

                    <div style={{ marginBottom: 28 }}>
                        <span className="mono" style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4, textTransform: 'uppercase' }}>
                            Updated URL:
                        </span>
                        <span className="mono" style={{ fontSize: 12, color: 'var(--text-high)', wordBreak: 'break-all' }}>
                            {currentSlug}.sitepilot.app
                        </span>
                    </div>

                    <div style={{ display: 'flex', gap: 16 }}>
                        <button
                            type="button"
                            className="btn btn-ghost mono"
                            style={{ flex: 1, textTransform: 'uppercase' }}
                            disabled={saving}
                            onClick={onClose}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary mono"
                            disabled={saving || !name.trim()}
                            style={{ flex: 1, textTransform: 'uppercase' }}
                        >
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
