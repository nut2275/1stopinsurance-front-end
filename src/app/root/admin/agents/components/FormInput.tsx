import React from 'react';
import { FormInputProps } from '../types';

const FormInput: React.FC<FormInputProps> = ({ label, name, value, onChange, type = "text", required = false, icon }) => (
    <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <div className="relative">
            {icon && <div className="absolute left-3 top-3 text-slate-400">{icon}</div>}
            <input 
                type={type} name={name} required={required}
                className={`w-full ${icon ? 'pl-10' : 'px-4'} py-2.5 bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm transition-all`}
                value={value || ''} onChange={onChange} 
            />
        </div>
    </div>
);

export default FormInput;