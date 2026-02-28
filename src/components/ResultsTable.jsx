// src/components/ResultsTable.jsx
import React, { useState } from 'react';

export default function ResultsTable({
    rows,
    metricNames,
    metricKeys = [],
    onMetricNamesChange,
    visibleYears,
    onToggleYear,
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
        if (!editingKey) return;

        const patch = { [editingKey]: editValue || editingKey.toUpperCase() };
        console.log('commitEdit, patch = ', patch);

        // 👉 только говорим родителю, что поменялось
        onMetricNamesChange(patch);

        setEditingKey(null);
        setEditValue('');
    };

    const editableMetrics = ['b11','b12','b13','b21'];

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

    return (
        <div className="card results-table-wrapper">
            <table className="results-table">
                <thead>
                    <tr>
                        <th className="results-table-header">Год</th>
                        {metricKeys.map((k) => {
                            const label = metricNames[`code${k.toUpperCase()}`] || k.toUpperCase();
                            if (editableMetrics.includes(k)) {
                                // convert b11 -> codeB11 etc
                                const nameKey = `code${k.toUpperCase()}`;
                                return renderHeaderCell(nameKey, label);
                            } else {
                                return (
                                    <th className="results-table-header" key={k}>
                                        {label}
                                    </th>
                                );
                            }
                        })}
                        <th className="results-table-header">Total B</th>
                        <th className="results-table-header">Показать</th>
                    </tr>
                </thead>
                <tbody>
                    {rows.map((r) => (
                        <tr key={`${r.year}-${r.iteration}`} className="results-table-row">
                            <td className="results-table-cell">{r.year}</td>
                            {metricKeys.map((k) => (
                                <td key={k} className="results-table-cell">
                                    {typeof r[k] === 'number' ? r[k].toFixed(2) : r[k]}
                                </td>
                            ))}
                            <td className="results-table-cell">{r.sumB.toFixed(2)}</td>
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