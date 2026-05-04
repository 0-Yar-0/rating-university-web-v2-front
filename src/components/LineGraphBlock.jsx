import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';

const TOTAL_KEY_PRIORITY = {
    A: ['A_TOTAL_WITH_KI', 'A_TOTAL', 'sumA', 'TOTAL'],
    B: ['B_TOTAL_WITH_KI', 'B_TOTAL', 'sumB', 'TOTAL'],
    M: ['M_TOTAL_WITH_KI', 'M_TOTAL', 'sumM', 'TOTAL'],
};

const resolveTotalValue = (row, classType) => {
    const priority = TOTAL_KEY_PRIORITY[classType] || TOTAL_KEY_PRIORITY.B;
    for (const key of priority) {
        const value = Number(row?.[key]);
        if (Number.isFinite(value)) return value;
    }

    const fallbackKey = Object.keys(row || {}).find((key) => /TOTAL|sum[A-Z]?/i.test(key));
    const fallbackValue = Number(row?.[fallbackKey]);
    return Number.isFinite(fallbackValue) ? fallbackValue : 0;
};

export default function LineGraphBlock({ rows, classType = 'B' }) {
    if (!rows || !rows.length) return (
        <div className="card radar-card">
            <h3>Линейный график</h3>
            <p>Нет данных для диаграммы</p>
        </div>
    )

    const data = rows.map((r) => ({
        year: r.year,
        total: resolveTotalValue(r, classType),
    }));

    // Calculate Y-axis domain based on total scores
    const totals = data
        .map((point) => Number(point.total))
        .filter((value) => Number.isFinite(value));
    const minTotal = totals.length ? Math.min(...totals) : 0;
    const maxTotal = totals.length ? Math.max(...totals) : 100;
    const span = maxTotal - minTotal;
    const pad = span > 0 ? span * 0.1 : Math.max(1, Math.abs(minTotal) * 0.05);
    const yDomain = [minTotal - pad, maxTotal + pad];

    return (
        <div className="card flex-1">
            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data} margin={{ top: 20, right: 40, left: 0, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis type="integer" domain={yDomain} reversed={false} />
                    <Tooltip />
                    <Line type="monotone" dataKey="total" stroke="#82ca9d" dot />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
