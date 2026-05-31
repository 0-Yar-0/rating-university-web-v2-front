import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Legend } from 'recharts';

const TOTAL_KEY_PRIORITY = {
    A: ['A_TOTAL_WITH_KI', 'A_TOTAL', 'sumA', 'TOTAL'],
    B: ['B_TOTAL_WITH_KI', 'B_TOTAL', 'sumB', 'TOTAL'],
    M: ['M_TOTAL_WITH_KI', 'M_TOTAL', 'sumM', 'TOTAL'],
};

const FORECAST_YEARS = 2;

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

const formatYAxisTick = (value) => {
    const numericValue = Number(value);
    if (!Number.isFinite(numericValue)) return value;
    return numericValue.toLocaleString('ru-RU', { maximumFractionDigits: 3 });
};

function linearRegression(points) {
    const n = points.length;
    if (n < 2) return { slope: 0, intercept: points[0]?.[1] ?? 0 };
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
    for (const [x, y] of points) {
        sumX += x;
        sumY += y;
        sumXY += x * y;
        sumX2 += x * x;
    }
    const denom = n * sumX2 - sumX * sumX;
    const slope = denom !== 0 ? (n * sumXY - sumX * sumY) / denom : 0;
    const intercept = (sumY - slope * sumX) / n;
    return { slope, intercept };
}

function projectValue(x, slope, intercept) {
    return slope * x + intercept;
}

export default function LineGraphBlock({ rows, classType = 'B' }) {
    if (!rows || !rows.length) return (
        <div className="card radar-card">
            <h3>Линейный график</h3>
            <p>Нет данных для диаграммы</p>
        </div>
    )

    const sorted = [...rows]
        .map((r) => ({
            year: Number(r.year),
            total: resolveTotalValue(r, classType),
        }))
        .sort((a, b) => a.year - b.year);

    const actuals = sorted.filter((p) => Number.isFinite(p.total));

    let forecastData = [];
    const { slope, intercept } = linearRegression(
        actuals.map((p) => [p.year, p.total])
    );
    const stddev = actuals.length > 1
        ? Math.sqrt(
            actuals.reduce((sum, p) => {
                const predicted = projectValue(p.year, slope, intercept);
                return sum + (p.total - predicted) ** 2;
            }, 0) / actuals.length
        )
        : 0;

    if (actuals.length >= 2) {
        const maxYear = Math.max(...actuals.map((p) => p.year));
        for (let i = 1; i <= FORECAST_YEARS; i++) {
            const fy = maxYear + i;
            const base = projectValue(fy, slope, intercept);
            forecastData.push({
                year: fy,
                stable: base,
                best: base + (stddev || base * 0.05),
                worst: Math.max(0, base - (stddev || base * 0.05)),
            });
        }
    }

    const data = sorted.map((p) => ({
        year: p.year,
        total: p.total,
        stable: p.total,
        best: p.total,
        worst: p.total,
    }));

    if (forecastData.length) {
        const lastActual = data[data.length - 1];
        for (const f of forecastData) {
            data.push({
                year: f.year,
                total: null,
                stable: f.stable,
                best: f.best,
                worst: f.worst,
            });
        }
    }

    const allValues = data.flatMap((p) =>
        [p.total, p.stable, p.best, p.worst].filter((v) => Number.isFinite(v))
    );
    const minV = allValues.length ? Math.min(...allValues) : 0;
    const maxV = allValues.length ? Math.max(...allValues) : 100;
    const span = maxV - minV;
    const lowerPad = Math.min(3, Math.max(1, Math.ceil(span * 0.1) || 1));
    const upperPad = span > 0 ? Math.max(1, Math.ceil(span * 0.1)) : 1;
    const yDomain = [minV - lowerPad, maxV + upperPad];

    return (
        <div className="card flex-1">
            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data} margin={{ top: 20, right: 40, left: 0, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" type="number" domain={['dataMin', 'dataMax']} />
                    <YAxis
                        type="number"
                        allowDecimals
                        domain={yDomain}
                        reversed={false}
                        tickFormatter={formatYAxisTick}
                    />
                    <Tooltip />
                    <Legend verticalAlign="bottom" height={36} />
                    <Line
                        type="monotone"
                        dataKey="total"
                        name="Факт"
                        stroke="#2563EB"
                        strokeWidth={2}
                        dot
                        connectNulls={false}
                    />
                    {forecastData.length > 0 && (
                        <>
                            <Line
                                type="monotone"
                                dataKey="best"
                                name="Лучший"
                                stroke="#22C55E"
                                strokeWidth={2}
                                strokeDasharray="6 3"
                                dot={false}
                                connectNulls
                            />
                            <Line
                                type="monotone"
                                dataKey="stable"
                                name="Стабильный"
                                stroke="#F97316"
                                strokeWidth={2}
                                strokeDasharray="4 4"
                                dot={false}
                                connectNulls
                            />
                            <Line
                                type="monotone"
                                dataKey="worst"
                                name="Худший"
                                stroke="#E11D48"
                                strokeWidth={2}
                                strokeDasharray="2 4"
                                dot={false}
                                connectNulls
                            />
                        </>
                    )}
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
