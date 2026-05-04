// Default metric names (Russian)
export const DEFAULT_METRIC_NAMES = {
    codeClassA: 'А',
    codeClassB: 'Б',
    codeClassV: 'М',
    codeClassM: 'М',
    
    // Class B metrics
    codeB11: 'Б11 - Средний балл ЕГЭ',
    codeB12: 'Б12 - Исполнение КЦП прошлых лет',
    codeB13: 'Б13 - Магистранты из стран БРИКС',
    codeB21: 'Б21 - Наличие ПОА',
    codeB22: 'Б22 - Учебная аккредитация',
    codeB23: 'Б23 - Количество ОП с аккредитацией',
    codeB24: 'Б24 - Развитие системы качества',
    codeB25: 'Б25 - Участие в сетевом взаимодействии',
    codeB26: 'Б26 - Инновационная деятельность',
    codeB31: 'Б31 - Трудоустройство выпускников',
    codeB32: 'Б32 - Средняя зарплата выпускников',
    codeB33: 'Б33 - Удовлетворённость компаний выпускниками',
    codeB34: 'Б34 - Карьерное развитие выпускников',
    codeB41: 'Б41 - Публикации на 100 НПР',
    codeB42: 'Б42 - Цитирования в международных БД',
    codeB43: 'Б43 - Участие в зарубежных проектах',
    codeB44: 'Б44 - Инновационные разработки',
};

// Helper function to get metric name with fallback
export const getMetricName = (metricNames, codeKey) => {
    return metricNames?.[codeKey] || DEFAULT_METRIC_NAMES[codeKey] || codeKey.toUpperCase();
};
