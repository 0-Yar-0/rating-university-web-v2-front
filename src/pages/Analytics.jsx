// src/pages/AnalyticsPage.jsx
import { useEffect, useState  } from 'react';
import { Api } from '../api.js';
import ResultsTable from '../components/ResultsTable.jsx';
import RadarBlock from '../components/RadarBlock.jsx';
import LineGraphBlock from '../components/LineGraphBlock.jsx';

const STORAGE_KEY = 'unirating_b_params_v2';

export default function AnalyticsPage({rows, metricNames, setMetricNames}) {
    // какие годы отображать (true = показываем)
    const [visibleYears, setVisibleYears] = useState({});

    // список ключей метрик (b11, b12, ... b33) вычисляется из первой строки
    const metricKeys = rows.length
        ? Object.keys(rows[0]).filter(k => /^b\d+$/.test(k))
        : [];

    // грузим последний расчёт класса B
    useEffect(() => {
        if (rows.length) {
            const vis = {};
            for (const r of rows) vis[r.year] = true;
            setVisibleYears(vis);
        }
    }, [rows]);

    const handleMetricNamesChange = (patch) => {
        setMetricNames((prev) => {
            const next = { ...prev, ...patch };
            const first = rows[0];
            if (first && first.calcResultId) {
                const dto = { calcResultId: first.calcResultId };
                // copy all codeBxx properties present in the state
                Object.keys(next).forEach((k) => {
                    if (k.startsWith('codeB')) {
                        dto[k] = next[k];
                    }
                });
                Api.updateMetricNames(dto).catch((e) => console.warn('Ошибка сохранения имён метрик', e));
            } else {
                console.warn('Нет calcResultId, имена метрик не отправлены на сервер');
            }

            return next;
        });
    };

    // включить/выключить год
    const handleToggleYear = (year) => {
        setVisibleYears((prev) => ({
            ...prev,
            [year]: !prev[year],
        }));
    };

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

    return (
        <>
            <div className="display-flex">
                <RadarBlock rows={activeRows} metricNames={metricNames} metricKeys={metricKeys} />
                <LineGraphBlock rows={activeRows} />
            </div>

            <ResultsTable
                rows={rows}
                metricNames={metricNames}
                metricKeys={metricKeys}
                onMetricNamesChange={handleMetricNamesChange}
                visibleYears={visibleYears}
                onToggleYear={handleToggleYear}
            />
        </>

    );
}
