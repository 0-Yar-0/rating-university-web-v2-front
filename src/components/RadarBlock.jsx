import React from 'react';
import {
    RadarChart,
    Radar,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    Legend,
    Tooltip,
    ResponsiveContainer
} from 'recharts';

const METRIC_MAX = {
    a11: 5,
    a21: 25,
    a22: 25,
    a23: 1,
    a31: 8,
    a32: 8,
    a33: 4,
    a34: 4,
    a35: 8,
    a36: 8,
    a37: 2,
    b11: 23,
    b12: 3,
    b13: 4,
    b21: 2,
    b22: 6,
    b23: 6,
    b24: 6,
    b25: 1,
    b26: 1,
    b31: 13,
    b32: 5,
    b33: 12,
    b34: 2,
    b41: 5,
    b42: 5,
    b43: 5,
    b44: 5,
    m11: 10,
    m12: 5,
    m13: 5,
    m14: 5,
    m21: 2,
    m22: 6,
    m23: 6,
    m24: 6,
    m25: 1,
    m26: 1,
    m27: 1,
    m31: 20,
    m32: 5,
    m33: 2,
    m41: 8,
    m42: 8,
    m43: 7,
    m44: 7,
};

const getObservedMetricMax = (rows, key) => {
    const values = rows
        .map((row) => Number(row?.[key]))
        .filter((value) => Number.isFinite(value));
    return values.length ? Math.max(...values, 0) : 0;
};

const resolveMetricMax = (rows, key) => {
    const normalizedKey = String(key || '').toLowerCase();
    const configuredMax = METRIC_MAX[normalizedKey];
    if (Number.isFinite(configuredMax)) {
        return configuredMax;
    }

    const observedMax = getObservedMetricMax(rows, key);
    return observedMax > 0 ? observedMax : 1;
};

/**
 * rows: активные строки (учитывая чекбоксы)
 * metricNames: { codeB11, codeB12, codeB13, codeB21 }
 */
export default function RadarBlock({ rows, metricNames, metricKeys = [], viewMode = 'percent' }) {
    if (!rows || !rows.length) {
        return (
            <div className="card radar-card">
                <h3>Паучья диаграмма</h3>
                <p>Нет данных для диаграммы</p>
            </div>
        );
    }

    const metrics = metricKeys.map((k) => ({
        key: k,
        label: metricNames[`code${k.toUpperCase()}`] || k.toUpperCase(),
    }));

    // данные вида:
    // [{ metric: 'B11', y_2024: ..., y_2025: ... }, ...]
    const data = metrics.map((m) => {
        const row = { metric: m.label };
        const metricMax = resolveMetricMax(rows, m.key);
        rows.forEach((r) => {
            const rawValue = Number(r[m.key]) || 0;
            if (viewMode === 'value') {
                row[`y_${r.year}`] = rawValue;
            } else {
                const normalized = metricMax > 0 ? (rawValue / metricMax) * 100 : 0;
                row[`y_${r.year}`] = Math.min(Math.max(normalized, 0), 100);
            }
        });
        return row;
    });

    const allValues = rows.flatMap((r) =>
        metrics.map((m) => {
            const value = Number(r[m.key]);
            if (!Number.isFinite(value)) return 0;
            if (viewMode === 'value') return value;
            const metricMax = resolveMetricMax(rows, m.key);
            return metricMax > 0 ? (value / metricMax) * 100 : 0;
        }),
    );
    const maxValue = Math.max(...allValues, 0);

    const metricsConfiguredMax = Math.max(
        ...metrics.map((m) => Number(resolveMetricMax(rows, m.key)) || 0),
        1,
    );

    // In value mode scale by metric bounds, not total score, otherwise radar becomes tiny.
    const radiusMax = viewMode === 'value'
        ? Math.max(1, Math.ceil(Math.max(maxValue, metricsConfiguredMax)))
        : 100;

    const COLORS = ['#2563EB', '#22C55E', '#F97316', '#E11D48', '#0EA5E9', '#A855F7'];

    return (
        <div className="card flex-1">
            <ResponsiveContainer width="100%" height={300}>
                <RadarChart
                    data={data}
                    outerRadius="80%"
                >
                    <PolarGrid radialLines={1} />
                    <PolarAngleAxis dataKey="metric" />
                    <PolarRadiusAxis
                        domain={[0, radiusMax]}
                        tickFormatter={(value) => (viewMode === 'value' ? `${Math.round(value)}` : `${value}%`)}
                    />
                    <Tooltip formatter={(value) => (viewMode === 'value' ? value : `${Number(value).toFixed(1)}%`)} />
                    <Legend />
                    {rows.map((r, idx) => (
                        <Radar
                            key={r.year}
                            name={String(r.year)}
                            dataKey={`y_${r.year}`}
                            stroke={COLORS[idx % COLORS.length]}
                            fill={COLORS[idx % COLORS.length]}
                            fillOpacity={0.3}
                        />
                    ))}
                </RadarChart>
            </ResponsiveContainer>
        </div>
    );
}
