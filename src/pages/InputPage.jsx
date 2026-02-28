import React, { useEffect, useRef, useState } from 'react';
import { Api } from '../api';
import YearPicker from '../components/YearPicker.jsx';
import ClassList from '../components/ClassList.jsx';
import Analytics from './Analytics.jsx';
import History from './History.jsx';
import MenuDropdown from '../components/MenuDropdown.jsx';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
const YEAR_NOW = new Date().getFullYear();
const STORAGE_KEY = 'unirating_b_params_v2';
const STORAGE_KEY_ITERATION = 'selected_iteration';

const DEFAULT_B_PARAMS = {
    ENa: '',
    ENb: '',
    ENc: '',
    Eb: '',
    Ec: '',
    beta121: '',
    beta122: '',
    beta131: '',
    beta132: '',
    beta211: '',
    beta212: '',
    // extended inputs
    NBP: '',
    NMP: '',
    ACP: '',
    OPC: '',
    ACC: '',
    PKP: '',
    PPP: '',
    NP: '',
    NOA: '',
    NAP: '',
    B25_o: '',
    B26_o: '',
    UT: '',
    DO: '',
    N: '',
    Npr: '',
    VO: '',
    PO: '',
    B33_o: '',
    // inputs for B34..B44
    NR2023: '',
    NR2024: '',
    NR2025: '',
    WL2022: '',
    WL2023: '',
    WL2024: '',
    NPR2022: '',
    NPR2023: '',
    NPR2024: '',
    DN2022: '',
    DN2023: '',
    DN2024: '',
    Io: '',
    Iv: '',
    Iz: '',
    No: '',
    Nv: '',
    Nz: '',
    OD2022: '',
    OD2023: '',
    OD2024: '',
    PN2022: '',
    PN2023: '',
    PN2024: '',
};

function normalizeNumber(v) {
    if (v === '' || v == null) return null;
    const n = Number(String(v).replace(',', '.'));
    return Number.isNaN(n) ? null : n;
}

function buildExportPayload(years, paramsB) {
    const bData = years
        .map((year) => {
            const p = paramsB[year] || DEFAULT_B_PARAMS;
            return {
                year,
                ENa: normalizeNumber(p.ENa),
                ENb: normalizeNumber(p.ENb),
                ENc: normalizeNumber(p.ENc),
                Eb: normalizeNumber(p.Eb),
                Ec: normalizeNumber(p.Ec),
                beta121: normalizeNumber(p.beta121),
                beta122: normalizeNumber(p.beta122),
                beta131: normalizeNumber(p.beta131),
                beta132: normalizeNumber(p.beta132),
                beta211: normalizeNumber(p.beta211),
                beta212: normalizeNumber(p.beta212),
                // extended
                NBP: normalizeNumber(p.NBP),
                NMP: normalizeNumber(p.NMP),
                ACP: normalizeNumber(p.ACP),
                OPC: normalizeNumber(p.OPC),
                ACC: normalizeNumber(p.ACC),
                PKP: normalizeNumber(p.PKP),
                PPP: normalizeNumber(p.PPP),
                NP: normalizeNumber(p.NP),
                NOA: normalizeNumber(p.NOA),
                NAP: normalizeNumber(p.NAP),
                B25_o: normalizeNumber(p.B25_o),
                B26_o: normalizeNumber(p.B26_o),
                UT: normalizeNumber(p.UT),
                DO: normalizeNumber(p.DO),
                N: normalizeNumber(p.N),
                Npr: normalizeNumber(p.Npr),
                VO: normalizeNumber(p.VO),
                PO: normalizeNumber(p.PO),
                B33_o: normalizeNumber(p.B33_o),
                // additional inputs for B34..B44
                NR2023: normalizeNumber(p.NR2023),
                NR2024: normalizeNumber(p.NR2024),
                NR2025: normalizeNumber(p.NR2025),
                WL2022: normalizeNumber(p.WL2022),
                WL2023: normalizeNumber(p.WL2023),
                WL2024: normalizeNumber(p.WL2024),
                NPR2022: normalizeNumber(p.NPR2022),
                NPR2023: normalizeNumber(p.NPR2023),
                NPR2024: normalizeNumber(p.NPR2024),
                DN2022: normalizeNumber(p.DN2022),
                DN2023: normalizeNumber(p.DN2023),
                DN2024: normalizeNumber(p.DN2024),
                Io: normalizeNumber(p.Io),
                Iv: normalizeNumber(p.Iv),
                Iz: normalizeNumber(p.Iz),
                No: normalizeNumber(p.No),
                Nv: normalizeNumber(p.Nv),
                Nz: normalizeNumber(p.Nz),
                OD2022: normalizeNumber(p.OD2022),
                OD2023: normalizeNumber(p.OD2023),
                OD2024: normalizeNumber(p.OD2024),
                PN2022: normalizeNumber(p.PN2022),
                PN2023: normalizeNumber(p.PN2023),
                PN2024: normalizeNumber(p.PN2024),
            };
        })
        .filter((row) => row.year);

    return {
        classes: [
            {
                classType: 'B',
                data: bData,
            },
        ],
    };
}

