import React from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

const PriceTrendChart = ({ data, fertilizerType }) => {
    if (!data || data.length === 0) {
        return (
            <div style={{
                padding: '1.5rem',
                textAlign: 'center',
                background: 'rgba(255,255,255,0.5)',
                borderRadius: '12px',
                border: '1px dashed #ddd',
                fontSize: '0.85rem',
                color: '#666'
            }}>
                Belum ada data riwayat harga untuk {fertilizerType}
            </div>
        );
    }

    const chartData = {
        labels: data.map(item => new Date(item.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })),
        datasets: [
            {
                label: `Harga ${fertilizerType.toUpperCase()} (Rp/kg)`,
                data: data.map(item => item.price),
                borderColor: '#1e88e5',
                backgroundColor: 'rgba(30, 136, 229, 0.1)',
                fill: true,
                tension: 0.4,
                pointRadius: 4,
                pointBackgroundColor: '#1e88e5',
                pointBorderColor: '#fff',
                pointHoverRadius: 6,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                titleColor: '#333',
                bodyColor: '#1e88e5',
                bodyFont: { weight: 'bold' },
                borderColor: '#1e88e5',
                borderWidth: 1,
                padding: 10,
                displayColors: false,
                callbacks: {
                    label: (context) => `Rp ${context.parsed.y.toLocaleString('id-ID')}/kg`
                }
            },
        },
        scales: {
            y: {
                beginAtZero: false,
                grid: {
                    color: 'rgba(0, 0, 0, 0.05)',
                },
                ticks: {
                    font: { size: 10 },
                    callback: (value) => `Rp ${value.toLocaleString('id-ID')}`
                }
            },
            x: {
                grid: {
                    display: false,
                },
                ticks: {
                    font: { size: 10 }
                }
            },
        },
    };

    return (
        <div style={{ height: '180px', width: '100%', marginTop: '1rem' }}>
            <Line data={chartData} options={options} />
        </div>
    );
};

export default PriceTrendChart;
