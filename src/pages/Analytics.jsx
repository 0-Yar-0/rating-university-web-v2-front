// src/pages/AnalyticsPage.jsx
import { useState  } from 'react';
import RadarBlock from '../components/RadarBlock.jsx';
import LineGraphBlock from '../components/LineGraphBlock.jsx';

export default function AnalyticsPage({
    rows,
    metricNames,
    classType,
    availableClassTypes = [],
    onClassTypeChange,
    metricKeys = [],
    visibleYears = {},
    onToggleYear,
}) {
    const [radarViewMode, setRadarViewMode] = useState('percent');

    if (!rows.length) {
        return (
            <div className="card big-card">
                <h2>Аналитика</h2>
                <p>Нет данных для отображения. Сначала выполните расчёт.</p>
            </div>
        );
    }

    // строки, которые реально показываем в графиках
    const activeRows = rows.filter((r) => visibleYears[r.year]);
    const classOptions = Array.from(new Set(availableClassTypes.length ? availableClassTypes : ['A', 'B', 'M']));

    return (
        <>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <span>Класс:</span>
                <select
                    className="num-input"
                    value={classType || 'B'}
                    onChange={(e) => onClassTypeChange?.(e.target.value)}
                    style={{ maxWidth: 120 }}
                >
                    {classOptions.map((option) => (
                        <option key={option} value={option}>{option}</option>
                    ))}
                </select>
                <span>Паутинная диаграмма:</span>
                <select
                    className="num-input"
                    value={radarViewMode}
                    onChange={(e) => setRadarViewMode(e.target.value)}
                    style={{ maxWidth: 280 }}
                >
                    <option value="percent">Через проценты</option>
                    <option value="value">Через значения</option>
                </select>
            </div>

            <div className="display-flex">
                <RadarBlock
                    rows={activeRows}
                    metricNames={metricNames}
                    metricKeys={metricKeys}
                    viewMode={radarViewMode}
                    classType={classType}
                />
                <LineGraphBlock rows={activeRows} classType={classType} />
            </div>
        </>

    );
}
