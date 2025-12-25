import React from 'react';

interface Props {
    currentFilter: string;
    onFilterChange: (filter: string) => void;
}

const DateFilter: React.FC<Props> = ({ currentFilter, onFilterChange }) => {
    const filters = [
        { id: 'all', label: 'ทั้งหมด' },
        { id: 'this_month', label: 'เดือนนี้' },
        { id: 'last_30_days', label: '30 วันล่าสุด' },
        { id: 'last_7_days', label: '7 วันล่าสุด' },
    ];

    return (
        <div className="bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-1">
            {filters.map((f) => (
                <button
                    key={f.id}
                    onClick={() => onFilterChange(f.id)}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 
                        ${currentFilter === f.id 
                            ? 'bg-blue-600 text-white shadow-sm' 
                            : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                        }`}
                >
                    {f.label}
                </button>
            ))}
        </div>
    );
};

export default DateFilter;