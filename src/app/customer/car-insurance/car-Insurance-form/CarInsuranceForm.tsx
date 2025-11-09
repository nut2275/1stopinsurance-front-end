"use client";

import React, { useState, useEffect, useMemo, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { DriveEta, CalendarToday, Build, CheckCircle } from '@mui/icons-material';

// ------------------- Type Definitions ที่ถูกต้อง -------------------
// กำหนดโครงสร้างข้อมูลรถยนต์ที่ชัดเจน
interface CarModels {
    [model: string]: string[]; // รุ่นรถยนต์จะ map ไปยัง Array ของรุ่นย่อย (string[])
}

interface CarData {
    [brand: string]: CarModels; // ยี่ห้อรถยนต์จะ map ไปยัง Object ของรุ่นรถยนต์
}

// ------------------- Mock Car Data (ใช้ตามข้อมูลที่คุณให้มา) -------------------
// และกำหนด Type CarData ให้กับมัน
const carData: CarData = {
    "Toyota": {
        "Corolla Altis": ["1.6 G", "1.8 Hybrid", "GR Sport"],
        "Yaris": ["Sport", "Smart", "Premium", "Premium S"],
        "Yaris Ativ": ["Sport", "Smart", "Premium", "Premium Luxuly"],
        "Hilux Revo / Hilux": ["Entry Cab", "Smart Cab", "Revo 2.4", "2.8 4x4", "Rocco"],
        "Fortuner": ["2.4 4x2", "2.8 4x4", "GR Sport"],
        "RAV4": ["Entry", "Hybrid", "Adventure"],
        "Camry": ["2.0 G", "2.5 Hybrid"],
        "Vios": ["E", "G", "S"],
        "Avanza / Veloz": ["1.5 G", "Veloz Premium"],
        "Inn o va / Innova": ["V", "Hybrid"],
        "C-HR": ["Entry", "High"],
        "Alphard / Vellfire": ["Executive Lounge", "Hybrid"]
    },
    "Honda": {
        "City": ["S", "SV", "RS", "e:HEV"],
        "Civic": ["EL", "RS Turbo", "e:HEV RS"],
        "CR-V": ["G", "RS", "e:HEV"],
        "HR-V": ["E", "EL", "RS", "e:HEV"],
        "BR-V": ["V", "RS"],
        "Accord": ["Hybrid"]
    },
    "Mazda": {
        "Mazda 2": ["1.3 E", "1.5 C", "SP"],
        "Mazda 3": ["2.0 C", "2.0 S", "2.0 SP"],
        "CX-3": ["Base", "Pro"],
        "CX-30": ["Base", "SP"],
        "CX-5": ["2.0 C", "2.2 XDL", "2.5 Turbo"],
        "CX-8": ["2.5 C", "2.5 SP"]
    },
    "Isuzu": {
        "D-Max": ["1.9 S", "1.9 Z", "3.0 Hi-Lander", "4x4"],
        "MU-X": ["1.9 Elegant", "3.0 Ultimate", "4WD Active"]
    },
    "Mitsubishi": {
        "Triton": ["GL", "GLS", "Athlete"],
        "Pajero Sport": ["GT", "4WD GT Premium"],
        "Xpander": ["1.5 GLS", "Cross"]
    },
    "Nissan": {
        "Almera": ["EL Turbo", "VL Turbo", "Sportech"],
        "Navara": ["Calibre E", "Pro-4X", "VL 4WD"],
        "Kicks": ["E-Power", "V"],
        "Note / Note e-Power": ["Active", "VL"]
    },
    "Ford": {
        "Ranger": ["XL", "XLT", "Wildtrak"],
        "Everest": ["Sport", "Titanium"],
        "Bronco / Bronco Sport": ["Base", "Badlands"]
    },
    "MG": {
        "MG3": ["Standard", "Hybrid+"],
        "ZS": ["1.5", "EV"],
        "HS": ["1.5 Turbo", "PHEV"],
        "ZST": ["HEV", "EV"],
        "Extender": ["GC", "DC"],
        "Maxus (MPV/Pickup)": ["V80", "T90"]
    },
    "Hyundai": {
        "H-1 / Staria": ["Van", "Premium"],
        "Tucson": ["GLS", "Turbo"],
        "Santa Fe": ["GLS", "Hybrid"],
        "Kona": ["EV", "Gasoline"]
    },
    "Kia": {
        "Seltos": ["Base", "Top"],
        "Sportage": ["1.6 Turbo", "Hybrid"],
        "Carnival": ["Premium", "Executive"]
    },
    "Suzuki": {
        "Swift": ["GL", "RS"],
        "Celerio": ["GL"],
        "Jimny": ["3-door", "5-door (import)"],
        "Ertiga": ["GL", "GX"]
    },
    "Subaru": {
        "Forester": ["2.0i-L", "Sport"],
        "Outback": ["2.5i", "Touring"],
        "XV": ["2.0i-L"]
    },
    "BMW": {
        "Series 1": ["116i", "118i"],
        "Series 3": ["320i", "330i"],
        "Series 5": ["520d", "530i"],
        "X1 / X3 / X5": ["sDrive", "xDrive variants"]
    },
    "Mercedes-Benz": {
        "A-Class": ["A200", "A250"],
        "C-Class": ["C200", "C300"],
        "E-Class": ["E200", "E300"],
        "GLA / GLC / GLE": ["various trims"]
    },
    "Lexus": {
        "IS": ["300", "350"],
        "ES": ["250", "300h"],
        "NX": ["250", "350h"],
        "RX": ["300", "450h"]
    },
    "Volvo": {
        "XC40": ["B4", "Recharge"],
        "XC60": ["B5", "Recharge"],
        "XC90": ["B5", "T8 Recharge"]
    },
    "Chevrolet": {
        "Trailblazer": ["LS", "LT", "Premier"],
        "Colorado": ["Base", "High Country"],
        "Captiva": ["Base", "Pro"]
    },
    "Porsche": {
        "Cayenne": ["Base", "S", "Turbo"],
        "Macan": ["Base", "S", "GTS"],
        "911": ["Carrera", "Turbo"]
    },
    "BYD": {
        "Dolphin": ["Standard", "Pro"],
        "Seal": ["Base", "Performance"],
        "Atto 3": ["Standard", "Long Range"]
    },
    "GWM / Haval": {
        "Haval Jolion": ["Pro", "Premium"],
        "Haval H6": ["Ultra", "Hybrid"],
        "GWM Poer / P-Series": ["Single Cab", "Double Cab"]
    },
    "Changan": {
        "UNI-T": ["Base", "Top"],
        "Alsvin": ["GL", "GLS"]
    },
    "Tesla": {
        "Model 3": ["Standard", "Long Range"],
        "Model Y": ["Standard", "Performance"]
    },
    "VinFast": {
        "VF e34": ["Base", "Plus"],
        "VF 8 / VF 9": ["Standard", "Premium"]
    },
    "Peugeot / Renault": {
        "Peugeot 3008": ["Active", "Allure"],
        "Renault Captur": ["Life", "Intense"]
    },
    "Jeep / Land Rover": {
        "Jeep Wrangler": ["Sport", "Sahara"],
        "Land Rover Defender": ["90", "110"]
    }
};


// ------------------- Component -------------------

export default function CarInsuranceForm() {
    const router = useRouter();

    const [selectedType, setSelectedType] = useState<string>('ชั้น 1');
    const [year, setYear] = useState<string>('');
    const [brand, setBrand] = useState<string>('');
    const [model, setModel] = useState<string>('');
    const [submodel, setSubmodel] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);

    // 1. Memoized List of Years
    const yearOptions = useMemo(() => {
        const currentYear = new Date().getFullYear();
        const years = [];
        for (let y = currentYear; y >= 2005; y--) {
            years.push(y.toString());
        }
        return years;
    }, []);

    // 2. Logic สำหรับรีเซ็ตค่า เมื่อ Dropdown ก่อนหน้าเปลี่ยน
    useEffect(() => {
        // เมื่อ year เปลี่ยน, reset brand, model, submodel
        if (year) {
            setBrand('');
            setModel('');
            setSubmodel('');
        }
    }, [year]);

    useEffect(() => {
        // เมื่อ brand เปลี่ยน, reset model, submodel
        if (brand) {
            setModel('');
            setSubmodel('');
        }
    }, [brand]);

    useEffect(() => {
        // เมื่อ model เปลี่ยน, reset submodel
        if (model) {
            setSubmodel('');
        }
    }, [model]);


    // 3. Handle Submit
    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();

        if (!year || !brand || !model || !submodel) {
            // ใช้ console.error แทน alert() ตามหลักการของ React/Next.js
            console.error("กรุณากรอกข้อมูลรถยนต์ให้ครบถ้วนทุกช่อง"); 
            return;
        }

        setIsLoading(true);

        const body = {
            year,
            carBrand: brand,
            model,
            subModel: submodel,
            level: selectedType
        };

        try {
            // ************ การเรียก API ใน Next.js ************
            const query = new URLSearchParams(body).toString();
            // ** URL นี้เป็นเพียงตัวอย่าง ควรเปลี่ยนเป็น API Endpoint จริงของคุณ **
            const res = await fetch(`http://localhost:3000/api/plans?${query}`); 
            const data = await res.json();
            
            // เก็บผลลัพธ์
            localStorage.setItem("recommendedPlans", JSON.stringify(data));
            
            router.push("/customer/car-insurance/insurance");

        } catch (err) {
            console.error("Error fetching plans:", err);
            localStorage.setItem("recommendedPlans", JSON.stringify([]));
            router.push("/customer/car-insurance/insurance");
        } finally {
            setIsLoading(false);
        }
    };


    // ------------------- UI Rendering -------------------
    
    // ** แก้ไข: สร้าง Array รุ่นย่อยสำหรับ Map อย่างปลอดภัย **
    const submodelList = brand && model ? carData[brand]?.[model] : [];

    return (
        <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-2xl p-8 lg:p-10 border-t-4 border-blue-600">
            <h1 className="text-center text-3xl font-extrabold text-blue-900 mb-4 tracking-tight">
                เช็คเบี้ย เปรียบเทียบ ประกันรถยนต์
            </h1>
            <p className="text-center text-gray-600 mb-8 text-lg">กรอกข้อมูล 4 ขั้นตอนเพื่อค้นหาแผนประกันที่เหมาะกับคุณ</p>

            <form className="space-y-8" onSubmit={handleSubmit}>
                
                {/* 1. ประเภทประกัน */}
                <div>
                    <label className="block font-bold mb-3 text-blue-700 text-lg flex items-center">
                       <CheckCircle className="mr-2 text-2xl"/> เลือกความคุ้มครองหลัก *
                    </label>
                    <div className="flex flex-wrap gap-2 sm:gap-3">
                        {['ชั้น 1', 'ชั้น 2+', 'ชั้น 2', 'ชั้น 3+', 'ชั้น 3', 'ไม่ระบุ'].map((type) => (
                            <button
                                key={type}
                                type="button"
                                onClick={() => setSelectedType(type)}
                                className={`
                                    px-4 py-2 rounded-full font-medium transition duration-300 whitespace-nowrap text-sm sm:text-base
                                    ${selectedType === type
                                        ? 'bg-blue-600 text-white shadow-md border-blue-700 scale-[1.02]'
                                        : 'bg-white text-blue-700 border border-blue-600 hover:bg-blue-50 hover:border-blue-700'
                                    }
                                `}
                            >
                                {type}
                            </button>
                        ))}
                    </div>
                </div>

                {/* 2. ปีรถยนต์ + ยี่ห้อ */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block mb-2 font-bold text-gray-700 flex items-center">
                            <CalendarToday style={{ fontSize: '1.2rem' }} className="mr-2 text-blue-500" /> ปีรถยนต์ *
                        </label>
                        <select
                            value={year}
                            onChange={(e) => setYear(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 appearance-none bg-white focus:ring-2 focus:ring-blue-300 transition"
                        >
                            <option value="" disabled>เลือกปีรถยนต์</option>
                            {yearOptions.map((y) => (
                                <option key={y} value={y}>{y}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block mb-2 font-bold text-gray-700 flex items-center">
                            <DriveEta style={{ fontSize: '1.2rem' }} className="mr-2 text-blue-500" /> ยี่ห้อรถยนต์ *
                        </label>
                        <select
                            value={brand}
                            onChange={(e) => setBrand(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 appearance-none bg-white focus:ring-2 focus:ring-blue-300 transition"
                            disabled={!year}
                        >
                            <option value="" disabled>เลือกยี่ห้อ</option>
                            {year && Object.keys(carData).map((b) => (
                                <option key={b} value={b}>{b}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* 3. รุ่น + รุ่นย่อย */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block mb-2 font-bold text-gray-700 flex items-center">
                             <Build style={{ fontSize: '1.2rem' }} className="mr-2 text-blue-500" /> รุ่นรถยนต์ *
                        </label>
                        <select
                            value={model}
                            onChange={(e) => setModel(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 appearance-none bg-white focus:ring-2 focus:ring-blue-300 transition"
                            disabled={!brand}
                        >
                            <option value="" disabled>เลือกรุ่น</option>
                            {/* เข้าถึงอย่างปลอดภัย: เช็คว่า brand มีค่า และใช้ Object.keys */}
                            {brand && carData[brand] && Object.keys(carData[brand]).map((m) => (
                                <option key={m} value={m}>{m}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block mb-2 font-bold text-gray-700 flex items-center">
                            <DriveEta style={{ fontSize: '1.2rem' }} className="mr-2 text-blue-500" /> รุ่นย่อย *
                        </label>
                        <select
                            value={submodel}
                            onChange={(e) => setSubmodel(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 appearance-none bg-white focus:ring-2 focus:ring-blue-300 transition"
                            disabled={!model}
                        >
                            <option value="" disabled>เลือกรุ่นย่อย</option>
                            {/* ใช้ submodelList ที่ถูกตรวจสอบและกำหนด Type แล้ว */}
                            {submodelList.map((s: string) => ( 
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Submit */}
                <div className="text-center pt-4">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`
                            mt-4 w-full bg-blue-600 text-white font-extrabold py-3 rounded-lg text-lg shadow-lg
                            hover:bg-blue-700 transition duration-300 transform hover:scale-[1.01]
                            ${isLoading ? 'bg-gray-400 cursor-not-allowed' : ''}
                        `}
                    >
                        {isLoading ? 'กำลังค้นหา...' : 'ค้นหาแผนประกัน'}
                    </button>
                </div>
            </form>
        </div>
    );
}