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
const B25_B26_START_YEAR = 2022;
const STORAGE_KEY = 'unirating_b_params_v2';
const STORAGE_KEY_ITERATION = 'selected_iteration';
const STORAGE_KEY_INPUT_MODE = 'b_input_mode';

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
    NBo: '',
    NBv: '',
    NBz: '',
    NMo: '',
    NMv: '',
    NMz: '',
    ACo: '',
    ACv: '',
    ACz: '',
    OPC: '',
    ACC: '',
    KPo: '',
    KPv: '',
    KPz: '',
    PPPo: '',
    PPPv: '',
    PPPz: '',
    NPo: '',
    NPv: '',
    NPz: '',
    NOA: '',
    NAo: '',
    NAv: '',
    NAz: '',
    PNo: '',
    PNv: '',
    PNz: '',
    k: '3',
    CHPSi2022: '',
    CHPi2022: '',
    CHOSi2022: '',
    CHOi2022: '',
    CHPSi2023: '',
    CHPi2023: '',
    CHOSi2023: '',
    CHOi2023: '',
    CHPSi2024: '',
    CHPi2024: '',
    CHOSi2024: '',
    CHOi2024: '',
    UT: '',
    DO: '',
    N: '',
    Npr: '',
    VO: '',
    PO: '',
    B33: '',
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
    NO2022: '',
    NV2022: '',
    NZ2022: '',
    NOA2022: '',
    NO2023: '',
    NV2023: '',
    NZ2023: '',
    NOA2023: '',
    NO2024: '',
    NV2024: '',
    NZ2024: '',
    NOA2024: '',
    DI: '',
    // direct metric input mode (final values)
    B11: '',
    B12: '',
    B13: '',
    B21: '',
    B22: '',
    B23: '',
    B24: '',
    B25: '',
    B26: '',
    B31: '',
    B32: '',
    B33Result: '',
    B34: '',
    B41: '',
    B42: '',
    B43: '',
    B44: '',
};

function normalizeNumber(v) {
    if (v === '' || v == null) return null;
    const n = Number(String(v).replace(',', '.'));
    return Number.isNaN(n) ? null : n;
}

function getKYears(params) {
    const raw = Number(String(params?.k ?? '').replace(',', '.'));
    const k = Number.isFinite(raw) ? Math.round(raw) : 3;
    return Math.max(1, k);
}

function yearsByKFrom(startYear, k) {
    return Array.from({ length: Math.max(1, k) }, (_, i) => startYear + i);
}

function yearsByK(k) {
    return yearsByKFrom(B25_B26_START_YEAR, k);
}

function rollingYearsFrom(endYear, k, minStartYear) {
    const safeK = Math.max(1, k);
    const safeEndYear = Number.isFinite(endYear) ? endYear : YEAR_NOW;
    const startYear = Math.max(minStartYear, safeEndYear - safeK + 1);
    return Array.from({ length: safeK }, (_, i) => startYear + i);
}

function firstDefinedValue(...values) {
    for (const value of values) {
        if (value !== undefined && value !== null && value !== '') return value;
    }
    return '';
}