export default function InputPage() {
    const [currentYear, setCurrentYear] = useState(YEAR_NOW);
    const [years, setYears] = useState([YEAR_NOW]);
    const [paramsB, setParamsB] = useState({ [YEAR_NOW]: { ...DEFAULT_B_PARAMS } });
    const [busy, setBusy] = useState(false);
    // To avoid autosave on first page load
    const [isFromStorageFilled, setIsFromStorageFilled] = useState(false);
    const fileRef = useRef(null);

    // ---------------- For Analytics.jsx ----------------
    const [rows, setRows] = useState([]);
    const [metricNames, setMetricNames] = useState({
        codeB11: 'B11',
        codeB12: 'B12',
        codeB13: 'B13',
        codeB21: 'B21',
    });

    // ---------------- For History.jsx ----------------
    const [items, setItems] = useState([]);
    const [selectedIteration, setSelectedIteration] = useState(0);

    // ---------------- 1. Загрузка на старте ----------------
    useEffect(() => {
        let _isFromStorageFilled = false;
        const _selectedIteration = +localStorage.getItem(STORAGE_KEY_ITERATION) || 0;
        setSelectedIteration(_selectedIteration)

        // const raw = localStorage.setItem(STORAGE_KEY_ITERATION, );

        // localStorage.clear()
        // try {
        //     const raw = localStorage.getItem(STORAGE_KEY);
        //     if (raw) {
        //         const saved = JSON.parse(raw);
        //         if (
        //             saved &&
        //             Array.isArray(saved.years) &&
        //             saved.years.length > 0 &&
        //             typeof saved.currentYear === 'number' &&
        //             typeof saved.paramsB === 'object'
        //         ) {
        //             setYears(saved.years);
        //             setCurrentYear(saved.currentYear);
        //             setParamsB(saved.paramsB);

        //             setIsFromStorageFilled(true);
        //             _isFromStorageFilled = true;
        //         }
        //     }
        // } catch (e) {
        //     console.warn('Ошибка чтения состояния из localStorage', e);
        // }

        // if (_isFromStorageFilled) return;

        Api.exportParams()
            .then(object => {
                const classB = object.classes.filter(c => c.classType === "B")[0];
                const data = classB?.data || [];

                if (!data || !data.length) return;
                const map = {};
                const ys = [];
                for (const row of data) {
                    ys.push(row.year);

                    map[row.year] = {
                        ENa: row.ENa ?? '',
                        ENb: row.ENb ?? '',
                        ENc: row.ENc ?? '',
                        Eb: row.Eb ?? '',
                        Ec: row.Ec ?? '',
                        beta121: row.beta121 ?? '',
                        beta122: row.beta122 ?? '',
                        beta131: row.beta131 ?? '',
                        beta132: row.beta132 ?? '',
                        beta211: row.beta211 ?? '',
                        beta212: row.beta212 ?? '',
                        // extended
                        NBP: row.NBP ?? '',
                        NMP: row.NMP ?? '',
                        ACP: row.ACP ?? '',
                        OPC: row.OPC ?? '',
                        ACC: row.ACC ?? '',
                        PKP: row.PKP ?? '',
                        PPP: row.PPP ?? '',
                        NP: row.NP ?? '',
                        NOA: row.NOA ?? '',
                        NAP: row.NAP ?? '',
                        B25_o: row.B25_o ?? '',
                        B26_o: row.B26_o ?? '',
                        UT: row.UT ?? '',
                        DO: row.DO ?? '',
                        N: row.N ?? '',
                        Npr: row.Npr ?? '',
                        VO: row.VO ?? '',
                        PO: row.PO ?? '',
                        B33_o: row.B33_o ?? '',
                        // new
                        NR2023: row.NR2023 ?? '',
                        NR2024: row.NR2024 ?? '',
                        NR2025: row.NR2025 ?? '',
                        WL2022: row.WL2022 ?? '',
                        WL2023: row.WL2023 ?? '',
                        WL2024: row.WL2024 ?? '',
                        NPR2022: row.NPR2022 ?? '',
                        NPR2023: row.NPR2023 ?? '',
                        NPR2024: row.NPR2024 ?? '',
                        DN2022: row.DN2022 ?? '',
                        DN2023: row.DN2023 ?? '',
                        DN2024: row.DN2024 ?? '',
                        Io: row.Io ?? '',
                        Iv: row.Iv ?? '',
                        Iz: row.Iz ?? '',
                        No: row.No ?? '',
                        Nv: row.Nv ?? '',
                        Nz: row.Nz ?? '',
                        OD2022: row.OD2022 ?? '',
                        OD2023: row.OD2023 ?? '',
                        OD2024: row.OD2024 ?? '',
                        PN2022: row.PN2022 ?? '',
                        PN2023: row.PN2023 ?? '',
                        PN2024: row.PN2024 ?? '',
                    };
                }

                const uniqueYears = [...new Set(ys)].sort((a, b) => b - a);

                setYears(uniqueYears);
                setCurrentYear(uniqueYears[0]);
                setParamsB(map);
            })
            .catch(() => { })
            .finally(() => {
                const payload = { years, currentYear, paramsB };
                localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
            })

        // ---------------- For Analytics.jsx and History.jsx ----------------
        Api.getHistoryAll()
            .then(object => {
                const items = object.classes.filter(c => c.classType === "B")[0].items
                let results = []

                if (items.length) {
                    results = selectedIteration
                        ? items.find(item => item.iter === _selectedIteration)?.results
                        : items.reduce((maxItem, item) => item.iter > maxItem.iter ? item : maxItem).results;

                    const firstRes = results[0] || {};
                    const newNames = {};
                    Object.keys(firstRes).forEach((k) => {
                        if (k.startsWith('codeB')) {
                            newNames[k] = firstRes[k] || k.toUpperCase();
                        }
                    });
                    setMetricNames(newNames);
                }

                setRows(results)
                setItems(items)
            })
    }, [selectedIteration]);

    // ---------------- 2. Автосохранение ----------------
    useEffect(() => {
        if (!isFromStorageFilled) return;

        const payload = { years, currentYear, paramsB };
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
        } catch (e) {
            console.warn('Ошибка сохранения в localStorage', e);
        }
    }, [years, currentYear, paramsB]);

    const ensureYear = (year) => {
        setYears((ys) => (ys.includes(year) ? ys : [...ys, year].sort((a, b) => a - b)));
        setParamsB((state) => ({
            ...state,
            [year]: state[year] || { ...DEFAULT_B_PARAMS },
        }));
    };

    const handleYearChange = (year) => {
        ensureYear(year);
        setCurrentYear(year);
    };

    const handleParamChange = (key, value) => {
        setParamsB((state) => ({
            ...state,
            [currentYear]: {
                ...(state[currentYear] || { ...DEFAULT_B_PARAMS }),
                [key]: value,
            },
        }));
    };

    // ---------------- 3. Очистить всё ----------------
    const clearAll = async () => {
        if (busy) return;
        setBusy(true);
        try {
            setParamsB({ [YEAR_NOW]: { ...DEFAULT_B_PARAMS } });
            setYears([YEAR_NOW]);
            setCurrentYear(YEAR_NOW);
            localStorage.removeItem(STORAGE_KEY);
            await Api.clearCurrent();
        } catch (e) {
            alert('Ошибка очистки: ' + (e?.message || e));
        } finally {
            setBusy(false);
        }
    };

    // Удалить только текущий год
    const handleDeleteCurrentYear = () => {
        setParamsB((prev) => {
            const copy = { ...prev };
            delete copy[currentYear];
            if (!Object.keys(copy).length) {
                copy[YEAR_NOW] = { ...DEFAULT_B_PARAMS };
            }
            return copy;
        });

        setYears((prevYears) => {
            const filtered = prevYears.filter((y) => y !== currentYear);
            const finalYears = filtered.length ? filtered.sort((a, b) => a - b) : [YEAR_NOW];
            setCurrentYear(finalYears[0]);
            return finalYears;
        });
    };

    // ---------------- 4. Экспорт / импорт ----------------
    const handleExport = () => {
        try {
            const payload = buildExportPayload(years, paramsB);

            const blob = new Blob([JSON.stringify(payload, null, 2)], {
                type: 'application/json;charset=utf-8',
            });

            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');

            a.href = url;
            a.download = `rating-params-${stamp}.json`;

            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);
        } catch (e) {
            alert('Ошибка экспорта: ' + (e?.message || e));
        } finally {
        }
    };

    const handleImportClick = () => {
        if (busy) return;
        fileRef.current?.click();
    };

    const handleFileSelected = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        try {
            const text = await file.text();
            const json = JSON.parse(text);
            if (!json || !Array.isArray(json.classes)) throw new Error('Неверный формат JSON');

            const bBlock = json.classes.find((c) => c.classType === 'B');
            if (!bBlock || !Array.isArray(bBlock.data)) throw new Error('Нет данных класса B');

            const map = {};
            const ys = [];
            for (const row of bBlock.data) {
                if (!row.year) continue;
                ys.push(row.year);
                map[row.year] = {
                    ENa: row.ENa ?? '',
                    ENb: row.ENb ?? '',
                    ENc: row.ENc ?? '',
                    Eb: row.Eb ?? '',
                    Ec: row.Ec ?? '',
                    beta121: row.beta121 ?? '',
                    beta122: row.beta122 ?? '',
                    beta131: row.beta131 ?? '',
                    beta132: row.beta132 ?? '',
                    beta211: row.beta211 ?? '',
                    beta212: row.beta212 ?? '',
                    // extended
                    NBP: row.NBP ?? '',
                    NMP: row.NMP ?? '',
                    ACP: row.ACP ?? '',
                    OPC: row.OPC ?? '',
                    ACC: row.ACC ?? '',
                    PKP: row.PKP ?? '',
                    PPP: row.PPP ?? '',
                    NP: row.NP ?? '',
                    NOA: row.NOA ?? '',
                    NAP: row.NAP ?? '',
                    B25_o: row.B25_o ?? '',
                    B26_o: row.B26_o ?? '',
                    UT: row.UT ?? '',
                    DO: row.DO ?? '',
                    N: row.N ?? '',
                    Npr: row.Npr ?? '',
                    VO: row.VO ?? '',
                    PO: row.PO ?? '',
                    B33_o: row.B33_o ?? '',
                };
            }
            const uniqueYears = [...new Set(ys)].sort((a, b) => a - b);
            if (!uniqueYears.length) throw new Error('Пустые данные');

            setParamsB(map);
            setYears(uniqueYears);
            setCurrentYear(uniqueYears[0]);

            const payload = {
                years: uniqueYears,
                currentYear: uniqueYears[0],
                paramsB: map,
            };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));

            alert('Импорт выполнен');
        } catch (err) {
            alert('Ошибка импорта: ' + err.message);
        } finally {
            e.target.value = '';
        }
    };

    const handleAddYear = (year) => {
        setYears((prev) =>
            prev.includes(year) ? prev.slice().sort((a, b) => a - b) : [...prev, year].sort((a, b) => a - b),
        );
        setCurrentYear(year);
        setParamsB((state) => ({
            ...state,
            [year]: state[year] || { ...DEFAULT_B_PARAMS },
        }));
    };

    // ---------------- 5. Расчёт ----------------
    const handleCompute = async () => {
        setBusy(true);
        try {
            const delay = 500;
            const payload = buildExportPayload(years, paramsB);
            const object = await Api.calcMulti(payload);

            const iteration = object.classes.filter(c => c.classType === "B")[0].data[0].iteration
            setSelectedIteration(iteration);
            localStorage.setItem(STORAGE_KEY_ITERATION, String(iteration)),

                toast.success('Расчёт выполнен',
                    {
                        autoClose: delay
                    });
        } catch (err) {
            alert('Ошибка расчёта: ' + err.message);
        } finally {
            setBusy(false);
        }
    };

    const params = paramsB[currentYear] || DEFAULT_B_PARAMS;

    const fieldsByGroup = {
        1: [
            ['ENa', 'ENa'],
            ['ENb', 'ENb'],
            ['ENc', 'ENc'],
            ['Eb', 'Eb'],
            ['Ec', 'Ec'],
        ],
        2: [
            ['beta121', 'β121'],
            ['beta122', 'β122'],
        ],
        3: [
            ['beta131', 'β131'],
            ['beta132', 'β132'],
        ],
        4: [
            ['beta211', 'β211'],
            ['beta212', 'β212'],
        ],
        // extended metric groups (generic headings)
        5: [
            ['NBP','NBP'],
            ['NMP','NMP'],
            ['ACP','ACP'],
            ['OPC','OPC'],
            ['ACC','ACC'],
        ],
        6: [
            ['PKP','PKP'],
            ['PPP','PPP'],
            ['NP','NP'],
            ['NOA','NOA'],
        ],
        7: [['NAP','NAP']],
        8: [
            ['B25_o','B25_o'],
            ['B26_o','B26_o'],
        ],
        9: [
            ['UT','UT'],
            ['DO','DO'],
        ],
        10: [
            ['N','N'],
            ['Npr','Npr'],
            ['VO','VO'],
            ['PO','PO'],
        ],
        11: [['B33_o','B33_o']],
        // new input groups for formulas B34..B44
        12: [
            ['NR2023','NR2023'],
            ['NR2024','NR2024'],
            ['NR2025','NR2025'],
        ],
        13: [
            ['WL2022','WL2022'],
            ['WL2023','WL2023'],
            ['WL2024','WL2024'],
            ['NPR2022','NPR2022'],
            ['NPR2023','NPR2023'],
            ['NPR2024','NPR2024'],
        ],
        14: [
            ['DN2022','DN2022'],
            ['DN2023','DN2023'],
            ['DN2024','DN2024'],
        ],
        15: [
            ['Io','Io'],
            ['Iv','Iv'],
            ['Iz','Iz'],
            ['No','No'],
            ['Nv','Nv'],
            ['Nz','Nz'],
        ],
        16: [
            ['OD2022','OD2022'],
            ['OD2023','OD2023'],
            ['OD2024','OD2024'],
            ['PN2022','PN2022'],
            ['PN2023','PN2023'],
            ['PN2024','PN2024'],
        ],
    };

    return (
        <>
            <Analytics
                rows={rows}
                metricNames={Object.keys(metricNames)}
                setMetricNames={setMetricNames}
            />
            <div className="card big-card">
                <div className="card-header-row">
                    <div className="left-header">
                        <YearPicker
                            years={years}
                            currentYear={currentYear}
                            onYearChange={handleYearChange}
                            onAddYear={handleAddYear}
                        />
                    </div>
                    <div className="right-header">
                        <div className="menu-wrapper">
                            <MenuDropdown
                                menuItems={[
                                    { label: 'Импорт JSON', onClick: handleImportClick },
                                    { label: 'Экспорт JSON', onClick: handleExport },
                                    { label: 'Удалить текущий год', onClick: handleDeleteCurrentYear },
                                    { label: 'Очистить всё', onClick: clearAll },
                                ]}
                                disabled={busy}
                            />
                            <input
                                ref={fileRef}
                                type="file"
                                accept="application/json"
                                style={{ display: 'none' }}
                                onChange={handleFileSelected}
                            />
                        </div>
                    </div>
                </div>

                <div className="input-grid">
                    <ClassList
                        className="Класс A"
                        fieldsByGroup={{}}
                        params={{}}
                        handleParamChange={handleParamChange}
                        metricNames={{}}
                    />
                    <ClassList
                        className="Класс B"
                        fieldsByGroup={fieldsByGroup}
                        params={params}
                        handleParamChange={handleParamChange}
                        metricNames={metricNames}
                    />
                    <ClassList
                        className="Класс C"
                        fieldsByGroup={{}}
                        params={{}}
                        handleParamChange={handleParamChange}
                        metricNames={{}}
                    />
                </div>

                <div className="card-footer">
                    <button
                        className="primary-btn big-btn spinner-btn"
                        disabled={busy}
                        onClick={handleCompute}
                    >
                        {busy ? (
                            <>
                                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                <span>Считаем</span>
                            </>
                        ) : ('Рассчитать')}

                    </button>
                </div>
                <ToastContainer position="bottom-right" />
            </div>
            <History
                items={items}
                setRows={setRows}
                selectedIteration={selectedIteration}
                setSelectedIteration={setSelectedIteration}
            />
        </>
    );
}
