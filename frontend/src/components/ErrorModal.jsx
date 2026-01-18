import React from 'react';

export const ErrorModal = ({ message, onClose }) => {
    if (!message) return null;

    // Parse error message if it's JSON
    let displayMessage = message;
    try {
        const parsed = JSON.parse(message);
        if (parsed.detail) {
            displayMessage = parsed.detail;
        }
    } catch {
        // Not JSON, use as is
    }

    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.6)',
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'center',
                paddingTop: '80px',
                zIndex: 10000
            }}
            onClick={onClose}
        >
            <div
                style={{
                    backgroundColor: '#1e293b',
                    borderRadius: '16px',
                    border: '2px solid #ef4444',
                    padding: '32px',
                    minWidth: '400px',
                    maxWidth: '600px',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header with icon */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                    {/* Error Icon SVG */}
                    <svg
                        width="48"
                        height="48"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#ef4444"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>

                    <h2 style={{
                        fontSize: '28px',
                        fontWeight: 'bold',
                        color: '#f1f5f9',
                        margin: 0
                    }}>
                        Thông báo
                    </h2>
                </div>

                {/* Error content */}
                <div style={{ marginBottom: '24px' }}>
                    <p style={{
                        fontSize: '18px',
                        color: '#cbd5e1',
                        margin: 0,
                        lineHeight: '1.6'
                    }}>
                        <span style={{ color: '#ef4444', fontWeight: 'bold' }}>Lỗi:</span> {displayMessage}
                    </p>
                </div>

                {/* OK button */}
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                        onClick={onClose}
                        style={{
                            backgroundColor: '#ef4444',
                            color: '#fff',
                            fontWeight: 'bold',
                            fontSize: '16px',
                            padding: '10px 32px',
                            borderRadius: '8px',
                            border: 'none',
                            cursor: 'pointer',
                            transition: 'background-color 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ef4444'}
                    >
                        OK
                    </button>
                </div>
            </div>
        </div>
    );
};