function buildExportPayload(years, paramsB) {
    const bData = years
        .map((year) => {
            const p = paramsB[year] || DEFAULT_B_PARAMS;
            const kYears = getKYears(p);
            const row = {
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
                NBo: normalizeNumber(p.NBo),
                NBv: normalizeNumber(p.NBv),
                NBz: normalizeNumber(p.NBz),
                NMo: normalizeNumber(p.NMo),
                NMv: normalizeNumber(p.NMv),
                NMz: normalizeNumber(p.NMz),
                ACo: normalizeNumber(p.ACo),
                ACv: normalizeNumber(p.ACv),
                ACz: normalizeNumber(p.ACz),
                OPC: normalizeNumber(p.OPC),
                ACC: normalizeNumber(p.ACC),
                KPo: normalizeNumber(p.KPo),
                KPv: normalizeNumber(p.KPv),
                KPz: normalizeNumber(p.KPz),
                PPPo: normalizeNumber(p.PPPo),
                PPPv: normalizeNumber(p.PPPv),
                PPPz: normalizeNumber(p.PPPz),
                NPo: normalizeNumber(p.NPo),
                NPv: normalizeNumber(p.NPv),
                NPz: normalizeNumber(p.NPz),
                NOA: normalizeNumber(p.NOA),
                NAo: normalizeNumber(p.NAo),
                NAv: normalizeNumber(p.NAv),
                NAz: normalizeNumber(p.NAz),
                PNo: normalizeNumber(p.PNo),
                PNv: normalizeNumber(p.PNv),
                PNz: normalizeNumber(p.PNz),
                k: kYears,
                UT: normalizeNumber(p.UT),
                DO: normalizeNumber(p.DO),
                N: normalizeNumber(p.N),
                Npr: normalizeNumber(p.Npr),
                VO: normalizeNumber(p.VO),
                PO: normalizeNumber(p.PO),
                B33_o: normalizeNumber(firstDefinedValue(p.B33, p.B33_o)),
                B33: normalizeNumber(firstDefinedValue(p.B33Result)),
                Io: normalizeNumber(p.Io),
                Iv: normalizeNumber(p.Iv),
                Iz: normalizeNumber(p.Iz),
                No: normalizeNumber(p.No),
                Nv: normalizeNumber(p.Nv),
                Nz: normalizeNumber(p.Nz),
                DI: normalizeNumber(p.DI),
                DIo: normalizeNumber(firstDefinedValue(p.DIo, p.DI)),
                DIv: normalizeNumber(p.DIv),
                DIz: normalizeNumber(p.DIz),
                B11: normalizeNumber(p.B11),
                B12: normalizeNumber(p.B12),
                B13: normalizeNumber(p.B13),
                B21: normalizeNumber(p.B21),
                B22: normalizeNumber(p.B22),
                B23: normalizeNumber(p.B23),
                B24: normalizeNumber(p.B24),
                B25: normalizeNumber(p.B25),
                B26: normalizeNumber(p.B26),
                B31: normalizeNumber(p.B31),
                B32: normalizeNumber(p.B32),
                B33Result: normalizeNumber(firstDefinedValue(p.B33Result)),
                B34: normalizeNumber(p.B34),
                B41: normalizeNumber(p.B41),
                B42: normalizeNumber(p.B42),
                B43: normalizeNumber(p.B43),
                B44: normalizeNumber(p.B44),
            };

            for (const y of yearsByKFrom(2023, kYears)) {
                row[`NR${y}`] = normalizeNumber(p[`NR${y}`]);
            }
            for (const y of yearsByKFrom(2022, kYears)) {
                row[`WL${y}`] = normalizeNumber(p[`WL${y}`]);
                row[`NPR${y}`] = normalizeNumber(p[`NPR${y}`]);
                row[`DN${y}`] = normalizeNumber(p[`DN${y}`]);
                row[`OD${y}`] = normalizeNumber(p[`OD${y}`]);
                row[`NO${y}`] = normalizeNumber(p[`NO${y}`]);
                row[`NV${y}`] = normalizeNumber(p[`NV${y}`]);
                row[`NZ${y}`] = normalizeNumber(p[`NZ${y}`]);
                row[`NOA${y}`] = normalizeNumber(p[`NOA${y}`]);
            }

            for (const y of yearsByK(kYears)) {
                row[`CHPSi${y}`] = normalizeNumber(p[`CHPSi${y}`]);
                row[`CHPi${y}`] = normalizeNumber(p[`CHPi${y}`]);
                row[`CHOSi${y}`] = normalizeNumber(p[`CHOSi${y}`]);
                row[`CHOi${y}`] = normalizeNumber(p[`CHOi${y}`]);
            }

            return row;
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
    const [inputMode, setInputMode] = useState(() => localStorage.getItem(STORAGE_KEY_INPUT_MODE) || 'metrics');

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY_INPUT_MODE, inputMode);
    }, [inputMode]);

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
                        NBo: firstDefinedValue(row.NBo, row.NBP),
                        NBv: firstDefinedValue(row.NBv, ''),
                        NBz: firstDefinedValue(row.NBz, ''),
                        NMo: firstDefinedValue(row.NMo, row.NMP),
                        NMv: firstDefinedValue(row.NMv, ''),
                        NMz: firstDefinedValue(row.NMz, ''),
                        ACo: firstDefinedValue(row.ACo, row.ACP),
                        ACv: firstDefinedValue(row.ACv, ''),
                        ACz: firstDefinedValue(row.ACz, ''),
                        OPC: row.OPC ?? '',
                        ACC: row.ACC ?? '',
                        KPo: firstDefinedValue(row.KPo, row.PKP),
                        KPv: firstDefinedValue(row.KPv, ''),
                        KPz: firstDefinedValue(row.KPz, ''),
                        PPPo: firstDefinedValue(row.PPPo, row.PPP),
                        PPPv: firstDefinedValue(row.PPPv, ''),
                        PPPz: firstDefinedValue(row.PPPz, ''),
                        NPo: firstDefinedValue(row.NPo, row.No),
                        NPv: firstDefinedValue(row.NPv, row.Nv),
                        NPz: firstDefinedValue(row.NPz, row.Nz),
                        NOA: row.NOA ?? '',
                        NAo: firstDefinedValue(row.NAo, row.NAP),
                        NAv: firstDefinedValue(row.NAv, ''),
                        NAz: firstDefinedValue(row.NAz, ''),
                        PNo: firstDefinedValue(row.PNo, ''),
                        PNv: firstDefinedValue(row.PNv, ''),
                        PNz: firstDefinedValue(row.PNz, ''),
                        k: firstDefinedValue(row.k, row.K, 3),
                        UT: row.UT ?? '',
                        DO: row.DO ?? '',
                        N: row.N ?? '',
                        Npr: row.Npr ?? '',
                        VO: row.VO ?? '',
                        PO: row.PO ?? '',
                        B33: firstDefinedValue(row.B33_o, row.B33_0),
                        Io: row.Io ?? '',
                        Iv: row.Iv ?? '',
                        Iz: row.Iz ?? '',
                        No: row.No ?? '',
                        Nv: row.Nv ?? '',
                        Nz: row.Nz ?? '',
                        DI: firstDefinedValue(row.DI, row.DIo),
                        B11: firstDefinedValue(row.B11, row.b11),
                        B12: firstDefinedValue(row.B12, row.b12),
                        B13: firstDefinedValue(row.B13, row.b13),
                        B21: firstDefinedValue(row.B21, row.b21),
                        B22: firstDefinedValue(row.B22, row.b22),
                        B23: firstDefinedValue(row.B23, row.b23),
                        B24: firstDefinedValue(row.B24, row.b24),
                        B25: firstDefinedValue(row.B25, row.b25),
                        B26: firstDefinedValue(row.B26, row.b26),
                        B31: firstDefinedValue(row.B31, row.b31),
                        B32: firstDefinedValue(row.B32, row.b32),
                        B33Result: firstDefinedValue(row.B33Result, row.B33, row.b33),
                        B34: firstDefinedValue(row.B34, row.b34),
                        B41: firstDefinedValue(row.B41, row.b41),
                        B42: firstDefinedValue(row.B42, row.b42),
                        B43: firstDefinedValue(row.B43, row.b43),
                        B44: firstDefinedValue(row.B44, row.b44),
                    };

                    const dynamicYears = yearsByK(getKYears(map[row.year]));
                    for (const y of dynamicYears) {
                        map[row.year][`CHPSi${y}`] = firstDefinedValue(row[`CHPSi${y}`], row[`ЧПСi${y}`], row[`CPSi${y}`]);
                        map[row.year][`CHPi${y}`] = firstDefinedValue(row[`CHPi${y}`], row[`ЧПi${y}`], row[`CPi${y}`]);
                        map[row.year][`CHOSi${y}`] = firstDefinedValue(row[`CHOSi${y}`], row[`ЧОСi${y}`], row[`COSi${y}`]);
                        map[row.year][`CHOi${y}`] = firstDefinedValue(row[`CHOi${y}`], row[`ЧОi${y}`], row[`COi${y}`]);
                    }
                    for (const y of yearsByKFrom(2023, getKYears(map[row.year]))) {
                        map[row.year][`NR${y}`] = firstDefinedValue(row[`NR${y}`]);
                    }
                    for (const y of yearsByKFrom(2022, getKYears(map[row.year]))) {
                        map[row.year][`WL${y}`] = firstDefinedValue(row[`WL${y}`]);
                        map[row.year][`NPR${y}`] = firstDefinedValue(row[`NPR${y}`]);
                        map[row.year][`DN${y}`] = firstDefinedValue(row[`DN${y}`]);
                        map[row.year][`OD${y}`] = firstDefinedValue(row[`OD${y}`]);
                        map[row.year][`NO${y}`] = firstDefinedValue(row[`NO${y}`], row[`No${y}`]);
                        map[row.year][`NV${y}`] = firstDefinedValue(row[`NV${y}`], row[`Nv${y}`]);
                        map[row.year][`NZ${y}`] = firstDefinedValue(row[`NZ${y}`], row[`Nz${y}`]);
                        map[row.year][`NOA${y}`] = firstDefinedValue(row[`NOA${y}`], row[`Noa${y}`]);
                    }
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
                    NBo: firstDefinedValue(row.NBo, row.NBP),
                    NBv: firstDefinedValue(row.NBv, ''),
                    NBz: firstDefinedValue(row.NBz, ''),
                    NMo: firstDefinedValue(row.NMo, row.NMP),
                    NMv: firstDefinedValue(row.NMv, ''),
                    NMz: firstDefinedValue(row.NMz, ''),
                    ACo: firstDefinedValue(row.ACo, row.ACP),
                    ACv: firstDefinedValue(row.ACv, ''),
                    ACz: firstDefinedValue(row.ACz, ''),
                    OPC: row.OPC ?? '',
                    ACC: row.ACC ?? '',
                    KPo: firstDefinedValue(row.KPo, row.PKP),
                    KPv: firstDefinedValue(row.KPv, ''),
                    KPz: firstDefinedValue(row.KPz, ''),
                    PPPo: firstDefinedValue(row.PPPo, row.PPP),
                    PPPv: firstDefinedValue(row.PPPv, ''),
                    PPPz: firstDefinedValue(row.PPPz, ''),
                    NPo: firstDefinedValue(row.NPo, row.No),
                    NPv: firstDefinedValue(row.NPv, row.Nv),
                    NPz: firstDefinedValue(row.NPz, row.Nz),
                    NOA: row.NOA ?? '',
                    NAo: firstDefinedValue(row.NAo, row.NAP),
                    NAv: firstDefinedValue(row.NAv, ''),
                    NAz: firstDefinedValue(row.NAz, ''),
                    PNo: firstDefinedValue(row.PNo, ''),
                    PNv: firstDefinedValue(row.PNv, ''),
                    PNz: firstDefinedValue(row.PNz, ''),
                    k: firstDefinedValue(row.k, row.K, 3),
                    UT: row.UT ?? '',
                    DO: row.DO ?? '',
                    N: row.N ?? '',
                    Npr: row.Npr ?? '',
                    VO: row.VO ?? '',
                    PO: row.PO ?? '',
                    B33: firstDefinedValue(row.B33_o, row.B33_0),
                    Io: row.Io ?? '',
                    Iv: row.Iv ?? '',
                    Iz: row.Iz ?? '',
                    No: row.No ?? '',
                    Nv: row.Nv ?? '',
                    Nz: row.Nz ?? '',
                    DI: firstDefinedValue(row.DI, row.DIo),
                    B11: firstDefinedValue(row.B11, row.b11),
                    B12: firstDefinedValue(row.B12, row.b12),
                    B13: firstDefinedValue(row.B13, row.b13),
                    B21: firstDefinedValue(row.B21, row.b21),
                    B22: firstDefinedValue(row.B22, row.b22),
                    B23: firstDefinedValue(row.B23, row.b23),
                    B24: firstDefinedValue(row.B24, row.b24),
                    B25: firstDefinedValue(row.B25, row.b25),
                    B26: firstDefinedValue(row.B26, row.b26),
                    B31: firstDefinedValue(row.B31, row.b31),
                    B32: firstDefinedValue(row.B32, row.b32),
                    B33Result: firstDefinedValue(row.B33Result, row.B33, row.b33),
                    B34: firstDefinedValue(row.B34, row.b34),
                    B41: firstDefinedValue(row.B41, row.b41),
                    B42: firstDefinedValue(row.B42, row.b42),
                    B43: firstDefinedValue(row.B43, row.b43),
                    B44: firstDefinedValue(row.B44, row.b44),
                };

                const dynamicYears = yearsByK(getKYears(map[row.year]));
                for (const y of dynamicYears) {
                    map[row.year][`CHPSi${y}`] = firstDefinedValue(row[`CHPSi${y}`], row[`ЧПСi${y}`], row[`CPSi${y}`]);
                    map[row.year][`CHPi${y}`] = firstDefinedValue(row[`CHPi${y}`], row[`ЧПi${y}`], row[`CPi${y}`]);
                    map[row.year][`CHOSi${y}`] = firstDefinedValue(row[`CHOSi${y}`], row[`ЧОСi${y}`], row[`COSi${y}`]);
                    map[row.year][`CHOi${y}`] = firstDefinedValue(row[`CHOi${y}`], row[`ЧОi${y}`], row[`COi${y}`]);
                }
                for (const y of yearsByKFrom(2023, getKYears(map[row.year]))) {
                    map[row.year][`NR${y}`] = firstDefinedValue(row[`NR${y}`]);
                }
                for (const y of yearsByKFrom(2022, getKYears(map[row.year]))) {
                    map[row.year][`WL${y}`] = firstDefinedValue(row[`WL${y}`]);
                    map[row.year][`NPR${y}`] = firstDefinedValue(row[`NPR${y}`]);
                    map[row.year][`DN${y}`] = firstDefinedValue(row[`DN${y}`]);
                    map[row.year][`OD${y}`] = firstDefinedValue(row[`OD${y}`]);
                    map[row.year][`NO${y}`] = firstDefinedValue(row[`NO${y}`], row[`No${y}`]);
                    map[row.year][`NV${y}`] = firstDefinedValue(row[`NV${y}`], row[`Nv${y}`]);
                    map[row.year][`NZ${y}`] = firstDefinedValue(row[`NZ${y}`], row[`Nz${y}`]);
                    map[row.year][`NOA${y}`] = firstDefinedValue(row[`NOA${y}`], row[`Noa${y}`]);
                }
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

    const kYears = getKYears(params);
    const canonicalYears2022 = yearsByK(kYears);
    const canonicalYears2023 = yearsByKFrom(2023, kYears);
    const visualYears2022 = rollingYearsFrom(currentYear, kYears, 2022);
    const visualYears2023 = rollingYearsFrom(currentYear, kYears, 2023);

    const b25Fields = (() => {
        const out = [['k', 'k']];
        canonicalYears2022.forEach((canonicalYear, idx) => {
            const visualYear = visualYears2022[idx] ?? canonicalYear;
            out.push([`CHPSi${canonicalYear}`, `ЧПСi${visualYear}`]);
            out.push([`CHPi${canonicalYear}`, `ЧПi${visualYear}`]);
        });
        return out;
    })();

    const b26Fields = (() => {
        const out = [];
        canonicalYears2022.forEach((canonicalYear, idx) => {
            const visualYear = visualYears2022[idx] ?? canonicalYear;
            out.push([`CHOSi${canonicalYear}`, `ЧОСi${visualYear}`]);
            out.push([`CHOi${canonicalYear}`, `ЧОi${visualYear}`]);
        });
        return out;
    })();

    const b34Fields = canonicalYears2023.map((canonicalYear, idx) => {
        const visualYear = visualYears2023[idx] ?? canonicalYear;
        return [`NR${canonicalYear}`, `NR${visualYear}`];
    });
    const b41Fields = canonicalYears2022.flatMap((canonicalYear, idx) => {
        const visualYear = visualYears2022[idx] ?? canonicalYear;
        return [[`WL${canonicalYear}`, `WL${visualYear}`], [`NPR${canonicalYear}`, `NPR${visualYear}`]];
    });
    const b42Fields = canonicalYears2022.map((canonicalYear, idx) => {
        const visualYear = visualYears2022[idx] ?? canonicalYear;
        return [`DN${canonicalYear}`, `DN${visualYear}`];
    });
    const b44Fields = canonicalYears2022.flatMap((canonicalYear, idx) => {
        const visualYear = visualYears2022[idx] ?? canonicalYear;
        return [
        [`OD${canonicalYear}`, `OD${visualYear}`],
        [`NO${canonicalYear}`, `NO_${visualYear}`],
        [`NV${canonicalYear}`, `NV_${visualYear}`],
        [`NZ${canonicalYear}`, `NZ_${visualYear}`],
        [`NOA${canonicalYear}`, `NOA_${visualYear}`],
        ];
    });

    const totalsFields = [
        ['B11', 'B11'],
        ['B12', 'B12'],
        ['B13', 'B13'],
        ['B21', 'B21'],
        ['B22', 'B22'],
        ['B23', 'B23'],
        ['B24', 'B24'],
        ['B25', 'B25'],
        ['B26', 'B26'],
        ['B31', 'B31'],
        ['B32', 'B32'],
        ['B33Result', 'B33'],
        ['B34', 'B34'],
        ['B41', 'B41'],
        ['B42', 'B42'],
        ['B43', 'B43'],
        ['B44', 'B44'],
    ];

    const fieldsByGroupMetrics = {
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
            ['NBo','NBo'],
            ['NBv','NBv'],
            ['NBz','NBz'],
            ['NMo','NMo'],
            ['NMv','NMv'],
            ['NMz','NMz'],
            ['ACo','ACo'],
            ['ACv','ACv'],
            ['ACz','ACz'],
            ['OPC','OPC'],
            ['ACC','ACC'],
        ],
        6: [
            ['KPo','KPo'],
            ['KPv','KPv'],
            ['KPz','KPz'],
            ['PPPo','PPPo'],
            ['PPPv','PPPv'],
            ['PPPz','PPPz'],
            ['NPo','NPo'],
            ['NPv','NPv'],
            ['NPz','NPz'],
            ['NOA','NOA'],
        ],
        7: [
            ['NAo','NAo'],
            ['NAv','NAv'],
            ['NAz','NAz'],
            ['PNo','PNo'],
            ['PNv','PNv'],
            ['PNz','PNz'],
        ],
        8: b25Fields,
        9: b26Fields,
        10: [
            ['UT','UT'],
            ['DO','DO'],
        ],
        11: [
            ['N','N'],
            ['Npr','Npr'],
            ['VO','VO'],
            ['PO','PO'],
        ],
        12: [['B33','B33']],
        // new input groups for formulas B34..B44
        13: b34Fields,
        14: b41Fields,
        15: b42Fields,
        16: [
            ['DI','DI'],
            ['Io','Io'],
            ['Iv','Iv'],
            ['Iz','Iz'],
            ['No','No'],
            ['Nv','Nv'],
            ['Nz','Nz'],
        ],
        17: b44Fields,
    };

    const fieldsByGroup = inputMode === 'totals'
        ? { 1: totalsFields }
        : fieldsByGroupMetrics;

    return (
        <>
            <Analytics
                rows={rows}
                metricNames={metricNames}
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

                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                    <span>Режим ввода:</span>
                    <select
                        className="num-input"
                        value={inputMode}
                        onChange={(e) => setInputMode(e.target.value)}
                        style={{ maxWidth: 360 }}
                    >
                        <option value="metrics">Через метрики</option>
                        <option value="totals">Через итоговые значения параметров</option>
                    </select>
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
