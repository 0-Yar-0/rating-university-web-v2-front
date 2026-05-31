// Default metric names (Russian)
export const DEFAULT_METRIC_NAMES = {
    codeClassA: 'А',
    codeClassB: 'Б',
    codeClassV: 'М',
    codeClassM: 'М',
    
    // Class B metrics (fixed code names — no auto-renaming)
    codeB11: 'B11',
    codeB12: 'B12',
    codeB13: 'B13',
    codeB21: 'B21',
    codeB22: 'B22',
    codeB23: 'B23',
    codeB24: 'B24',
    codeB25: 'B25',
    codeB26: 'B26',
    codeB31: 'B31',
    codeB32: 'B32',
    codeB33: 'B33',
    codeB34: 'B34',
    codeB41: 'B41',
    codeB42: 'B42',
    codeB43: 'B43',
    codeB44: 'B44',
};

// Helper function to get metric name with fallback
export const getMetricName = (metricNames, codeKey) => {
    return metricNames?.[codeKey] || DEFAULT_METRIC_NAMES[codeKey] || codeKey.toUpperCase();
};
