import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';

export default function LineGraphBlock({ rows }) {
    if (!rows || !rows.length) return (
        <div className="card radar-card">
            <h3>Линейный график</h3>
            <p>Нет данных для диаграммы</p>
        </div>
    )

    const data = rows.map((r) => ({
        year: r.year,
        total: r.sumB,
    }));

    const totals = data
        .map((point) => Number(point.total))
        .filter((value) => Number.isFinite(value));
    const minTotal = totals.length ? Math.min(...totals) : 0;
    const maxTotal = totals.length ? Math.max(...totals) : 0;
    const span = maxTotal - minTotal;
    const pad = span > 0 ? span * 0.1 : Math.max(1, Math.abs(minTotal) * 0.05);
    const yDomain = [minTotal - pad, maxTotal + pad];

    return (
        <div className="card flex-1">
            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data} margin={{ top: 20, right: 40, left: 0, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis domain={yDomain} />
                    <Tooltip />
                    <Line type="monotone" dataKey="total" stroke="#82ca9d" dot />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
