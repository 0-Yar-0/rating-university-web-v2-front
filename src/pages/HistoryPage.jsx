import React, { useEffect, useState } from 'react';
import { Api } from '../api';
import History from './History';

const STORAGE_KEY_ITERATION = 'selected_iteration';

export default function HistoryPage() {
    const [historyClasses, setHistoryClasses] = useState([]);
    const [selectedClassType, setSelectedClassType] = useState('B');
    const [items, setItems] = useState([]);
    const [selectedIteration, setSelectedIteration] = useState(+localStorage.getItem(STORAGE_KEY_ITERATION) || 0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let active = true;

        Api.getHistoryAll()
            .then((object) => {
                if (!active) return;
                const classes = Array.isArray(object?.classes) ? object.classes : [];
                setHistoryClasses(classes);
                setSelectedClassType((current) => (
                    classes.some((c) => c.classType === current)
                        ? current
                        : (classes[0]?.classType || current)
                ));
            })
            .catch((err) => {
                console.warn('Ошибка загрузки истории:', err);
                if (!active) return;
                setHistoryClasses([]);
            })
            .finally(() => {
                if (active) setLoading(false);
            });

        return () => {
            active = false;
        };
    }, []);

    useEffect(() => {
        const selectedClass = historyClasses.find((c) => c.classType === selectedClassType)
            || historyClasses[0];

        setItems(Array.isArray(selectedClass?.items) ? selectedClass.items : []);
    }, [historyClasses, selectedClassType]);

    const classTypes = historyClasses.map((item) => item.classType);

    return (
        <div className="history-page-layout">
            <section className="card history-page-card">
                <div className="history-page-header">
                    <h1>История расчётов</h1>
                    <p>Полный журнал всех итераций. На главной странице показываются только последние 5.</p>
                </div>

                <div className="history-class-tabs">
                    {classTypes.map((classType) => (
                        <button
                            key={classType}
                            type="button"
                            className={`history-tab ${selectedClassType === classType ? 'active' : ''}`}
                            onClick={() => setSelectedClassType(classType)}
                        >
                            Класс {classType}
                        </button>
                    ))}
                </div>
            </section>

            {loading ? (
                <div className="card">Загрузка истории...</div>
            ) : (
                <History
                    items={items}
                    setRows={() => {}}
                    selectedIteration={selectedIteration}
                    setSelectedIteration={setSelectedIteration}
                    classType={selectedClassType}
                />
            )}
        </div>
    );
}
