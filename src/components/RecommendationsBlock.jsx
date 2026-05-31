import React from 'react';
import { DEFAULT_METRIC_NAMES } from '../constants.js';

const METRIC_MAX = {
    a11: 5, a21: 25, a22: 25, a23: 1,
    a31: 8, a32: 8, a33: 4, a34: 4, a35: 8, a36: 8, a37: 2,
    b11: 23, b12: 3, b13: 4, b21: 2,
    b22: 6, b23: 6, b24: 6, b25: 1, b26: 1,
    b31: 13, b32: 5, b33: 12, b34: 2,
    b41: 5, b42: 5, b43: 5, b44: 5,
    m11: 10, m12: 5, m13: 5, m14: 5,
    m21: 2, m22: 6, m23: 6, m24: 6,
    m25: 1, m26: 1, m27: 1,
    m31: 20, m32: 5, m33: 2,
    m41: 8, m42: 8, m43: 7, m44: 7,
};

const ADVICE = {
    b11: 'Увеличьте средний балл ЕГЭ зачисленных — усильте профориентацию на сильных абитуриентов',
    b12: 'Повысьте исполнение КЦП — скорректируйте план набора',
    b13: 'Привлекайте больше магистрантов из стран БРИКС — развивайте международные программы',
    b21: 'Получите профессионально-общественную аккредитацию для образовательных программ',
    b22: 'Пройдите учебную аккредитацию по специальностям',
    b23: 'Увеличьте количество аккредитованных образовательных программ',
    b24: 'Внедрите систему менеджмента качества',
    b25: 'Развивайте сетевое взаимодействие с другими вузами',
    b26: 'Активизируйте инновационную деятельность',
    b31: 'Повысьте уровень трудоустройства выпускников — усильте взаимодействие с работодателями',
    b32: 'Увеличьте среднюю зарплату выпускников — улучшите качество подготовки',
    b33: 'Повысьте удовлетворённость работодателей — проведите опросы и анализ',
    b34: 'Развивайте карьерные траектории выпускников — создайте ассоциацию выпускников',
    b41: 'Наращивайте публикационную активность НПР — стимулируйте научную работу',
    b42: 'Увеличьте цитирования в международных БД — публикуйтесь в высокорейтинговых журналах',
    b43: 'Расширяйте участие в зарубежных научных проектах',
    b44: 'Увеличьте объём инновационных разработок — коммерциализируйте НИОКР',
    a11: 'Увеличьте число зачисленных по целевому приёму',
    a21: 'Повысьте соотношение защит к выпуску — стимулируйте завершение диссертаций',
    a22: 'Повысьте соотношение защит к приёму — отбирайте мотивированных аспирантов',
    a23: 'Увеличьте долю аспирантов, защитивших диссертации в срок',
    a31: 'Наращивайте публикационную активность на 100 НПР',
    a32: 'Увеличьте доходы от НИОКР на 1 НПР',
    a33: 'Увеличьте объём внебюджетных НИОКР на 1 НПР',
    a34: 'Привлекайте больше иностранных аспирантов',
    a35: 'Повысьте доходы на 1 НПР — диверсифицируйте источники финансирования',
    a36: 'Увеличьте объём НИОКР на ставку ППС',
    a37: 'Развивайте дополнительный индикатор — внедряйте новые направления',
    m11: 'Увеличьте приём по целевому набору в магистратуру',
    m12: 'Повысьте привлекательность программ — увеличьте число заявлений на место',
    m13: 'Оптимизируйте долю договорного приёма',
    m14: 'Повысьте исполнение КЦП в магистратуре',
    m21: 'Получите профессионально-общественную аккредитацию',
    m22: 'Улучшите соотношение аспирантов/ординаторов/ассистентов к магистрантам',
    m23: 'Развивайте программы ДПО — увеличьте соотношение к основным ОП',
    m24: 'Увеличьте долю целевого обучения',
    m25: 'Повысьте соотношение бюджетных и контрактных студентов',
    m26: 'Развивайте программы в сетевой форме',
    m27: 'Увеличьте число обучающихся по сетевым программам',
    m31: 'Повысьте доходы выпускников относительно прожиточного минимума',
    m32: 'Улучшите сохранность контингента',
    m33: 'Повысьте востребованность на рынке труда',
    m41: 'Наращивайте публикации на 100 НПР',
    m42: 'Увеличьте доходы от НИОКР на 1 НПР',
    m43: 'Увеличьте долю иностранных обучающихся',
    m44: 'Повысьте доходы на 1 обучающегося',
};

