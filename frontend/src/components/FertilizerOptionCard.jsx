import React, { useState } from 'react';

const FertilizerOptionCard = ({ option, idx, isExpanded, onToggle }) => {
    return (
        <div
            className="glass-card"
            style={{
                padding: '1rem',
                border: idx === 0 ? '3px solid #ff9800' : '1px solid rgba(0,0,0,0.1)',
                position: 'relative',
                cursor: 'pointer',
                transition: 'all 0.2s',
                marginBottom: '0.8rem'
            }}
            onClick={onToggle}
        >
            {/* Compact Header - Always Visible */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                {/* Rank Badge */}
                <div style={{
                    padding: '0.4rem 0.7rem',
                    background: idx === 0 ? 'linear-gradient(135deg, #ffd700 0%, #ffb300 100%)' :
                        idx === 1 ? 'linear-gradient(135deg, #c0c0c0 0%, #9e9e9e 100%)' :
                            idx === 2 ? 'linear-gradient(135deg, #cd7f32 0%, #a0522d 100%)' :
                                'linear-gradient(135deg, #9e9e9e 0%, #757575 100%)',
                    borderRadius: '12px',
                    fontSize: '0.65rem',
                    fontWeight: '800',
                    color: 'white',
                    minWidth: '35px',
                    textAlign: 'center'
                }}>
                    {idx === 0 ? '🏆' : `#${idx + 1}`}
                </div>

                {/* Name & Summary */}
                <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: '800', color: '#ff9800' }}>
                        {option.name}
                    </p>
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '0.3rem', fontSize: '0.7rem' }}>
                        <span style={{
                            fontWeight: '700',
                            color: option.score >= 90 ? '#4caf50' : option.score >= 70 ? '#ff9800' : '#f44336'
                        }}>
                            Score: {option.score}
                        </span>
                        <span style={{ fontWeight: '700', color: '#2196f3' }}>
                            Rp {(option.total_cost / 1000).toFixed(0)}k
                        </span>
                    </div>
                </div>

                {/* Expand Icon */}
                <div style={{
                    fontSize: '1.2rem',
                    color: '#999',
                    transition: 'transform 0.2s',
                    transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)'
                }}>
                    ▼
                </div>
            </div>

            {/* Expanded Details */}
            {isExpanded && (
                <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(0,0,0,0.1)' }} onClick={(e) => e.stopPropagation()}>
                    {/* Compatibility Warning */}
                    {!option.compatible && (
                        <div style={{
                            padding: '0.6rem',
                            background: 'rgba(244,67,54,0.1)',
                            borderRadius: '8px',
                            marginBottom: '0.8rem',
                            border: '1px solid rgba(244,67,54,0.3)'
                        }}>
                            <p style={{ margin: 0, fontSize: '0.7rem', color: '#f44336', fontWeight: '700' }}>
                                {option.compatibility_note}
                            </p>
                        </div>
                    )}

                    {/* Fertilizers */}
                    <div style={{ marginBottom: '0.8rem' }}>
                        <p style={{ margin: '0 0 0.4rem 0', fontSize: '0.7rem', fontWeight: '700', color: 'var(--color-text)' }}>
                            Komposisi:
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                            {Object.entries(option.fertilizers).map(([fert, amount]) => (
                                <div key={fert} style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    padding: '0.4rem 0.6rem',
                                    background: 'white',
                                    borderRadius: '6px',
                                    fontSize: '0.75rem'
                                }}>
                                    <span style={{ fontWeight: '700', textTransform: 'uppercase' }}>
                                        {fert.replace('_', ' ')}
                                    </span>
                                    <span style={{ fontWeight: '800', color: '#ff9800' }}>
                                        {amount} kg
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Nutrients Supplied - Compact */}
                    <div style={{ marginBottom: '0.8rem' }}>
                        <p style={{ margin: '0 0 0.4rem 0', fontSize: '0.7rem', fontWeight: '700', color: 'var(--color-text)' }}>
                            Hara Disuplai:
                        </p>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.4rem', fontSize: '0.65rem', textAlign: 'center' }}>
                            {['N', 'P2O5', 'K2O'].map(nutrient => (
                                <div key={nutrient} style={{ padding: '0.4rem', background: 'rgba(76,175,80,0.05)', borderRadius: '6px' }}>
                                    <p style={{ margin: 0, fontWeight: '600', color: 'var(--color-text-light)' }}>{nutrient}</p>
                                    <p style={{ margin: '0.1rem 0 0 0', fontWeight: '800', color: '#4caf50', fontSize: '0.7rem' }}>
                                        {option.nutrient_supplied[nutrient]} kg
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Warnings */}
                    {option.warnings && option.warnings.length > 0 && (
                        <div style={{
                            padding: '0.6rem',
                            background: 'rgba(255,152,0,0.05)',
                            borderRadius: '6px',
                            border: '1px solid rgba(255,152,0,0.2)'
                        }}>
                            <p style={{ margin: '0 0 0.3rem 0', fontSize: '0.7rem', fontWeight: '700', color: '#ff9800' }}>
                                ⚠️ Peringatan:
                            </p>
                            {option.warnings.map((warning, wIdx) => (
                                <p key={wIdx} style={{ margin: '0.2rem 0', fontSize: '0.65rem', color: 'var(--color-text)' }}>
                                    • {warning}
                                </p>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default FertilizerOptionCard;
