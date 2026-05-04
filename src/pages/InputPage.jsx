import React, { useEffect, useRef, useState } from 'react';
import { Api } from '../api';
import YearPicker from '../components/YearPicker.jsx';
import ClassList from '../components/ClassList.jsx';
import ResultsTable from '../components/ResultsTable.jsx';
import Analytics from './Analytics.jsx';
import History from './History.jsx';
import MenuDropdown from '../components/MenuDropdown.jsx';
import { DEFAULT_METRIC_NAMES } from '../constants.js';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
const YEAR_NOW = new Date().getFullYear();
const B25_B26_START_YEAR = 2022;
const STORAGE_KEY = 'unirating_b_params_v2';
const STORAGE_KEY_ITERATION = 'selected_iteration';
const STORAGE_KEY_INPUT_MODE = 'b_input_mode';

const METRIC_EXCLUDE_KEYS = new Set([
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

const CLASS_SPECIFIC_EXCLUDE_KEYS = {
    A: new Set(['PN', 'DI', 'SUMPOINTS', 'sumPoints']),
};

const resolveMetricKeys = (rows, classType = 'B') => {
    if (!rows.length) {
        return [];
    }

    const classSpecificExcludes = CLASS_SPECIFIC_EXCLUDE_KEYS[classType] || new Set();

    return Object.keys(rows[0]).filter((key) => {
        if (key.startsWith('code')) return false;
        if (METRIC_EXCLUDE_KEYS.has(key)) return false;
        if (classSpecificExcludes.has(key)) return false;
        return typeof rows[0][key] === 'number' && Number.isFinite(rows[0][key]);
    });
};

const resolveMetricLabel = (codeKey, rawValue) => {
    const fallback = DEFAULT_METRIC_NAMES[codeKey] || codeKey.toUpperCase();
    if (typeof rawValue !== 'string') return fallback;

    const value = rawValue.trim();
    if (!value) return fallback;

    const upperCode = codeKey.toUpperCase();
    const upperValue = value.toUpperCase();
    if (upperValue === upperCode || upperValue === `CODE${upperCode}`) {
        return fallback;
    }

    return value;
};

const extractMetricNamesFromResult = (resultRow) => {
    const names = { ...DEFAULT_METRIC_NAMES };
    Object.keys(resultRow || {}).forEach((key) => {
        if (key.startsWith('code')) {
            names[key] = resolveMetricLabel(key, resultRow[key]);
        }
    });
    return names;
};

const buildMetricNamesDto = (metricNames, calcResultId) => {
    if (!calcResultId) return null;

    const dto = { calcResultId };
    Object.keys(metricNames || {}).forEach((key) => {
        if (key.startsWith('code')) {
            dto[key] = metricNames[key];
        }
    });

    return dto;
};

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
    Po: '',
    Pv: '',
    Pz: '',
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

const DEFAULT_A_PARAMS = {
    // KI via PN/DI (legacy) and explicit per-class KI
    PNo: '',
    PNv: '',
    PNz: '',
    DIo: '',
    DIv: '',
    DIz: '',
    KI_A: '',

    // A11..A23 source metrics
    PRF: '',
    KCO: '',
    ZKN: '',
    CHVA: '',
    CHPA: '',
    CZ: '',
    CV: '',
    A23RF: '',

    // legacy/summary fields
    sumPoints: '',
    k: '3',

    // A31..A33
    WL2022: '',
    WL2023: '',
    WL2024: '',
    NPR2022: '',
    NPR2023: '',
    NPR2024: '',
    DN2022: '',
    DN2023: '',
    DN2024: '',
    RDN2022: '',
    RDN2023: '',
    RDN2024: '',

    // A34..A37 source metrics
    IA2022: '',
    IA2023: '',
    IA2024: '',
    ASP2022: '',
    ASP2023: '',
    ASP2024: '',
    OD2022: '',
    OD2023: '',
    OD2024: '',
    PFN: '',
    ASO: '',
    DS: '',

    // direct submetric overrides (totals mode)
    A11: '',
    A21: '',
    A22: '',
    A23: '',
    A31: '',
    A32: '',
    A33: '',
    A34: '',
    A35: '',
    A36: '',
    A37: '',
};

const DEFAULT_M_PARAMS = {
    k: '3',
    ZMD: '',
    ZM: '',
    CHZ: '',
    ZPK: '',
    MDP: '',
    PRF: '',
    KCO: '',
    M21_poa: '',
    M21_licensed: '',
    M22_NMo: '',
    M22_NMv: '',
    M22_NMz: '',
    M22_ACo: '',
    M22_ACv: '',
    M22_ACz: '',
    M22_OPC: '',
    M22_ACC: '',
    M23_No: '',
    M23_Nv: '',
    M23_Nz: '',
    M23_KPo: '',
    M23_KPv: '',
    M23_KPz: '',
    M23_PPPo: '',
    M23_PPPv: '',
    M23_PPPz: '',
    M23_NOA: '',
    M24_NAP: '',
    M24_PN: '',
    M24_o: '',
    M25_BPo: '',
    M25_BPv: '',
    M25_BPz: '',
    M25_CPo: '',
    M25_CPv: '',
    M25_CPz: '',
    M25_NMo: '',
    M25_NMv: '',
    M25_NMz: '',
    M26_CHPSi2022: '',
    M26_CHPi2022: '',
    M26_CHPSi2023: '',
    M26_CHPi2023: '',
    M26_CHPSi2024: '',
    M26_CHPi2024: '',
    M27_CHOSi2022: '',
    M27_CHOi2022: '',
    M27_CHOSi2023: '',
    M27_CHOi2023: '',
    M27_CHOSi2024: '',
    M27_CHOi2024: '',
    M31_o: '',
    N: '',
    Npr: '',
    VO: '',
    PO: '',
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
    KI_M: '',
    M11: '',
    M12: '',
    M13: '',
    M14: '',
    M21: '',
    M22: '',
    M23: '',
    M24: '',
    M25: '',
    M26: '',
    M27: '',
    M31: '',
    M32: '',
    M33: '',
    M41: '',
    M42: '',
    M43: '',
    M44: '',
};

function normalizeNumber(v) {
    if (v === '' || v == null) return null;
    const n = Number(String(v).replace(',', '.'));
    return Number.isNaN(n) ? null : n;
}

function safeDivOrZero(numerator, denominator) {
    const n = Number(numerator);
    const d = Number(denominator);
    if (!Number.isFinite(n) || !Number.isFinite(d) || d === 0) return 0;
    return n / d;
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

function buildExportPayload(years, paramsA, paramsB, paramsM, inputMode = 'metrics') {
    const aData = years
        .map((year) => {
            const p = paramsA[year] || DEFAULT_A_PARAMS;
            const pb = paramsB[year] || DEFAULT_B_PARAMS;
            const kYears = getKYears(p);
            const includeDirectMetrics = inputMode === 'totals';

            return {
                year,
                PNo: normalizeNumber(p.PNo),
                PNv: normalizeNumber(p.PNv),
                PNz: normalizeNumber(p.PNz),
                DIo: normalizeNumber(p.DIo),
                DIv: normalizeNumber(p.DIv),
                DIz: normalizeNumber(p.DIz),
                PRF: normalizeNumber(p.PRF),
                KCO: normalizeNumber(p.KCO),
                ZKN: normalizeNumber(p.ZKN),
                CHVA: normalizeNumber(p.CHVA),
                CHPA: normalizeNumber(p.CHPA),
                CZ: normalizeNumber(p.CZ),
                CV: normalizeNumber(p.CV),
                A23RF: normalizeNumber(p.A23RF),
                sumPoints: normalizeNumber(p.sumPoints),
                k: kYears,
                WL2022: normalizeNumber(firstDefinedValue(p.WL2022, pb.WL2022)),
                WL2023: normalizeNumber(firstDefinedValue(p.WL2023, pb.WL2023)),
                WL2024: normalizeNumber(firstDefinedValue(p.WL2024, pb.WL2024)),
                NPR2022: normalizeNumber(firstDefinedValue(p.NPR2022, pb.NPR2022)),
                NPR2023: normalizeNumber(firstDefinedValue(p.NPR2023, pb.NPR2023)),
                NPR2024: normalizeNumber(firstDefinedValue(p.NPR2024, pb.NPR2024)),
                DN2022: normalizeNumber(firstDefinedValue(p.DN2022, pb.DN2022)),
                DN2023: normalizeNumber(firstDefinedValue(p.DN2023, pb.DN2023)),
                DN2024: normalizeNumber(firstDefinedValue(p.DN2024, pb.DN2024)),
                RDN2022: normalizeNumber(p.RDN2022),
                RDN2023: normalizeNumber(p.RDN2023),
                RDN2024: normalizeNumber(p.RDN2024),
                IA2022: normalizeNumber(p.IA2022),
                IA2023: normalizeNumber(p.IA2023),
                IA2024: normalizeNumber(p.IA2024),
                ASP2022: normalizeNumber(p.ASP2022),
                ASP2023: normalizeNumber(p.ASP2023),
                ASP2024: normalizeNumber(p.ASP2024),
                OD2022: normalizeNumber(firstDefinedValue(p.OD2022, pb.OD2022)),
                OD2023: normalizeNumber(firstDefinedValue(p.OD2023, pb.OD2023)),
                OD2024: normalizeNumber(firstDefinedValue(p.OD2024, pb.OD2024)),
                PFN: normalizeNumber(p.PFN),
                ASO: normalizeNumber(p.ASO),
                DS: normalizeNumber(p.DS),
                ...(includeDirectMetrics
                    ? {
                        KI_A: normalizeNumber(firstDefinedValue(p.KI_A, p.A_KI, p.KI)),
                        A11: normalizeNumber(p.A11),
                        A21: normalizeNumber(p.A21),
                        A22: normalizeNumber(p.A22),
                        A23: normalizeNumber(p.A23),
                        A31: normalizeNumber(p.A31),
                        A32: normalizeNumber(p.A32),
                        A33: normalizeNumber(p.A33),
                        A34: normalizeNumber(p.A34),
                        A35: normalizeNumber(p.A35),
                        A36: normalizeNumber(p.A36),
                        A37: normalizeNumber(p.A37),
                    }
                    : {}),
            };
        })
        .filter((row) => row.year);

    const bData = years
        .map((year) => {
            const p = paramsB[year] || DEFAULT_B_PARAMS;
            const kYears = getKYears(p);
            const includeDirectMetrics = inputMode === 'totals';
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
                Po: normalizeNumber(p.Po),
                Pv: normalizeNumber(p.Pv),
                Pz: normalizeNumber(p.Pz),
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
                ...(includeDirectMetrics
                    ? {
                        KI_B: normalizeNumber(firstDefinedValue(p.KI_B, p.B_KI, p.KI)),
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
                    }
                    : {}),
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

    const mData = years
        .map((year) => {
            const p = paramsM[year] || DEFAULT_M_PARAMS;
            const kYears = getKYears(p);
            const includeDirectMetrics = inputMode === 'totals';

            const m21Poa = normalizeNumber(firstDefinedValue(p.M21_poa, p.M21_o));
            const m21Licensed = normalizeNumber(firstDefinedValue(p.M21_licensed));
            const nmp = (normalizeNumber(firstDefinedValue(p.M22_NMo)) ?? 0)
                + 0.25 * (normalizeNumber(firstDefinedValue(p.M22_NMv)) ?? 0)
                + 0.1 * (normalizeNumber(firstDefinedValue(p.M22_NMz)) ?? 0);
            const acp = (normalizeNumber(firstDefinedValue(p.M22_ACo)) ?? 0)
                + 0.25 * (normalizeNumber(firstDefinedValue(p.M22_ACv)) ?? 0)
                + 0.1 * (normalizeNumber(firstDefinedValue(p.M22_ACz)) ?? 0);
            const m22O = safeDivOrZero(acp + (normalizeNumber(firstDefinedValue(p.M22_OPC)) ?? 0) + (normalizeNumber(firstDefinedValue(p.M22_ACC)) ?? 0), nmp);
            const np = (normalizeNumber(firstDefinedValue(p.M23_No)) ?? 0)
                + 0.25 * (normalizeNumber(firstDefinedValue(p.M23_Nv)) ?? 0)
                + 0.1 * (normalizeNumber(firstDefinedValue(p.M23_Nz)) ?? 0);
            const pkp = (normalizeNumber(firstDefinedValue(p.M23_KPo)) ?? 0)
                + 0.25 * (normalizeNumber(firstDefinedValue(p.M23_KPv)) ?? 0)
                + 0.1 * (normalizeNumber(firstDefinedValue(p.M23_KPz)) ?? 0);
            const ppp = (normalizeNumber(firstDefinedValue(p.M23_PPPo)) ?? 0)
                + 0.25 * (normalizeNumber(firstDefinedValue(p.M23_PPPv)) ?? 0)
                + 0.1 * (normalizeNumber(firstDefinedValue(p.M23_PPPz)) ?? 0);
            const noa = normalizeNumber(firstDefinedValue(p.M23_NOA)) ?? 0;
            const m23Numerator = 0.25 * pkp + ppp;
            const m23Denominator = np + noa;
            const m23O = m23Denominator === 0 && m23Numerator > 0
                ? 1
                : safeDivOrZero(m23Numerator, m23Denominator);
            const m24O = safeDivOrZero(
                normalizeNumber(firstDefinedValue(p.M24_NAP, p.M24_o)) ?? 0,
                normalizeNumber(firstDefinedValue(p.M24_PN, p.PN)) ?? 0,
            );

            return {
                year,
                k: kYears,
                ZMD: normalizeNumber(p.ZMD),
                ZM: normalizeNumber(p.ZM),
                CHZ: normalizeNumber(p.CHZ),
                ZPK: normalizeNumber(p.ZPK),
                MDP: normalizeNumber(p.MDP),
                PRF: normalizeNumber(p.PRF),
                KCO: normalizeNumber(p.KCO),
                M21_poa: m21Poa,
                M21_licensed: m21Licensed,
                M22_NMo: normalizeNumber(p.M22_NMo),
                M22_NMv: normalizeNumber(p.M22_NMv),
                M22_NMz: normalizeNumber(p.M22_NMz),
                M22_ACo: normalizeNumber(p.M22_ACo),
                M22_ACv: normalizeNumber(p.M22_ACv),
                M22_ACz: normalizeNumber(p.M22_ACz),
                M22_OPC: normalizeNumber(p.M22_OPC),
                M22_ACC: normalizeNumber(p.M22_ACC),
                M23_No: normalizeNumber(p.M23_No),
                M23_Nv: normalizeNumber(p.M23_Nv),
                M23_Nz: normalizeNumber(p.M23_Nz),
                M23_KPo: normalizeNumber(p.M23_KPo),
                M23_KPv: normalizeNumber(p.M23_KPv),
                M23_KPz: normalizeNumber(p.M23_KPz),
                M23_PPPo: normalizeNumber(p.M23_PPPo),
                M23_PPPv: normalizeNumber(p.M23_PPPv),
                M23_PPPz: normalizeNumber(p.M23_PPPz),
                M23_NOA: normalizeNumber(p.M23_NOA),
                M24_NAP: normalizeNumber(p.M24_NAP),
                M24_PN: normalizeNumber(p.M24_PN),
                M25_BPo: normalizeNumber(p.M25_BPo),
                M25_BPv: normalizeNumber(p.M25_BPv),
                M25_BPz: normalizeNumber(p.M25_BPz),
                M25_CPo: normalizeNumber(p.M25_CPo),
                M25_CPv: normalizeNumber(p.M25_CPv),
                M25_CPz: normalizeNumber(p.M25_CPz),
                M25_NMo: normalizeNumber(p.M25_NMo),
                M25_NMv: normalizeNumber(p.M25_NMv),
                M25_NMz: normalizeNumber(p.M25_NMz),
                M26_CHPSi2022: normalizeNumber(p.M26_CHPSi2022),
                M26_CHPi2022: normalizeNumber(p.M26_CHPi2022),
                M26_CHPSi2023: normalizeNumber(p.M26_CHPSi2023),
                M26_CHPi2023: normalizeNumber(p.M26_CHPi2023),
                M26_CHPSi2024: normalizeNumber(p.M26_CHPSi2024),
                M26_CHPi2024: normalizeNumber(p.M26_CHPi2024),
                M27_CHOSi2022: normalizeNumber(p.M27_CHOSi2022),
                M27_CHOi2022: normalizeNumber(p.M27_CHOi2022),
                M27_CHOSi2023: normalizeNumber(p.M27_CHOSi2023),
                M27_CHOi2023: normalizeNumber(p.M27_CHOi2023),
                M27_CHOSi2024: normalizeNumber(p.M27_CHOSi2024),
                M27_CHOi2024: normalizeNumber(p.M27_CHOi2024),
                M21_o: normalizeNumber(safeDivOrZero(m21Poa, m21Licensed)),
                M22_o: normalizeNumber(m22O),
                M23_o: normalizeNumber(m23O),
                M24_o: normalizeNumber(m24O),
                M31_o: normalizeNumber(p.M31_o),
                N: normalizeNumber(p.N),
                Npr: normalizeNumber(p.Npr),
                VO: normalizeNumber(p.VO),
                PO: normalizeNumber(p.PO),
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
                NO2022: normalizeNumber(p.NO2022),
                NV2022: normalizeNumber(p.NV2022),
                NZ2022: normalizeNumber(p.NZ2022),
                NOA2022: normalizeNumber(p.NOA2022),
                NO2023: normalizeNumber(p.NO2023),
                NV2023: normalizeNumber(p.NV2023),
                NZ2023: normalizeNumber(p.NZ2023),
                NOA2023: normalizeNumber(p.NOA2023),
                NO2024: normalizeNumber(p.NO2024),
                NV2024: normalizeNumber(p.NV2024),
                NZ2024: normalizeNumber(p.NZ2024),
                NOA2024: normalizeNumber(p.NOA2024),
                ...(includeDirectMetrics
                    ? {
                        KI_M: normalizeNumber(firstDefinedValue(p.KI_M, p.M_KI, p.KI)),
                        M21: normalizeNumber(p.M21),
                        M22: normalizeNumber(p.M22),
                        M23: normalizeNumber(p.M23),
                        M24: normalizeNumber(p.M24),
                        M25: normalizeNumber(p.M25),
                        M26: normalizeNumber(p.M26),
                        M27: normalizeNumber(p.M27),
                        M31: normalizeNumber(firstDefinedValue(p.M31, p.M31_o)),
                        M32: normalizeNumber(p.M32),
                        M33: normalizeNumber(p.M33),
                        M41: normalizeNumber(p.M41),
                        M42: normalizeNumber(p.M42),
                        M43: normalizeNumber(p.M43),
                        M44: normalizeNumber(p.M44),
                    }
                    : {}),
            };
        })
        .filter((row) => row.year);

    return {
        classes: [
            {
                classType: 'A',
                data: aData,
            },
            {
                classType: 'B',
                data: bData,
            },
            {
                classType: 'M',
                data: mData,
            },
        ],
    };
}

export default function InputPage() {
    const [currentYear, setCurrentYear] = useState(YEAR_NOW);
    const [years, setYears] = useState([YEAR_NOW]);
    const [paramsA, setParamsA] = useState({ [YEAR_NOW]: { ...DEFAULT_A_PARAMS } });
    const [paramsB, setParamsB] = useState({ [YEAR_NOW]: { ...DEFAULT_B_PARAMS } });
    const [paramsM, setParamsM] = useState({ [YEAR_NOW]: { ...DEFAULT_M_PARAMS } });
    const [busy, setBusy] = useState(false);
    // To avoid autosave on first page load
    const [isFromStorageFilled, setIsFromStorageFilled] = useState(false);
    const fileRef = useRef(null);

    // ---------------- For Analytics.jsx ----------------
    const [rows, setRows] = useState([]);
    const [metricNames, setMetricNames] = useState(DEFAULT_METRIC_NAMES);
    const [calcSummary, setCalcSummary] = useState([]);
    const [historyClasses, setHistoryClasses] = useState([]);
    const [selectedAnalyticsClass, setSelectedAnalyticsClass] = useState('B');

    // ---------------- For History.jsx ----------------
    const [items, setItems] = useState([]);
    const [selectedIteration, setSelectedIteration] = useState(0);
    const [visibleYears, setVisibleYears] = useState({});
    const [inputMode, setInputMode] = useState(() => localStorage.getItem(STORAGE_KEY_INPUT_MODE) || 'metrics');

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY_INPUT_MODE, inputMode);
    }, [inputMode]);

    const applyHistoryClasses = (classes) => {
        setHistoryClasses(classes);
        setSelectedAnalyticsClass((current) => (
            classes.some((c) => c.classType === current)
                ? current
                : (classes[0]?.classType || current)
        ));
    };

    // ---------------- 1. Загрузка на старте (только один раз) ----------------
    useEffect(() => {
        const _selectedIteration = +localStorage.getItem(STORAGE_KEY_ITERATION) || 0;
        setSelectedIteration(_selectedIteration)

        const paramsRequest = _selectedIteration
            ? Api.getParamsBByIter(_selectedIteration)
            : Api.exportParams();

        paramsRequest
            .then(object => {
                const classA = Array.isArray(object?.classes)
                    ? object.classes.find(c => c.classType === 'A')
                    : null;
                const classB = Array.isArray(object?.classes)
                    ? object.classes.find(c => c.classType === "B")
                    : object?.classType === 'B'
                        ? object
                        : null;
                const classM = Array.isArray(object?.classes)
                    ? object.classes.find(c => c.classType === 'M')
                    : null;

                const dataA = classA?.data || [];
                const data = classB?.data || [];
                const dataM = classM?.data || [];

                if ((!dataA || !dataA.length) && (!data || !data.length) && (!dataM || !dataM.length)) return;
                const mapA = {};
                const map = {};
                const mapM = {};
                const ys = [];

                for (const row of dataA) {
                    ys.push(row.year);
                    mapA[row.year] = {
                        PNo: row.PNo ?? '',
                        PNv: row.PNv ?? '',
                        PNz: row.PNz ?? '',
                        DIo: row.DIo ?? '',
                        DIv: row.DIv ?? '',
                        DIz: row.DIz ?? '',
                        PRF: row.PRF ?? '',
                        KCO: firstDefinedValue(row.KCO, row.KTSO),
                        ZKN: row.ZKN ?? '',
                        CHVA: row.CHVA ?? '',
                        CHPA: row.CHPA ?? '',
                        CZ: row.CZ ?? '',
                        CV: row.CV ?? '',
                        A23RF: firstDefinedValue(row.A23RF, row.A23_avg, row.A23_RF),
                        sumPoints: row.sumPoints ?? '',
                        k: firstDefinedValue(row.k, row.K, 3),
                        WL2022: row.WL2022 ?? '',
                        WL2023: row.WL2023 ?? '',
                        WL2024: row.WL2024 ?? '',
                        NPR2022: row.NPR2022 ?? '',
                        NPR2023: row.NPR2023 ?? '',
                        NPR2024: row.NPR2024 ?? '',
                        DN2022: row.DN2022 ?? '',
                        DN2023: row.DN2023 ?? '',
                        DN2024: row.DN2024 ?? '',
                        RDN2022: row.RDN2022 ?? '',
                        RDN2023: row.RDN2023 ?? '',
                        RDN2024: row.RDN2024 ?? '',
                        IA2022: row.IA2022 ?? '',
                        IA2023: row.IA2023 ?? '',
                        IA2024: row.IA2024 ?? '',
                        ASP2022: row.ASP2022 ?? '',
                        ASP2023: row.ASP2023 ?? '',
                        ASP2024: row.ASP2024 ?? '',
                        OD2022: row.OD2022 ?? '',
                        OD2023: row.OD2023 ?? '',
                        OD2024: row.OD2024 ?? '',
                        PFN: row.PFN ?? '',
                        ASO: row.ASO ?? '',
                        DS: firstDefinedValue(row.DS, row.A37_o, row.A37_raw),
                        KI_A: firstDefinedValue(row.KI_A, row.A_KI, row.KI),
                        A11: firstDefinedValue(row.A11, row.a11),
                        A21: firstDefinedValue(row.A21, row.a21),
                        A22: firstDefinedValue(row.A22, row.a22),
                        A23: firstDefinedValue(row.A23, row.a23),
                        A31: firstDefinedValue(row.A31, row.a31),
                        A32: firstDefinedValue(row.A32, row.a32),
                        A33: firstDefinedValue(row.A33, row.a33),
                        A34: firstDefinedValue(row.A34, row.a34),
                        A35: firstDefinedValue(row.A35, row.a35),
                        A36: firstDefinedValue(row.A36, row.a36),
                        A37: firstDefinedValue(row.A37, row.a37),
                    };
                }

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
                        Po: firstDefinedValue(row.Po, ''),
                        Pv: firstDefinedValue(row.Pv, ''),
                        Pz: firstDefinedValue(row.Pz, ''),
                        DIo: firstDefinedValue(row.DIo, row.DI),
                        DIv: firstDefinedValue(row.DIv, ''),
                        DIz: firstDefinedValue(row.DIz, ''),
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
                        KI_B: firstDefinedValue(row.KI_B, row.B_KI, row.KI),
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

                for (const row of dataM) {
                    ys.push(row.year);
                    mapM[row.year] = {
                        k: firstDefinedValue(row.k, row.K, 3),
                        ZMD: row.ZMD ?? '',
                        ZM: row.ZM ?? '',
                        CHZ: row.CHZ ?? '',
                        ZPK: row.ZPK ?? '',
                        MDP: row.MDP ?? '',
                        PRF: firstDefinedValue(row.PRF, row.M14_PRF),
                        KCO: firstDefinedValue(row.KCO, row.KTSO, row.M14_KCO),
                        M21_poa: firstDefinedValue(row.M21_poa, row.M21_o, row.M21_raw),
                        M21_licensed: firstDefinedValue(row.M21_licensed),
                        M22_NMo: firstDefinedValue(row.M22_NMo),
                        M22_NMv: firstDefinedValue(row.M22_NMv),
                        M22_NMz: firstDefinedValue(row.M22_NMz),
                        M22_ACo: firstDefinedValue(row.M22_ACo),
                        M22_ACv: firstDefinedValue(row.M22_ACv),
                        M22_ACz: firstDefinedValue(row.M22_ACz),
                        M22_OPC: firstDefinedValue(row.M22_OPC),
                        M22_ACC: firstDefinedValue(row.M22_ACC),
                        M23_No: firstDefinedValue(row.M23_No),
                        M23_Nv: firstDefinedValue(row.M23_Nv),
                        M23_Nz: firstDefinedValue(row.M23_Nz),
                        M23_KPo: firstDefinedValue(row.M23_KPo),
                        M23_KPv: firstDefinedValue(row.M23_KPv),
                        M23_KPz: firstDefinedValue(row.M23_KPz),
                        M23_PPPo: firstDefinedValue(row.M23_PPPo),
                        M23_PPPv: firstDefinedValue(row.M23_PPPv),
                        M23_PPPz: firstDefinedValue(row.M23_PPPz),
                        M23_NOA: firstDefinedValue(row.M23_NOA),
                        M24_NAP: firstDefinedValue(row.M24_NAP),
                        M24_PN: firstDefinedValue(row.M24_PN),
                        M24_o: firstDefinedValue(row.M24_o, row.M24_raw),
                        M25_BPo: firstDefinedValue(row.M25_BPo, row.BPo),
                        M25_BPv: firstDefinedValue(row.M25_BPv, row.BPv),
                        M25_BPz: firstDefinedValue(row.M25_BPz, row.BPz),
                        M25_CPo: firstDefinedValue(row.M25_CPo, row.CPo),
                        M25_CPv: firstDefinedValue(row.M25_CPv, row.CPv),
                        M25_CPz: firstDefinedValue(row.M25_CPz, row.CPz),
                        M25_NMo: firstDefinedValue(row.M25_NMo, row.NMo),
                        M25_NMv: firstDefinedValue(row.M25_NMv, row.NMv),
                        M25_NMz: firstDefinedValue(row.M25_NMz, row.NMz),
                        M26_CHPSi2022: firstDefinedValue(row.M26_CHPSi2022, row.CHPSi2022),
                        M26_CHPi2022: firstDefinedValue(row.M26_CHPi2022, row.CHPi2022),
                        M26_CHPSi2023: firstDefinedValue(row.M26_CHPSi2023, row.CHPSi2023),
                        M26_CHPi2023: firstDefinedValue(row.M26_CHPi2023, row.CHPi2023),
                        M26_CHPSi2024: firstDefinedValue(row.M26_CHPSi2024, row.CHPSi2024),
                        M26_CHPi2024: firstDefinedValue(row.M26_CHPi2024, row.CHPi2024),
                        M27_CHOSi2022: firstDefinedValue(row.M27_CHOSi2022, row.CHOSi2022),
                        M27_CHOi2022: firstDefinedValue(row.M27_CHOi2022, row.CHOi2022),
                        M27_CHOSi2023: firstDefinedValue(row.M27_CHOSi2023, row.CHOSi2023),
                        M27_CHOi2023: firstDefinedValue(row.M27_CHOi2023, row.CHOi2023),
                        M27_CHOSi2024: firstDefinedValue(row.M27_CHOSi2024, row.CHOSi2024),
                        M27_CHOi2024: firstDefinedValue(row.M27_CHOi2024, row.CHOi2024),
                        M22_o: firstDefinedValue(row.M22_o, row.M22_raw),
                        M23_o: firstDefinedValue(row.M23_o, row.M23_raw),
                        M31_o: firstDefinedValue(row.M31_o, row.M31_raw),
                        N: row.N ?? '',
                        Npr: row.Npr ?? '',
                        VO: row.VO ?? '',
                        PO: row.PO ?? '',
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
                        NO2022: firstDefinedValue(row.NO2022, row.No2022),
                        NV2022: firstDefinedValue(row.NV2022, row.Nv2022),
                        NZ2022: firstDefinedValue(row.NZ2022, row.Nz2022),
                        NOA2022: firstDefinedValue(row.NOA2022, row.Noa2022),
                        NO2023: firstDefinedValue(row.NO2023, row.No2023),
                        NV2023: firstDefinedValue(row.NV2023, row.Nv2023),
                        NZ2023: firstDefinedValue(row.NZ2023, row.Nz2023),
                        NOA2023: firstDefinedValue(row.NOA2023, row.Noa2023),
                        NO2024: firstDefinedValue(row.NO2024, row.No2024),
                        NV2024: firstDefinedValue(row.NV2024, row.Nv2024),
                        NZ2024: firstDefinedValue(row.NZ2024, row.Nz2024),
                        NOA2024: firstDefinedValue(row.NOA2024, row.Noa2024),
                        KI_M: firstDefinedValue(row.KI_M, row.M_KI, row.KI),
                        M11: firstDefinedValue(row.M11, row.m11),
                        M12: firstDefinedValue(row.M12, row.m12),
                        M13: firstDefinedValue(row.M13, row.m13),
                        M14: firstDefinedValue(row.M14, row.m14),
                        M21: firstDefinedValue(row.M21, row.m21),
                        M22: firstDefinedValue(row.M22, row.m22),
                        M23: firstDefinedValue(row.M23, row.m23),
                        M24: firstDefinedValue(row.M24, row.m24),
                        M25: firstDefinedValue(row.M25, row.m25),
                        M26: firstDefinedValue(row.M26, row.m26),
                        M27: firstDefinedValue(row.M27, row.m27),
                        M31: firstDefinedValue(row.M31, row.m31, row.M31_o, row.M31_raw),
                        M32: firstDefinedValue(row.M32, row.m32),
                        M33: firstDefinedValue(row.M33, row.m33),
                        M41: firstDefinedValue(row.M41, row.m41),
                        M42: firstDefinedValue(row.M42, row.m42),
                        M43: firstDefinedValue(row.M43, row.m43),
                        M44: firstDefinedValue(row.M44, row.m44),
                    };
                }

                const uniqueYears = [...new Set(ys)].sort((a, b) => b - a);

                setYears(uniqueYears);
                setCurrentYear(uniqueYears[0]);
                setParamsA(mapA);
                setParamsB(map);
                setParamsM(mapM);
            })
            .catch(() => { })
            .finally(() => {
                const payload = { years, currentYear, paramsA, paramsB, paramsM };
                localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
            })

        // ---------------- For Analytics.jsx and History.jsx ----------------
        Api.getHistoryAll()
            .then(object => {
                const classes = Array.isArray(object?.classes) ? object.classes : [];
                applyHistoryClasses(classes);
            })
            .catch((err) => {
                console.warn('Ошибка загрузки истории:', err);
                setHistoryClasses([]);
            })
    }, []);

    useEffect(() => {
        const selectedClass = historyClasses.find((c) => c.classType === selectedAnalyticsClass)
            || historyClasses[0];
        if (!selectedClass) {
            setRows([]);
            setItems([]);
            setMetricNames({ ...DEFAULT_METRIC_NAMES });
            return;
        }

        const items = Array.isArray(selectedClass?.items) ? selectedClass.items : [];
        const targetIter = selectedIteration;

        let results = [];
        if (items.length) {
            const selectedItem = targetIter
                ? items.find((item) => item.iter === targetIter)
                : items.reduce((maxItem, item) => (item.iter > maxItem.iter ? item : maxItem));
            results = Array.isArray(selectedItem?.results) ? selectedItem.results : [];

            const firstRes = results[0] || {};
            setMetricNames(extractMetricNamesFromResult(firstRes));
        } else {
            setMetricNames({ ...DEFAULT_METRIC_NAMES });
        }

        setRows(Array.isArray(results) ? results : []);
        setItems(items);
    }, [historyClasses, selectedAnalyticsClass, selectedIteration]);

    useEffect(() => {
        setVisibleYears((prev) => {
            const next = {};
            const safeRows = Array.isArray(rows) ? rows : [];

            safeRows.forEach((r) => {
                next[r.year] = prev[r.year] ?? true;
            });
            return next;
        });
    }, [rows]);

    // ---------------- 2. Автосохранение ----------------
    useEffect(() => {
        if (!isFromStorageFilled) return;

        const payload = { years, currentYear, paramsA, paramsB, paramsM };
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
        } catch (e) {
            console.warn('Ошибка сохранения в localStorage', e);
        }
    }, [years, currentYear, paramsA, paramsB, paramsM]);

    const ensureYear = (year) => {
        setYears((ys) => (ys.includes(year) ? ys : [...ys, year].sort((a, b) => a - b)));
        setParamsA((state) => ({
            ...state,
            [year]: state[year] || { ...DEFAULT_A_PARAMS },
        }));
        setParamsB((state) => ({
            ...state,
            [year]: state[year] || { ...DEFAULT_B_PARAMS },
        }));
        setParamsM((state) => ({
            ...state,
            [year]: state[year] || { ...DEFAULT_M_PARAMS },
        }));
    };

    const handleYearChange = (year) => {
        ensureYear(year);
        setCurrentYear(year);
    };

    const handleParamChangeB = (key, value) => {
        setParamsB((state) => ({
            ...state,
            [currentYear]: {
                ...(state[currentYear] || { ...DEFAULT_B_PARAMS }),
                [key]: value,
            },
        }));
    };

    const handleParamChangeA = (key, value) => {
        setParamsA((state) => ({
            ...state,
            [currentYear]: {
                ...(state[currentYear] || { ...DEFAULT_A_PARAMS }),
                [key]: value,
            },
        }));
    };

    const handleParamChangeM = (key, value) => {
        setParamsM((state) => ({
            ...state,
            [currentYear]: {
                ...(state[currentYear] || { ...DEFAULT_M_PARAMS }),
                [key]: value,
            },
        }));
    };

    // ---------------- 3. Очистить всё ----------------
    const clearAll = async () => {
        if (busy) return;
        setBusy(true);
        try {
            setParamsA({ [YEAR_NOW]: { ...DEFAULT_A_PARAMS } });
            setParamsB({ [YEAR_NOW]: { ...DEFAULT_B_PARAMS } });
            setParamsM({ [YEAR_NOW]: { ...DEFAULT_M_PARAMS } });
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
        setParamsA((prev) => {
            const copy = { ...prev };
            delete copy[currentYear];
            if (!Object.keys(copy).length) {
                copy[YEAR_NOW] = { ...DEFAULT_A_PARAMS };
            }
            return copy;
        });

        setParamsB((prev) => {
            const copy = { ...prev };
            delete copy[currentYear];
            if (!Object.keys(copy).length) {
                copy[YEAR_NOW] = { ...DEFAULT_B_PARAMS };
            }
            return copy;
        });

        setParamsM((prev) => {
            const copy = { ...prev };
            delete copy[currentYear];
            if (!Object.keys(copy).length) {
                copy[YEAR_NOW] = { ...DEFAULT_M_PARAMS };
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
            const payload = buildExportPayload(years, paramsA, paramsB, paramsM, inputMode);

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

            const aBlock = json.classes.find((c) => c.classType === 'A');
            const bBlock = json.classes.find((c) => c.classType === 'B');
            const mBlock = json.classes.find((c) => c.classType === 'M');
            if (!bBlock || !Array.isArray(bBlock.data)) throw new Error('Нет данных класса B');

            const mapA = {};
            const map = {};
            const mapM = {};
            const ys = [];

            if (aBlock && Array.isArray(aBlock.data)) {
                for (const row of aBlock.data) {
                    if (!row.year) continue;
                    ys.push(row.year);
                    mapA[row.year] = {
                        PNo: row.PNo ?? '',
                        PNv: row.PNv ?? '',
                        PNz: row.PNz ?? '',
                        DIo: row.DIo ?? '',
                        DIv: row.DIv ?? '',
                        DIz: row.DIz ?? '',
                        PRF: row.PRF ?? '',
                        KCO: firstDefinedValue(row.KCO, row.KTSO),
                        ZKN: row.ZKN ?? '',
                        CHVA: row.CHVA ?? '',
                        CHPA: row.CHPA ?? '',
                        CZ: row.CZ ?? '',
                        CV: row.CV ?? '',
                        A23RF: firstDefinedValue(row.A23RF, row.A23_avg, row.A23_RF),
                        sumPoints: row.sumPoints ?? '',
                        k: firstDefinedValue(row.k, row.K, 3),
                        WL2022: row.WL2022 ?? '',
                        WL2023: row.WL2023 ?? '',
                        WL2024: row.WL2024 ?? '',
                        NPR2022: row.NPR2022 ?? '',
                        NPR2023: row.NPR2023 ?? '',
                        NPR2024: row.NPR2024 ?? '',
                        DN2022: row.DN2022 ?? '',
                        DN2023: row.DN2023 ?? '',
                        DN2024: row.DN2024 ?? '',
                        RDN2022: row.RDN2022 ?? '',
                        RDN2023: row.RDN2023 ?? '',
                        RDN2024: row.RDN2024 ?? '',
                        IA2022: row.IA2022 ?? '',
                        IA2023: row.IA2023 ?? '',
                        IA2024: row.IA2024 ?? '',
                        ASP2022: row.ASP2022 ?? '',
                        ASP2023: row.ASP2023 ?? '',
                        ASP2024: row.ASP2024 ?? '',
                        OD2022: row.OD2022 ?? '',
                        OD2023: row.OD2023 ?? '',
                        OD2024: row.OD2024 ?? '',
                        PFN: row.PFN ?? '',
                        ASO: row.ASO ?? '',
                        DS: firstDefinedValue(row.DS, row.A37_o, row.A37_raw),
                        KI_A: firstDefinedValue(row.KI_A, row.A_KI, row.KI),
                        A11: firstDefinedValue(row.A11, row.a11),
                        A21: firstDefinedValue(row.A21, row.a21),
                        A22: firstDefinedValue(row.A22, row.a22),
                        A23: firstDefinedValue(row.A23, row.a23),
                        A31: firstDefinedValue(row.A31, row.a31),
                        A32: firstDefinedValue(row.A32, row.a32),
                        A33: firstDefinedValue(row.A33, row.a33),
                        A34: firstDefinedValue(row.A34, row.a34),
                        A35: firstDefinedValue(row.A35, row.a35),
                        A36: firstDefinedValue(row.A36, row.a36),
                        A37: firstDefinedValue(row.A37, row.a37),
                    };
                }
            }
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
                    Po: firstDefinedValue(row.Po, ''),
                    Pv: firstDefinedValue(row.Pv, ''),
                    Pz: firstDefinedValue(row.Pz, ''),
                    DIo: firstDefinedValue(row.DIo, row.DI),
                    DIv: firstDefinedValue(row.DIv, ''),
                    DIz: firstDefinedValue(row.DIz, ''),
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
                    KI_B: firstDefinedValue(row.KI_B, row.B_KI, row.KI),
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

            if (mBlock && Array.isArray(mBlock.data)) {
                for (const row of mBlock.data) {
                    if (!row.year) continue;
                    ys.push(row.year);
                    mapM[row.year] = {
                        k: firstDefinedValue(row.k, row.K, 3),
                        ZMD: row.ZMD ?? '',
                        ZM: row.ZM ?? '',
                        CHZ: row.CHZ ?? '',
                        ZPK: row.ZPK ?? '',
                        MDP: row.MDP ?? '',
                        PRF: firstDefinedValue(row.PRF, row.M14_PRF),
                        KCO: firstDefinedValue(row.KCO, row.KTSO, row.M14_KCO),
                        M21_poa: firstDefinedValue(row.M21_poa, row.M21_o, row.M21_raw),
                        M21_licensed: firstDefinedValue(row.M21_licensed),
                        M22_NMo: firstDefinedValue(row.M22_NMo),
                        M22_NMv: firstDefinedValue(row.M22_NMv),
                        M22_NMz: firstDefinedValue(row.M22_NMz),
                        M22_ACo: firstDefinedValue(row.M22_ACo),
                        M22_ACv: firstDefinedValue(row.M22_ACv),
                        M22_ACz: firstDefinedValue(row.M22_ACz),
                        M22_OPC: firstDefinedValue(row.M22_OPC),
                        M22_ACC: firstDefinedValue(row.M22_ACC),
                        M23_No: firstDefinedValue(row.M23_No),
                        M23_Nv: firstDefinedValue(row.M23_Nv),
                        M23_Nz: firstDefinedValue(row.M23_Nz),
                        M23_KPo: firstDefinedValue(row.M23_KPo),
                        M23_KPv: firstDefinedValue(row.M23_KPv),
                        M23_KPz: firstDefinedValue(row.M23_KPz),
                        M23_PPPo: firstDefinedValue(row.M23_PPPo),
                        M23_PPPv: firstDefinedValue(row.M23_PPPv),
                        M23_PPPz: firstDefinedValue(row.M23_PPPz),
                        M23_NOA: firstDefinedValue(row.M23_NOA),
                        M24_NAP: firstDefinedValue(row.M24_NAP),
                        M24_PN: firstDefinedValue(row.M24_PN),
                        M24_o: firstDefinedValue(row.M24_o, row.M24_raw),
                        M25_BPo: firstDefinedValue(row.M25_BPo, row.BPo),
                        M25_BPv: firstDefinedValue(row.M25_BPv, row.BPv),
                        M25_BPz: firstDefinedValue(row.M25_BPz, row.BPz),
                        M25_CPo: firstDefinedValue(row.M25_CPo, row.CPo),
                        M25_CPv: firstDefinedValue(row.M25_CPv, row.CPv),
                        M25_CPz: firstDefinedValue(row.M25_CPz, row.CPz),
                        M25_NMo: firstDefinedValue(row.M25_NMo, row.NMo),
                        M25_NMv: firstDefinedValue(row.M25_NMv, row.NMv),
                        M25_NMz: firstDefinedValue(row.M25_NMz, row.NMz),
                        M26_CHPSi2022: firstDefinedValue(row.M26_CHPSi2022, row.CHPSi2022),
                        M26_CHPi2022: firstDefinedValue(row.M26_CHPi2022, row.CHPi2022),
                        M26_CHPSi2023: firstDefinedValue(row.M26_CHPSi2023, row.CHPSi2023),
                        M26_CHPi2023: firstDefinedValue(row.M26_CHPi2023, row.CHPi2023),
                        M26_CHPSi2024: firstDefinedValue(row.M26_CHPSi2024, row.CHPSi2024),
                        M26_CHPi2024: firstDefinedValue(row.M26_CHPi2024, row.CHPi2024),
                        M27_CHOSi2022: firstDefinedValue(row.M27_CHOSi2022, row.CHOSi2022),
                        M27_CHOi2022: firstDefinedValue(row.M27_CHOi2022, row.CHOi2022),
                        M27_CHOSi2023: firstDefinedValue(row.M27_CHOSi2023, row.CHOSi2023),
                        M27_CHOi2023: firstDefinedValue(row.M27_CHOi2023, row.CHOi2023),
                        M27_CHOSi2024: firstDefinedValue(row.M27_CHOSi2024, row.CHOSi2024),
                        M27_CHOi2024: firstDefinedValue(row.M27_CHOi2024, row.CHOi2024),
                        M22_o: firstDefinedValue(row.M22_o, row.M22_raw),
                        M23_o: firstDefinedValue(row.M23_o, row.M23_raw),
                        M31_o: firstDefinedValue(row.M31_o, row.M31_raw),
                        N: row.N ?? '',
                        Npr: row.Npr ?? '',
                        VO: row.VO ?? '',
                        PO: row.PO ?? '',
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
                        NO2022: firstDefinedValue(row.NO2022, row.No2022),
                        NV2022: firstDefinedValue(row.NV2022, row.Nv2022),
                        NZ2022: firstDefinedValue(row.NZ2022, row.Nz2022),
                        NOA2022: firstDefinedValue(row.NOA2022, row.Noa2022),
                        NO2023: firstDefinedValue(row.NO2023, row.No2023),
                        NV2023: firstDefinedValue(row.NV2023, row.Nv2023),
                        NZ2023: firstDefinedValue(row.NZ2023, row.Nz2023),
                        NOA2023: firstDefinedValue(row.NOA2023, row.Noa2023),
                        NO2024: firstDefinedValue(row.NO2024, row.No2024),
                        NV2024: firstDefinedValue(row.NV2024, row.Nv2024),
                        NZ2024: firstDefinedValue(row.NZ2024, row.Nz2024),
                        NOA2024: firstDefinedValue(row.NOA2024, row.Noa2024),
                        KI_M: firstDefinedValue(row.KI_M, row.M_KI, row.KI),
                        M11: firstDefinedValue(row.M11, row.m11),
                        M12: firstDefinedValue(row.M12, row.m12),
                        M13: firstDefinedValue(row.M13, row.m13),
                        M14: firstDefinedValue(row.M14, row.m14),
                        M21: firstDefinedValue(row.M21, row.m21),
                        M22: firstDefinedValue(row.M22, row.m22),
                        M23: firstDefinedValue(row.M23, row.m23),
                        M24: firstDefinedValue(row.M24, row.m24),
                        M25: firstDefinedValue(row.M25, row.m25),
                        M26: firstDefinedValue(row.M26, row.m26),
                        M27: firstDefinedValue(row.M27, row.m27),
                        M31: firstDefinedValue(row.M31, row.m31, row.M31_o, row.M31_raw),
                        M32: firstDefinedValue(row.M32, row.m32),
                        M33: firstDefinedValue(row.M33, row.m33),
                        M41: firstDefinedValue(row.M41, row.m41),
                        M42: firstDefinedValue(row.M42, row.m42),
                        M43: firstDefinedValue(row.M43, row.m43),
                        M44: firstDefinedValue(row.M44, row.m44),
                    };
                }
            }

            const uniqueYears = [...new Set(ys)].sort((a, b) => a - b);
            if (!uniqueYears.length) throw new Error('Пустые данные');

            setParamsA(mapA);
            setParamsB(map);
            setParamsM(mapM);
            setYears(uniqueYears);
            setCurrentYear(uniqueYears[0]);

            const payload = {
                years: uniqueYears,
                currentYear: uniqueYears[0],
                paramsA: mapA,
                paramsB: map,
                paramsM: mapM,
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
        setParamsA((state) => ({
            ...state,
            [year]: state[year] || { ...DEFAULT_A_PARAMS },
        }));
        setParamsB((state) => ({
            ...state,
            [year]: state[year] || { ...DEFAULT_B_PARAMS },
        }));
        setParamsM((state) => ({
            ...state,
            [year]: state[year] || { ...DEFAULT_M_PARAMS },
        }));
    };

    // ---------------- 5. Расчёт ----------------
    const handleCompute = async () => {
        setBusy(true);
        try {
            const delay = 500;
            const payload = buildExportPayload(years, paramsA, paramsB, paramsM, inputMode);
            const object = await Api.calcMulti(payload);
            const computedClasses = Array.isArray(object?.classes) ? object.classes : [];

            const summary = computedClasses
                ? computedClasses.flatMap((block) => {
                    const firstRow = Array.isArray(block?.data) ? block.data[0] : null;
                    if (!firstRow) {
                        return [];
                    }
                    const total = firstRow.M_TOTAL_WITH_KI
                        ?? firstRow.A_TOTAL_WITH_KI
                        ?? firstRow.B_TOTAL_WITH_KI
                        ?? firstRow.sumB
                        ?? firstRow.TOTAL
                        ?? firstRow.A_TOTAL
                        ?? firstRow.B_TOTAL
                        ?? firstRow.M_TOTAL
                        ?? null;
                    const ki = firstRow.KI ?? firstRow.KI_A ?? firstRow.KI_B ?? firstRow.KI_M ?? null;
                    return [{ classType: block.classType, year: firstRow.year, total, ki }];
                })
                : [];
            setCalcSummary(summary);

            const bClass = computedClasses.find((c) => c.classType === 'B');
            const bFirstRow = Array.isArray(bClass?.data) ? bClass.data[0] : null;
            const iteration = Number(bFirstRow?.iteration) || 0;
            if (iteration) {
                setSelectedIteration(iteration);
                localStorage.setItem(STORAGE_KEY_ITERATION, String(iteration));
            }

            const metricNamesDto = buildMetricNamesDto(metricNames, bFirstRow?.calcResultId);
            if (metricNamesDto) {
                try {
                    await Api.updateMetricNames(metricNamesDto);
                } catch (e) {
                    console.warn('Ошибка сохранения пользовательских имён после расчёта', e);
                }
            }

            try {
                const historyObject = await Api.getHistoryAll();
                const classes = Array.isArray(historyObject?.classes) ? historyObject.classes : [];
                applyHistoryClasses(classes);
            } catch (e) {
                console.warn('Ошибка обновления истории после расчёта:', e);

                const fallbackClass = computedClasses.find((c) => c.classType === selectedAnalyticsClass)
                    || bClass
                    || computedClasses[0];
                const fallbackRows = Array.isArray(fallbackClass?.data) ? fallbackClass.data : [];
                setRows(fallbackRows);
                setItems([]);
                setMetricNames(extractMetricNamesFromResult(fallbackRows[0] || {}));
            }

            toast.success('Расчёт выполнен', {
                autoClose: delay,
            });
        } catch (err) {
            alert('Ошибка расчёта: ' + err.message);
        } finally {
            setBusy(false);
        }
    };

    const paramsAForYear = paramsA[currentYear] || DEFAULT_A_PARAMS;
    const params = paramsB[currentYear] || DEFAULT_B_PARAMS;
    const paramsMForYear = paramsM[currentYear] || DEFAULT_M_PARAMS;

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

    const correctiveCoefficientFields = [
        ['PNo', 'PNo'],
        ['PNv', 'PNv'],
        ['PNz', 'PNz'],
        ['DIo', 'Dlo'],
        ['DIv', 'Dlv'],
        ['DIz', 'Dlz'],
    ];

    const b22SubParamsFields = [
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
    ];

    const totalsModeGroupTitles = {
        1: 'Коэффициент KI класса B',
        2: 'Параметры B',
    };

    const totalsModeGroupTitlesA = {
        1: 'Коэффициент KI класса A',
        2: 'Параметры A',
    };

    const totalsModeGroupTitlesM = {
        1: 'Коэффициент KI класса M',
        2: 'Параметры M',
    };

    const metricModeGroupTitles = {
        1: 'Корректирующий коэффициент',
        2: metricNames.codeB11 || DEFAULT_METRIC_NAMES.codeB11,
        3: metricNames.codeB12 || DEFAULT_METRIC_NAMES.codeB12,
        4: metricNames.codeB13 || DEFAULT_METRIC_NAMES.codeB13,
        5: metricNames.codeB21 || DEFAULT_METRIC_NAMES.codeB21,
        6: metricNames.codeB22 || DEFAULT_METRIC_NAMES.codeB22,
        7: metricNames.codeB23 || DEFAULT_METRIC_NAMES.codeB23,
        8: metricNames.codeB24 || DEFAULT_METRIC_NAMES.codeB24,
        9: metricNames.codeB25 || DEFAULT_METRIC_NAMES.codeB25,
        10: metricNames.codeB26 || DEFAULT_METRIC_NAMES.codeB26,
        11: metricNames.codeB31 || DEFAULT_METRIC_NAMES.codeB31,
        12: metricNames.codeB32 || DEFAULT_METRIC_NAMES.codeB32,
        13: metricNames.codeB33 || DEFAULT_METRIC_NAMES.codeB33,
        14: metricNames.codeB34 || DEFAULT_METRIC_NAMES.codeB34,
        15: metricNames.codeB41 || DEFAULT_METRIC_NAMES.codeB41,
        16: metricNames.codeB42 || DEFAULT_METRIC_NAMES.codeB42,
        17: metricNames.codeB43 || DEFAULT_METRIC_NAMES.codeB43,
        18: metricNames.codeB44 || DEFAULT_METRIC_NAMES.codeB44,
    };

    const fieldsByGroupMetrics = {
        1: [
            ...correctiveCoefficientFields,
        ],
        2: [
            ['ENa', 'ENa'],
            ['ENb', 'ENb'],
            ['ENc', 'ENc'],
            ['Eb', 'Eb'],
            ['Ec', 'Ec'],
        ],
        3: [
            ['beta121', 'β121'],
            ['beta122', 'β122'],
        ],
        4: [
            ['beta131', 'β131'],
            ['beta132', 'β132'],
        ],
        5: [
            ['beta211', 'β211'],
            ['beta212', 'β212'],
        ],
        // extended metric groups (generic headings)
        6: b22SubParamsFields,
        7: [
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
        8: [
            ['NAo','NAo'],
            ['NAv','NAv'],
            ['NAz','NAz'],
            ['Po','Po'],
            ['Pv','Pv'],
            ['Pz','Pz'],
        ],
        9: b25Fields,
        10: b26Fields,
        11: [
            ['UT','UT'],
            ['DO','DO'],
        ],
        12: [
            ['N','N'],
            ['Npr','Npr'],
            ['VO','VO'],
            ['PO','PO'],
        ],
        13: [['B33','B33']],
        // new input groups for formulas B34..B44
        14: b34Fields,
        15: b41Fields,
        16: b42Fields,
        17: [
            ['Io','Io'],
            ['Iv','Iv'],
            ['Iz','Iz'],
            ['No','No'],
            ['Nv','Nv'],
            ['Nz','Nz'],
        ],
        18: b44Fields,
    };

    const totalsKiFieldsA = [['KI_A', 'KI_A']];
    const totalsFieldsA = [
        ['A11', 'A11'],
        ['A21', 'A21'],
        ['A22', 'A22'],
        ['A23', 'A23'],
        ['A31', 'A31'],
        ['A32', 'A32'],
        ['A33', 'A33'],
        ['A34', 'A34'],
        ['A35', 'A35'],
        ['A36', 'A36'],
        ['A37', 'A37'],
    ];

    const totalsKiFieldsB = [['KI_B', 'KI_B']];

    const totalsKiFieldsM = [['KI_M', 'KI_M']];
    const totalsFieldsM = [
        ['M11', 'M11'],
        ['M12', 'M12'],
        ['M13', 'M13'],
        ['M14', 'M14'],
        ['M21', 'M21'],
        ['M22', 'M22'],
        ['M23', 'M23'],
        ['M24', 'M24'],
        ['M25', 'M25'],
        ['M26', 'M26'],
        ['M27', 'M27'],
        ['M31', 'M31'],
        ['M32', 'M32'],
        ['M33', 'M33'],
        ['M41', 'M41'],
        ['M42', 'M42'],
        ['M43', 'M43'],
        ['M44', 'M44'],
    ];

    const fieldsByGroup = inputMode === 'totals'
        ? {
            1: totalsKiFieldsB,
            2: totalsFields,
        }
        : fieldsByGroupMetrics;

    const aGroupTitles = {
        1: 'Корректирующий коэффициент',
        2: 'A11 Исполнение КЦП прошлых лет',
        3: 'A21 Соотношение защиты/выпуск',
        4: 'A22 Соотношение защиты/прием',
        5: 'A23 Доля аспирантов с диссертациями',
        6: 'A31 Публикации на 100 НПР',
        7: 'A32 Доходы от НИОКР на 1 НПР',
        8: 'A33 Внебюджетные НИОКР на 1 НПР',
        9: 'A34 Иностранные аспиранты',
        10: 'A35 Доходы на 1 НПР',
        11: 'A36 Объем НИОКР на ставку',
        12: 'A37 Дополнительный индикатор',
    };

    const aFieldsByGroupTotals = {
        1: totalsKiFieldsA,
        2: totalsFieldsA,
    };

    const aFieldsByGroup = {
        1: [
            ['PNo', 'PNo'],
            ['PNv', 'PNv'],
            ['PNz', 'PNz'],
            ['DIo', 'DIo'],
            ['DIv', 'DIv'],
            ['DIz', 'DIz'],
        ],
        2: [['PRF', 'PRF'], ['KCO', 'KCO']],
        3: [['ZKN', 'ZKN'], ['CHVA', 'CHVA']],
        4: [['ZKN', 'ZKN'], ['CHPA', 'CHPA']],
        5: [['CZ', 'CZ'], ['CV', 'CV'], ['A23RF', 'A23RF']],
        6: [['WL2022', 'WL2022'], ['WL2023', 'WL2023'], ['WL2024', 'WL2024'], ['NPR2022', 'NPR2022'], ['NPR2023', 'NPR2023'], ['NPR2024', 'NPR2024']],
        7: [['DN2022', 'DN2022'], ['DN2023', 'DN2023'], ['DN2024', 'DN2024'], ['NPR2022', 'NPR2022'], ['NPR2023', 'NPR2023'], ['NPR2024', 'NPR2024']],
        8: [['RDN2022', 'RDN2022'], ['RDN2023', 'RDN2023'], ['RDN2024', 'RDN2024'], ['NPR2022', 'NPR2022'], ['NPR2023', 'NPR2023'], ['NPR2024', 'NPR2024']],
        9: [['IA2022', 'IA2022'], ['IA2023', 'IA2023'], ['IA2024', 'IA2024'], ['ASP2022', 'ASP2022'], ['ASP2023', 'ASP2023'], ['ASP2024', 'ASP2024']],
        10: [['OD2022', 'OD2022'], ['OD2023', 'OD2023'], ['OD2024', 'OD2024'], ['NPR2022', 'NPR2022'], ['NPR2023', 'NPR2023'], ['NPR2024', 'NPR2024']],
        11: [['PFN', 'PFN'], ['ASO', 'ASO']],
        12: [['DS', 'DS']],
    };

    const mGroupTitles = {
        1: 'M11 Целевой прием магистратуры',
        2: 'M12 Число заявлений на место',
        3: 'M13 Доля договорного приема',
        4: 'M14 Исполнение КЦП',
        5: 'M21 Наличие ПОА',
        6: 'M22 Соотношение (Асп+Орд+Асс)/Маг',
        7: 'M23 Соотношение ДПО/(БС+Маг+Орд+Асс)',
        8: 'M24 Доля целевого обучения',
        9: 'M25 Соотношение БС/Маг',
        10: 'M26 Программы в сетевой форме',
        11: 'M27 Обучающиеся в сетевой форме',
        12: 'M31 Доходы выпускников / ПМ',
        13: 'M32 Сохранность контингента',
        14: 'M33 Востребованность на рынке труда',
        15: 'M41 Публикации на 100 НПР',
        16: 'M42 Доходы от НИОКР на 1 НПР',
        17: 'M43 Доля иностранных обучающихся',
        18: 'M44 Доходы на 1 обучающегося',
    };

    const mFieldsByGroupTotals = {
        1: totalsKiFieldsM,
        2: totalsFieldsM,
    };

    const mFieldsByGroup = {
        1: [['ZMD', 'ZMD'], ['ZM', 'ZM']],
        2: [['CHZ', 'CHZ'], ['ZPK', 'ZPK']],
        3: [['MDP', 'MDP'], ['ZPK', 'ZPK']],
        4: [['PRF', 'PRF'], ['KCO', 'KCO']],
        5: [['M21_poa', 'НПС с ПОА'], ['M21_licensed', 'Лицензированные НПС']],
        6: [['M22_NMo', 'NMo'], ['M22_NMv', 'NMv'], ['M22_NMz', 'NMz'], ['M22_ACo', 'ACo'], ['M22_ACv', 'ACv'], ['M22_ACz', 'ACz'], ['M22_OPC', 'OPC'], ['M22_ACC', 'ACC']],
        7: [['M23_No', 'No'], ['M23_Nv', 'Nv'], ['M23_Nz', 'Nz'], ['M23_KPo', 'KPo'], ['M23_KPv', 'KPv'], ['M23_KPz', 'KPz'], ['M23_PPPo', 'PPPo'], ['M23_PPPv', 'PPPv'], ['M23_PPPz', 'PPPz'], ['M23_NOA', 'NOA']],
        8: [['M24_NAP', 'NAP'], ['M24_PN', 'PN']],
        9: [['M25_BPo', 'BPo'], ['M25_BPv', 'BPv'], ['M25_BPz', 'BPz'], ['M25_CPo', 'CPo'], ['M25_CPv', 'CPv'], ['M25_CPz', 'CPz'], ['M25_NMo', 'NMo'], ['M25_NMv', 'NMv'], ['M25_NMz', 'NMz']],
        10: [['M26_CHPSi2022', 'CHPSi2022'], ['M26_CHPi2022', 'CHPi2022'], ['M26_CHPSi2023', 'CHPSi2023'], ['M26_CHPi2023', 'CHPi2023'], ['M26_CHPSi2024', 'CHPSi2024'], ['M26_CHPi2024', 'CHPi2024']],
        11: [['M27_CHOSi2022', 'CHOSi2022'], ['M27_CHOi2022', 'CHOi2022'], ['M27_CHOSi2023', 'CHOSi2023'], ['M27_CHOi2023', 'CHOi2023'], ['M27_CHOSi2024', 'CHOSi2024'], ['M27_CHOi2024', 'CHOi2024']],
        12: [['M31_o', 'M31_o']],
        13: [['N', 'N'], ['Npr', 'Npr'], ['VO', 'VO'], ['PO', 'PO']],
        14: [['NR2023', 'NR2023'], ['NR2024', 'NR2024'], ['NR2025', 'NR2025']],
        15: [['WL2022', 'WL2022'], ['WL2023', 'WL2023'], ['WL2024', 'WL2024'], ['NPR2022', 'NPR2022'], ['NPR2023', 'NPR2023'], ['NPR2024', 'NPR2024']],
        16: [['DN2022', 'DN2022'], ['DN2023', 'DN2023'], ['DN2024', 'DN2024'], ['NPR2022', 'NPR2022'], ['NPR2023', 'NPR2023'], ['NPR2024', 'NPR2024']],
        17: [['Io', 'Io'], ['Iv', 'Iv'], ['Iz', 'Iz'], ['No', 'No'], ['Nv', 'Nv'], ['Nz', 'Nz']],
        18: [['OD2022', 'OD2022'], ['OD2023', 'OD2023'], ['OD2024', 'OD2024'], ['NO2022', 'NO2022'], ['NV2022', 'NV2022'], ['NZ2022', 'NZ2022'], ['NOA2022', 'NOA2022'], ['NO2023', 'NO2023'], ['NV2023', 'NV2023'], ['NZ2023', 'NZ2023'], ['NOA2023', 'NOA2023'], ['NO2024', 'NO2024'], ['NV2024', 'NV2024'], ['NZ2024', 'NZ2024'], ['NOA2024', 'NOA2024']],
    };

    const metricKeys = resolveMetricKeys(rows, selectedAnalyticsClass);

    const handleToggleYear = (year) => {
        setVisibleYears((prev) => ({
            ...prev,
            [year]: !prev[year],
        }));
    };

    const handleMetricNamesChange = (patch) => {
        setMetricNames((prev) => {
            const next = { ...prev, ...patch };
            const first = rows[0];

            if (first && first.calcResultId) {
                const dto = { calcResultId: first.calcResultId };
                Object.keys(next).forEach((k) => {
                    if (k.startsWith('code')) {
                        dto[k] = next[k];
                    }
                });
                Api.updateMetricNames(dto)
                    .then(() => {
                        toast.success('✓ Названия метрик сохранены');
                    })
                    .catch((e) => {
                        console.warn('Ошибка сохранения имён метрик', e);
                        toast.error('✗ Ошибка при сохранении метрик');
                    });
            }

            return next;
        });
    };

    return (
        <div className="input-v2-layout">
            <Analytics
                rows={rows}
                metricNames={metricNames}
                classType={selectedAnalyticsClass}
                availableClassTypes={historyClasses.map((item) => item.classType)}
                onClassTypeChange={setSelectedAnalyticsClass}
                metricKeys={metricKeys}
                visibleYears={visibleYears}
                onToggleYear={handleToggleYear}
            />

            <div className="card big-card input-v2-card">
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

                <div className="input-mode-row">
                    <span>Режим ввода:</span>
                    <select
                        className="num-input"
                        value={inputMode}
                        onChange={(e) => setInputMode(e.target.value)}
                    >
                        <option value="metrics">Через метрики</option>
                        <option value="totals">Через итоговые значения параметров</option>
                    </select>
                </div>

                {calcSummary.length > 0 && (
                    <div className="card" style={{ marginBottom: 16, padding: 12 }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
                            <strong>Результат последнего расчёта:</strong>
                            {calcSummary.map((item) => (
                                <span key={`${item.classType}-${item.year}`} className="history-chip">
                                    {item.classType} {item.year}: {item.total != null ? Number(item.total).toFixed(3) : 'n/a'}
                                    {item.ki != null ? `, KI=${Number(item.ki).toFixed(3)}` : ''}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                <div className="input-metrics-layout">
                    <div className="input-grid">
                        <ClassList
                            className="Класс A"
                            fieldsByGroup={inputMode === 'totals' ? aFieldsByGroupTotals : aFieldsByGroup}
                            params={paramsAForYear}
                            handleParamChange={handleParamChangeA}
                            metricNames={{}}
                            groupTitles={inputMode === 'totals' ? totalsModeGroupTitlesA : aGroupTitles}
                        />
                        <ClassList
                            className="Класс B"
                            fieldsByGroup={fieldsByGroup}
                            params={params}
                            handleParamChange={handleParamChangeB}
                            metricNames={metricNames}
                            groupTitles={inputMode === 'totals' ? totalsModeGroupTitles : metricModeGroupTitles}
                        />
                        <ClassList
                            className="Класс M"
                            fieldsByGroup={inputMode === 'totals' ? mFieldsByGroupTotals : mFieldsByGroup}
                            params={paramsMForYear}
                            handleParamChange={handleParamChangeM}
                            metricNames={{}}
                            groupTitles={inputMode === 'totals' ? totalsModeGroupTitlesM : mGroupTitles}
                        />
                    </div>

                    <aside className="metrics-side-table">
                        <ResultsTable
                            rows={rows}
                            metricNames={metricNames}
                            metricKeys={metricKeys}
                            onMetricNamesChange={false}
                            visibleYears={visibleYears}
                            onToggleYear={handleToggleYear}
                            allowMetricNameEditing={false}
                            classType={selectedAnalyticsClass}
                        />
                    </aside>
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
            <div id="history-section" />
            <History
                items={items}
                setRows={setRows}
                selectedIteration={selectedIteration}
                setSelectedIteration={setSelectedIteration}
                classType={selectedAnalyticsClass}
                maxItems={5}
            />
        </div>
    );
}
