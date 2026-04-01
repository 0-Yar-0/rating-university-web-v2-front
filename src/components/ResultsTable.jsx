// src/components/ResultsTable.jsx
import React, { useState } from 'react';

const TOTAL_KEY_PRIORITY = {
    A: ['A_TOTAL_WITH_KI', 'A_TOTAL', 'sumA', 'TOTAL'],
    B: ['B_TOTAL_WITH_KI', 'B_TOTAL', 'sumB', 'TOTAL'],
    M: ['M_TOTAL_WITH_KI', 'M_TOTAL', 'sumM', 'TOTAL'],
};

export default function ResultsTable({
    rows,
    metricNames,
    metricKeys = [],
    onMetricNamesChange,
    visibleYears,
    onToggleYear,
    allowMetricNameEditing = true,
    classType = 'B',
}) {
    const [editingKey, setEditingKey] = useState(null);
    const [editValue, setEditValue] = useState('');

    const startEdit = (key, current) => {
        setEditingKey(key);
        setEditValue(current);
    };

    const cancelEdit = () => {
        setEditingKey(null);
        setEditValue('');
    };

    const commitEdit = () => {
        if (!editingKey || !onMetricNamesChange) return;

        const patch = { [editingKey]: editValue || editingKey.toUpperCase() };
        onMetricNamesChange(patch);

        setEditingKey(null);
        setEditValue('');
    };

    const editableMetrics = allowMetricNameEditing ? metricKeys.slice() : [];

    const renderHeaderCell = (key, label) => (
        <th className="results-table-header">
            {editingKey === key ? (
                <input
                    className="metric-edit-input"
                    autoFocus
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onBlur={commitEdit}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') commitEdit();
                        if (e.key === 'Escape') cancelEdit();
                    }}
                />
            ) : (
                <button
                    type="button"
                    className="metric-header-btn"
                    onClick={() => startEdit(key, label)}
                    title="Изменить название метрики"
                >
                    {label}
                </button>
            )}
        </th>
    );

    const formatNumber = (value) => {
        if (typeof value !== 'number' || !Number.isFinite(value)) return value;
        return value.toFixed(3).replace(/\.?0+$/, '');
    };

    const resolveTotalValue = (row) => {
        const priority = TOTAL_KEY_PRIORITY[classType] || TOTAL_KEY_PRIORITY.B;
        for (const key of priority) {
            const value = Number(row?.[key]);
            if (Number.isFinite(value)) return value;
        }

        return null;
    };

    return (
        <div className="card results-table-wrapper">
            <table className="results-table">
                <thead>
                    <tr>
                        <th className="results-table-header">Год</th>
                        {metricKeys.map((k) => {
                            const label = metricNames[`code${k.toUpperCase()}`] || k.toUpperCase();
                            if (editableMetrics.includes(k)) {
                                const nameKey = `code${k.toUpperCase()}`;
                                return renderHeaderCell(nameKey, label);
                            }

                            return (
                                <th className="results-table-header" key={k}>
                                    {label}
                                </th>
                            );
                        })}
                        <th className="results-table-header">Сумма баллов</th>
                        <th className="results-table-header">Показать</th>
                    </tr>
                </thead>
                <tbody>
                    {rows.map((r) => (
                        <tr key={`${r.year}-${r.iteration}`} className="results-table-row">
                            <td className="results-table-cell">{r.year}</td>
                            {metricKeys.map((k) => (
                                <td key={k} className="results-table-cell">
                                    {formatNumber(r[k])}
                                </td>
                            ))}
                            <td className="results-table-cell">{formatNumber(resolveTotalValue(r))}</td>
                            <td className="results-table-cell" style={{ textAlign: 'center' }}>
                                <input
                                    type="checkbox"
                                    checked={!!visibleYears[r.year]}
                                    onChange={() => onToggleYear(r.year)}
                                />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}