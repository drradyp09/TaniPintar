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
            let url = `http://localhost:5000/api/auth/sensors/${sensor.id}/history`;
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
        <div style={{ marginTop: '1.5rem' }}>
            <div style={{
                background: 'white',
                borderRadius: '12px',
                padding: '1.5rem',
                marginBottom: '1rem',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                border: '1px solid #e2e8f0'
            }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '1rem',
                    flexWrap: 'wrap',
                    gap: '1rem'
                }}>
                    <h3 style={{
                        fontSize: '1.1rem',
                        fontWeight: '700',
                        color: '#2d3748',
                        margin: 0
                    }}>
                        {(!startDate && !endDate) ? '📊 Visualisasi Data Real-Time' : '📅 Histori Data Terpilih'}
                    </h3>

                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                        {/* Date Filters */}
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <input
                                type="datetime-local"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                style={{
                                    fontSize: '0.8rem',
                                    padding: '0.4rem',
                                    borderRadius: '6px',
                                    border: '1px solid #cbd5e0'
                                }}
                            />
                            <span style={{ fontSize: '0.8rem' }}>s/d</span>
                            <input
                                type="datetime-local"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                style={{
                                    fontSize: '0.8rem',
                                    padding: '0.4rem',
                                    borderRadius: '6px',
                                    border: '1px solid #cbd5e0'
                                }}
                            />
                            {(startDate || endDate) && (
                                <button
                                    onClick={() => { setStartDate(''); setEndDate(''); }}
                                    style={{
                                        background: '#f1f5f9',
                                        border: '1px solid #cbd5e0',
                                        borderRadius: '6px',
                                        padding: '0.4rem 0.8rem',
                                        fontSize: '0.8rem',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Reset
                                </button>
                            )}
                        </div>

                        {/* Chart Type Selector */}
                        <select
                            value={chartType}
                            onChange={(e) => setChartType(e.target.value)}
                            style={{
                                padding: '0.4rem 0.75rem',
                                borderRadius: '6px',
                                border: '1px solid #cbd5e0',
                                fontSize: '0.85rem',
                                background: '#f7fafc',
                                cursor: 'pointer',
                                fontWeight: '600',
                                color: '#4a5568'
                            }}
                        >
                            <option value="line">📈 Garis</option>
                            <option value="area">🏔️ Area</option>
                            <option value="bar">📊 Batang</option>
                        </select>

                        {(!startDate && !endDate) && (
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                fontSize: '0.85rem',
                                color: '#4caf50',
                                marginLeft: '0.5rem'
                            }}>
                                <div style={{
                                    width: '8px',
                                    height: '8px',
                                    borderRadius: '50%',
                                    background: '#4caf50',
                                    animation: 'pulse 2s infinite'
                                }}></div>
                                Live
                            </div>
                        )}
                    </div>
                </div>

                {/* Sensor Filter Chips */}
                <div style={{
                    display: 'flex',
                    gap: '0.5rem',
                    flexWrap: 'wrap',
                    marginBottom: '1.5rem',
                    padding: '0.75rem',
                    background: '#f8f9fa',
                    borderRadius: '8px'
                }}>
                    <span style={{ fontSize: '0.85rem', color: '#666', display: 'flex', alignItems: 'center', marginRight: '0.5rem', width: '100%' }}>
                        Atur Sumbu Grafik (Klik untuk ganti):
                    </span>
                    {activeSensors.map(key => {
                        const info = getSensorDetails(key);
                        const axis = axisAssignments[key]; // 'left', 'right', or undefined
                        return (
                            <button
                                key={key}
                                onClick={() => toggleSensorAxis(key)}
                                style={{
                                    padding: '0.35rem 0.85rem',
                                    borderRadius: '16px',
                                    border: axis ? `2px solid ${info.color}` : '1px solid #cbd5e0',
                                    background: axis ? info.color.replace('rgb', 'rgba').replace(')', ', 0.1)') : 'white',
                                    color: axis ? info.color : '#718096',
                                    fontSize: '0.8rem',
                                    fontWeight: axis ? '600' : '400',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }}
                            >
                                {/* Indicator Badge */}
                                <span style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: '18px',
                                    height: '18px',
                                    borderRadius: '50%',
                                    background: axis ? info.color : '#e2e8f0',
                                    color: axis ? 'white' : '#a0aec0',
                                    fontSize: '0.65rem',
                                    fontWeight: '700'
                                }}>
                                    {axis === 'left' ? 'L' : axis === 'right' ? 'R' : '•'}
                                </span>
                                {info.label.split('(')[0]}
                            </button>
                        );
                    })}
                </div>

                {!hasActiveSensors ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: '#a0aec0', fontStyle: 'italic' }}>
                        Pilih minimal satu sensor untuk melihat grafik
                    </div>
                ) : (
                    <div style={{ marginBottom: '1.5rem' }}>
                        <div style={{ height: '300px' }}>
                            {chartType === 'bar'
                                ? <Bar data={getCombinedData()} options={getChartOptions()} />
                                : <Line data={getCombinedData()} options={getChartOptions()} />
                            }
                        </div>
                    </div>
                )}

                <p style={{
                    fontSize: '0.75rem',
                    color: '#718096',
                    marginTop: '1rem',
                    textAlign: 'center',
                    fontStyle: 'italic'
                }}>
                    💡 Data diperbarui setiap 5 detik (menampilkan data asli dari datalogger)
                </p>
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
