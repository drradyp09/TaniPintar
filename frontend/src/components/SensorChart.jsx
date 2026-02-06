import React, { useState, useEffect } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import { AUTH_BASE_URL } from '../apiConfig';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

const SensorChart = ({ sensor }) => {
    const [chartData, setChartData] = useState({
        timestamps: [],
        datasets: {}
    });
    const [chartType, setChartType] = useState('line'); // 'line', 'bar', 'area'

    const [axisAssignments, setAxisAssignments] = useState({});
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const lastIdRef = React.useRef(null);

    if (!sensor) return null;

    const sensorConfig = sensor.sensor_config || {};
    // Default to temp, humidity, ph if no config (backward compatibility)
    const activeSensors = Object.keys(sensorConfig).length > 0
        ? Object.keys(sensorConfig)
        : ['temperature', 'humidity', 'soil_ph'];

    // Helper for labels and colors
    const getSensorDetails = (key) => {
        const details = {
            temperature: { label: 'Suhu (°C)', color: 'rgb(255, 99, 132)' },
            humidity: { label: 'Kelembaban (%)', color: 'rgb(54, 162, 235)' },
            soil_ph: { label: 'pH Tanah', color: 'rgb(153, 102, 255)' },
            soil_moisture: { label: 'Kelembaban Tanah (%)', color: 'rgb(75, 192, 192)' },
            light_intensity: { label: 'Intensitas Cahaya (lux)', color: 'rgb(255, 205, 86)' },
            rainfall: { label: 'Curah Hujan (mm)', color: 'rgb(54, 162, 235)' },
            wind_speed: { label: 'Kecepatan Angin (m/s)', color: 'rgb(201, 203, 207)' },
            pressure: { label: 'Tekanan Udara (hPa)', color: 'rgb(255, 159, 64)' }
        };
        return details[key] || { label: key, color: 'rgb(100, 100, 100)' };
    };

    // Fetch real data from API
    const fetchChartData = async (isManual = false) => {
        try {
            let url = `${AUTH_BASE_URL}/sensors/${sensor.id}/history`;
            const params = new URLSearchParams();
            if (startDate) params.append('start_date', startDate);
            if (endDate) params.append('end_date', endDate);

            if (params.toString()) {
                url += `?${params.toString()}`;
            }

            const response = await fetch(url, {
                credentials: 'include'
            });

            if (response.status === 401) {
                localStorage.removeItem('user');
                window.location.href = '/login';
                return;
            }

            if (response.ok) {
                const data = await response.json();

                if (data.length > 0) {
                    const newTimestamps = data.map(item => {
                        return (startDate || endDate)
                            ? new Date(item.full_timestamp).toLocaleString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
                            : item.timestamp;
                    });
                    const newDatasets = {};

                    activeSensors.forEach(key => {
                        newDatasets[key] = data.map(item => item[key]);
                    });

                    setChartData({
                        timestamps: newTimestamps,
                        datasets: newDatasets
                    });
                } else if (isManual) {
                    setChartData({ timestamps: [], datasets: {} });
                }
            }
        } catch (err) {
            console.error('Failed to fetch chart data:', err);
        }
    };

    useEffect(() => {
        // Reset and init ONLY when sensor ID changes
        if (lastIdRef.current !== sensor.id) {
            setChartData({ timestamps: [], datasets: {} });
            setStartDate('');
            setEndDate('');

            // Initialize default assignments: All active sensors on Left by default
            const initialAssignments = {};
            activeSensors.forEach(key => {
                initialAssignments[key] = 'left';
            });
            setAxisAssignments(initialAssignments);

            // Initial fetch
            fetchChartData();
        }

        lastIdRef.current = sensor.id;

        // Poll for new data every 5 seconds ONLY if no date filter is active (Real-time mode)
        if (!startDate && !endDate) {
            const interval = setInterval(fetchChartData, 5000);
            return () => clearInterval(interval);
        }
    }, [sensor.id, JSON.stringify(activeSensors), startDate, endDate]);

    const toggleSensorAxis = (key) => {
        setAxisAssignments(prev => {
            const currentAxis = prev[key];
            const newAssignments = { ...prev };

            // Cycle: undefined/null -> 'left' -> 'right' -> undefined/null
            if (!currentAxis) {
                newAssignments[key] = 'left';
            } else if (currentAxis === 'left') {
                newAssignments[key] = 'right';
            } else {
                delete newAssignments[key];
            }
            return newAssignments;
        });
    };

    const getChartOptions = () => {
        const hasRightAxis = Object.values(axisAssignments).includes('right');

        return {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false,
            },
            plugins: {
                legend: { display: true, position: 'top', labels: { font: { family: 'Inter' } } },
                tooltip: { backgroundColor: 'rgba(0,0,0,0.8)' }
            },
            scales: {
                x: {
                    display: true,
                    grid: { display: false },
                    ticks: { maxRotation: 45, minRotation: 45 }
                },
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    grid: { color: 'rgba(0,0,0,0.05)' },
                    title: { display: true, text: 'Sumbu Kiri (L)' }
                },
                y1: {
                    type: 'linear',
                    display: hasRightAxis, // Only show if assigned
                    position: 'right',
                    grid: {
                        drawOnChartArea: false, // Prevent grid lines from overlapping
                    },
                    title: { display: hasRightAxis, text: 'Sumbu Kanan (R)' }
                }
            },
            elements: {
                line: { tension: 0.4, borderWidth: 2, fill: chartType === 'area' },
                point: { radius: 3, hitRadius: 10, hoverRadius: 5 },
                bar: { borderRadius: 4 }
            }
        };
    };

    // Create combined data object
    const getCombinedData = () => {
        // Filter datasets based on assignment
        const datasets = activeSensors
            .filter(key => axisAssignments[key]) // Only include assigned sensors
            .map(key => {
                const details = getSensorDetails(key);
                const axis = axisAssignments[key]; // 'left' or 'right'
                const yAxisID = axis === 'right' ? 'y1' : 'y';
                const isBar = chartType === 'bar';

                return {
                    label: `${details.label} [${axis === 'right' ? 'R' : 'L'}]`,
                    data: chartData.datasets[key] || [],
                    borderColor: details.color,
                    backgroundColor: isBar
                        ? details.color.replace('rgb', 'rgba').replace(')', ', 0.6)')
                        : details.color.replace('rgb', 'rgba').replace(')', ', 0.1)'),
                    fill: chartType === 'area',
                    borderWidth: isBar ? 0 : 2,
                    yAxisID: yAxisID   // Assign to specific axis
                };
            });

        return {
            labels: chartData.timestamps,
            datasets: datasets
        };
    };

    const hasActiveSensors = Object.keys(axisAssignments).length > 0;

    return (
        <div className="animate-fade-in" style={{ marginTop: '2rem' }}>
            <div className="glass-card" style={{
                padding: '1.8rem',
                marginBottom: '1.5rem',
                border: '1px solid var(--color-primary-glow)',
                background: 'rgba(255, 255, 255, 0.7)'
            }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '1.5rem',
                    flexWrap: 'wrap',
                    gap: '1.2rem'
                }}>
                    <h3 style={{
                        fontSize: '1.25rem',
                        fontWeight: '800',
                        color: 'var(--color-text)',
                        margin: 0,
                        letterSpacing: '-0.3px'
                    }}>
                        {(!startDate && !endDate) ? '📊 Analisis Real-Time' : '📅 Histori Data'}
                    </h3>

                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                        {/* Date Filters */}
                        <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', flexWrap: 'wrap' }}>
                            <input
                                type="datetime-local"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                style={{
                                    fontSize: '0.85rem',
                                    padding: '0.5rem',
                                    borderRadius: '8px',
                                    border: '1px solid var(--color-primary-glow)',
                                    background: 'var(--color-white)',
                                    fontWeight: '600',
                                    color: 'var(--color-text)'
                                }}
                            />
                            <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--color-text-light)' }}>-</span>
                            <input
                                type="datetime-local"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                style={{
                                    fontSize: '0.85rem',
                                    padding: '0.5rem',
                                    borderRadius: '8px',
                                    border: '1px solid var(--color-primary-glow)',
                                    background: 'var(--color-white)',
                                    fontWeight: '600',
                                    color: 'var(--color-text)'
                                }}
                            />
                            {(startDate || endDate) && (
                                <button
                                    onClick={() => { setStartDate(''); setEndDate(''); }}
                                    className="scale-hover"
                                    style={{
                                        background: 'rgba(226, 232, 240, 0.5)',
                                        border: '1px solid var(--color-primary-glow)',
                                        borderRadius: '8px',
                                        padding: '0.5rem 1rem',
                                        fontSize: '0.8rem',
                                        cursor: 'pointer',
                                        fontWeight: '700',
                                        color: 'var(--color-text)'
                                    }}
                                >
                                    RESET
                                </button>
                            )}
                        </div>

                        {/* Chart Type Selector */}
                        <select
                            value={chartType}
                            onChange={(e) => setChartType(e.target.value)}
                            style={{
                                padding: '0.5rem 1rem',
                                borderRadius: '8px',
                                border: '1px solid var(--color-primary-glow)',
                                fontSize: '0.85rem',
                                background: 'var(--color-white)',
                                cursor: 'pointer',
                                fontWeight: '700',
                                color: 'var(--color-text)',
                                boxShadow: 'var(--shadow-soft)'
                            }}
                        >
                            <option value="line">📈 GARIS</option>
                            <option value="area">🏔️ AREA</option>
                            <option value="bar">📊 BATANG</option>
                        </select>

                        {(!startDate && !endDate) && (
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.6rem',
                                fontSize: '0.85rem',
                                color: 'var(--color-primary)',
                                fontWeight: '800',
                                background: 'rgba(76, 175, 80, 0.1)',
                                padding: '4px 12px',
                                borderRadius: '20px',
                                border: '1px solid var(--color-primary-glow)'
                            }}>
                                <div className="animate-pulse-glow" style={{
                                    width: '10px',
                                    height: '10px',
                                    borderRadius: '50%',
                                    background: 'var(--color-primary)'
                                }}></div>
                                LIVE
                            </div>
                        )}
                    </div>
                </div>

                {/* Sensor Filter Chips */}
                <div style={{
                    display: 'flex',
                    gap: '0.6rem',
                    flexWrap: 'wrap',
                    marginBottom: '2rem',
                    padding: '1.2rem',
                    background: 'rgba(248, 250, 252, 0.6)',
                    borderRadius: '12px',
                    border: '1px solid rgba(0,0,0,0.03)'
                }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--color-text)', fontWeight: '800', display: 'flex', alignItems: 'center', marginRight: '0.5rem', width: '100%', marginBottom: '0.5rem' }}>
                        KONFIGURASI SUMBU (LETAK)
                    </span>
                    {activeSensors.map(key => {
                        const info = getSensorDetails(key);
                        const axis = axisAssignments[key]; // 'left', 'right', or undefined
                        return (
                            <button
                                key={key}
                                onClick={() => toggleSensorAxis(key)}
                                className="scale-hover"
                                style={{
                                    padding: '0.5rem 1rem',
                                    borderRadius: '20px',
                                    border: axis ? `2px solid ${info.color}` : '1px solid var(--color-primary-glow)',
                                    background: axis ? info.color.replace('rgb', 'rgba').replace(')', ', 0.1)') : 'var(--color-white)',
                                    color: axis ? info.color : 'var(--color-text-light)',
                                    fontSize: '0.8rem',
                                    fontWeight: '700',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.6rem',
                                    boxShadow: axis ? '0 4px 6px rgba(0,0,0,0.05)' : 'none'
                                }}
                            >
                                <span style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: '20px',
                                    height: '20px',
                                    borderRadius: '50%',
                                    background: axis ? info.color : 'rgba(226, 232, 240, 0.8)',
                                    color: axis ? 'var(--color-white)' : 'var(--color-text-light)',
                                    fontSize: '0.7rem',
                                    fontWeight: '900'
                                }}>
                                    {axis === 'left' ? 'L' : axis === 'right' ? 'R' : '•'}
                                </span>
                                {info.label.split('(')[0].trim()}
                            </button>
                        );
                    })}
                </div>

                {!hasActiveSensors ? (
                    <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-light)', fontStyle: 'italic', background: 'rgba(0,0,0,0.02)', borderRadius: '12px', fontWeight: '500' }}>
                        Pilih minimal satu sensor di atas untuk memvisualisasikan data
                    </div>
                ) : (
                    <div style={{ marginBottom: '1.5rem', minHeight: '350px' }}>
                        <div style={{ height: '350px' }}>
                            {chartType === 'bar'
                                ? <Bar data={getCombinedData()} options={getChartOptions()} />
                                : <Line data={getCombinedData()} options={getChartOptions()} />
                            }
                        </div>
                    </div>
                )}

                <div style={{
                    marginTop: '1.5rem',
                    padding: '0.8rem',
                    background: 'rgba(0,0,0,0.02)',
                    borderRadius: '8px',
                    fontSize: '0.75rem',
                    color: 'var(--color-text-light)',
                    textAlign: 'center',
                    fontStyle: 'italic',
                    fontWeight: '600'
                }}>
                    💡 Info: Data ditarik dari datalogger setiap 5 detik. Gunakan mouse/sentuhan pada grafik untuk detail data.
                </div>
            </div>
            <style>{`
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }
            `}</style>
        </div>
    );
};

export default SensorChart;
