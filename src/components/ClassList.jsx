import React from 'react';
import NumericField from './NumericField'; // Adjust the import path as needed

const ClassList = ({ className, fieldsByGroup, params, handleParamChange, metricNames, groupTitles = {} }) => {
    const metricNamesArray = Object.values(metricNames);

    return (
        <div className="class-list">
            <h2>{className}</h2>
            {Object.keys(fieldsByGroup).map((group, i) => (
                <div key={group} className="group-list">
                    <h3>{groupTitles[group] || metricNamesArray[i-1] || `Параметр ${group-1}`}</h3>
                    <div className="params-grid">
                        {fieldsByGroup[0].map([key, label])||fieldsByGroup[group-1].map(([key, label]) => (
                            <NumericField
                                key={key}
                                label={label}
                                value={params[key]}
                                onChange={(v) => handleParamChange(key, v)}
                            />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ClassList;