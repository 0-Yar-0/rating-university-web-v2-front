import React, { useEffect, useState } from 'react';
import { Api } from '../api';

const STORAGE_KEY_ITERATION = 'selected_iteration';

const META_KEYS = new Set([
    'year',
    'iteration',
    'calcResultId',
    'classType',
    'sumA',
    'sumB',
    'sumM',
    'TOTAL',
    'A_TOTAL',
    'B_TOTAL',
    'M_TOTAL',
    'A_TOTAL_WITH_KI',
    'B_TOTAL_WITH_KI',
    'M_TOTAL_WITH_KI',
    'KI',
    'KI_A',
    'KI_B',
    'KI_M',
]);

const resolveMetricKeys = (row) => Object.keys(row || {}).filter((key) => {
    if (key.startsWith('code')) return false;
    if (META_KEYS.has(key)) return false;
    return typeof row[key] === 'number' && Number.isFinite(row[key]);
});

export default function History({ items, setRows, selectedIteration, setSelectedIteration, classType = 'B', maxItems = null }) {
    // Удаление всей истории (как ты уже делал через Api.clearHistory)
    const handleClearHistory = async () => {
        if (!window.confirm('Точно удалить всю историю расчётов?')) return;
        try {
            await Api.clearHistory();
            localStorage.removeItem(STORAGE_KEY_ITERATION);
            setSelectedIteration(0)
        } catch (e) {
            alert('Ошибка при очистке истории: ' + (e?.message || e));
        }
    };

    const handleOpenIteration = (iter) => () => {
        setSelectedIteration(iter)
        localStorage.setItem(STORAGE_KEY_ITERATION, String(iter));
    };

    const sortedItems = [...(items || [])].sort((a, b) => b.iter - a.iter);
    const visibleItems = Number.isFinite(maxItems) ? sortedItems.slice(0, Math.max(0, maxItems)) : sortedItems;

    if (!visibleItems.length) {
        return (
            <div className="card">
                <h2>Сохранённые сессии</h2>
                <p>История пока пуста.</p>
            </div>
        );
    }

    return (
        <div className="card">
            <div className="history-header">
                <h2>Сохранённые сессии</h2>
            </div>

            <div className="history-list">
                {visibleItems.map((it) => (
                    <div key={it.iter} className={`history-item ${it.iter === selectedIteration ? "selected" : ""}`} onClick={handleOpenIteration(it.iter)}>
                        <div className="history-main">
                            <span className="history-title">Расчёт #{it.iter}</span>
                            <span className="history-classes">Класс {classType}</span>
                        </div>
                        <div className="history-summary">
                            {it.results?.map((row) => (
                                <span key={row.year} className="history-chip">
                                    {row.year}: {resolveMetricKeys(row).map((k) => `${k.toUpperCase()}=${Number(row[k]).toFixed(2)}`).join(', ')}
                                </span>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <div className="display-flex">
                <button className="secondary-btn" type="button" onClick={handleClearHistory}>
                    Очистить историю
                </button>
            </div>
        </div>
    );
}