const TOTAL_KEY_PRIORITY = {
    A: ['A_TOTAL_WITH_KI', 'A_TOTAL', 'sumA', 'TOTAL'],
    B: ['B_TOTAL_WITH_KI', 'B_TOTAL', 'sumB', 'TOTAL'],
    M: ['M_TOTAL_WITH_KI', 'M_TOTAL', 'sumM', 'TOTAL'],
};

const resolveTotal = (row, classType) => {
    const priority = TOTAL_KEY_PRIORITY[classType] || TOTAL_KEY_PRIORITY.B;
    for (const key of priority) {
        const v = Number(row?.[key]);
        if (Number.isFinite(v)) return v;
    }
    return null;
};

function classMaxSum(classType) {
    const prefix = classType.toLowerCase();
    return Object.entries(METRIC_MAX)
        .filter(([k]) => k.startsWith(prefix))
        .reduce((sum, [, v]) => sum + v, 0);
}

export default function RecommendationsBlock({ rows, metricKeys = [], metricNames = {}, classType = 'B' }) {
    if (!rows || !rows.length || !metricKeys.length) {
        return (
            <div className="card">
                <h3>Рекомендации по улучшению</h3>
                <p>Нет данных для анализа. Выполните расчёт.</p>
            </div>
        );
    }

    const latestRow = rows.reduce((a, b) => (Number(a.year) > Number(b.year) ? a : b));
    const currentTotal = resolveTotal(latestRow, classType);
    const theoreticalMax = classMaxSum(classType);

    const allMetrics = metricKeys
        .map((key) => {
            const raw = Number(latestRow[key]);
            if (!Number.isFinite(raw)) return null;
            const maxKey = key.toLowerCase();
            const maxVal = METRIC_MAX[maxKey];
            if (!maxVal || maxVal <= 0) return null;

            const nameKey = `code${key.toUpperCase()}`;
            const label = metricNames[nameKey] || DEFAULT_METRIC_NAMES[nameKey] || key.toUpperCase();
            const pct = (raw / maxVal) * 100;
            const gap = maxVal - raw;
            const advice = ADVICE[maxKey] || '';

            return { key, label, current: raw, max: maxVal, pct, gap, advice };
        })
        .filter(Boolean)
        .sort((a, b) => b.gap - a.gap);

    if (!allMetrics.length) {
        return (
            <div className="card">
                <h3>Рекомендации по улучшению — класс {classType}</h3>
                <p>Нет данных для анализа.</p>
            </div>
        );
    }

    const critical = allMetrics.filter((r) => r.gap >= r.max * 0.3);
    const recommended = allMetrics.filter((r) => r.gap >= r.max * 0.1 && r.gap < r.max * 0.3);
    const optional = allMetrics.filter((r) => r.gap < r.max * 0.1);

    const totalPotentialGain = allMetrics.reduce((s, r) => s + r.gap, 0);

    const totalGainCritical = critical.reduce((s, r) => s + r.gap, 0);
    const totalGainRecommended = recommended.reduce((s, r) => s + r.gap, 0);

    const getBarStyle = (pct) => ({
        width: `${Math.max(2, Math.min(100, pct))}%`,
        background: pct < 50 ? '#E11D48' : pct < 80 ? '#F97316' : '#22C55E',
        height: 10,
        borderRadius: 5,
        transition: 'width 0.3s',
    });

    return (
        <div className="card">
            <h3>Рекомендации по улучшению — класс {classType}</h3>

            {currentTotal != null && theoreticalMax > 0 && (
                <div style={{ marginBottom: 12, padding: '8px 12px', background: '#f0f4ff', borderRadius: 6 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span><strong>Текущий итог:</strong> {currentTotal.toFixed(3)}</span>
                        <span><strong>Максимум:</strong> {theoreticalMax.toFixed(3)}</span>
                    </div>
                    <div style={{ background: '#e0e7ff', borderRadius: 5, height: 10, overflow: 'hidden' }}>
                        <div style={{
                            width: `${Math.max(1, Math.min(100, (currentTotal / theoreticalMax) * 100))}%`,
                            background: '#2563EB',
                            height: 10,
                            borderRadius: 5,
                        }} />
                    </div>
                    <div style={{ marginTop: 4, fontSize: '0.9em', color: '#555' }}>
                        Потенциал улучшения: <strong>+{totalPotentialGain.toFixed(3)} балла</strong>
                        {currentTotal != null && (
                            <span> (до {Math.min(theoreticalMax, currentTotal + totalPotentialGain).toFixed(3)})</span>
                        )}
                    </div>
                </div>
            )}

            {critical.length > 0 && (
                <div style={{ marginTop: 8 }}>
                    <p style={{ fontWeight: 600, color: '#E11D48', marginBottom: 2 }}>
                        🔴 Критично — влияют на итог больше всего (недобор ≥30%):
                        <span style={{ fontWeight: 400, fontSize: '0.85em', marginLeft: 6 }}>
                            (потенциал +{totalGainCritical.toFixed(3)} балла)
                        </span>
                    </p>
                    {critical.map((r) => (
                        <div key={r.key} style={{
                            marginTop: 6, padding: '6px 10px', border: '1px solid #fecaca', borderRadius: 6,
                            borderLeft: '4px solid #E11D48',
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}>
                                <span>{r.label}</span>
                                <span style={{ color: '#E11D48' }}>+{r.gap.toFixed(3)} балла</span>
                            </div>
                            <div style={{ marginTop: 4, background: '#fee2e2', borderRadius: 5, height: 10, overflow: 'hidden' }}>
                                <div style={getBarStyle(r.pct)} />
                            </div>
                            <div style={{ marginTop: 2, fontSize: '0.85em', color: '#666' }}>
                                {r.current.toFixed(3)} из {r.max} ({r.pct.toFixed(3)}%)
                            </div>
                            {r.advice && (
                                <div style={{ marginTop: 4, fontSize: '0.85em', color: '#333', fontStyle: 'italic' }}>
                                    💡 {r.advice}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {recommended.length > 0 && (
                <div style={{ marginTop: 12 }}>
                    <p style={{ fontWeight: 600, color: '#F97316', marginBottom: 2 }}>
                        🟠 Рекомендуется улучшить (недобор 10-30%):
                        <span style={{ fontWeight: 400, fontSize: '0.85em', marginLeft: 6 }}>
                            (потенциал +{totalGainRecommended.toFixed(3)} балла)
                        </span>
                    </p>
                    {recommended.map((r) => (
                        <div key={r.key} style={{
                            marginTop: 6, padding: '6px 10px', border: '1px solid #fed7aa', borderRadius: 6,
                            borderLeft: '4px solid #F97316',
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}>
                                <span>{r.label}</span>
                                <span style={{ color: '#F97316' }}>+{r.gap.toFixed(3)} балла</span>
                            </div>
                            <div style={{ marginTop: 4, background: '#fff7ed', borderRadius: 5, height: 10, overflow: 'hidden' }}>
                                <div style={getBarStyle(r.pct)} />
                            </div>
                            <div style={{ marginTop: 2, fontSize: '0.85em', color: '#666' }}>
                                {r.current.toFixed(3)} из {r.max} ({r.pct.toFixed(3)}%)
                            </div>
                            {r.advice && (
                                <div style={{ marginTop: 4, fontSize: '0.85em', color: '#333', fontStyle: 'italic' }}>
                                    💡 {r.advice}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {optional.length > 0 && (
                <div style={{ marginTop: 12 }}>
                    <p style={{ fontWeight: 600, color: '#22C55E', marginBottom: 2 }}>
                        🟢 Опционально — можно оставить без изменений (недобор &lt;10%):
                        <span style={{ fontWeight: 400, fontSize: '0.85em', marginLeft: 6 }}>
                            ({optional.length} метрик)
                        </span>
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 4 }}>
                        {optional.map((r) => (
                            <span key={r.key} style={{
                                padding: '2px 8px', background: '#dcfce7', borderRadius: 4,
                                fontSize: '0.85em', cursor: 'pointer',
                            }} title={`${r.current.toFixed(3)} из ${r.max} (${r.pct.toFixed(3)}%)`}>
                                {r.label} ✓
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
