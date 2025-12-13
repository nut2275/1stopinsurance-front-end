  // src/components/SurveyForm.tsx
  "use client";

  import { useState, FormEvent } from 'react';
  import { useRouter } from 'next/navigation';
  import { InsuranceAnswers, Budget, Repair, Coverage, Usage, Accident, initialAnswers } from '@/types/Survey'; // ต้องมี initialAnswers และ types
  // 1. นำเข้า MUI Icons
  import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
  import BuildIcon from '@mui/icons-material/Build';
  import SecurityIcon from '@mui/icons-material/Security';
  import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
  import WarningIcon from '@mui/icons-material/Warning';
  import DoneIcon from '@mui/icons-material/Done'; // สำหรับ Checkmark

  // ------------------- Component -------------------

  export default function SurveyForm() {
    const [answers, setAnswers] = useState<InsuranceAnswers>(initialAnswers);
    const router = useRouter();

    // 4. Handle Radio Button Changes (Logic เดิม)
    const handleRadioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setAnswers(prev => ({
        ...prev,
        [name]: value,
      }));
    };

    // 5. Handle Checkbox Changes (Coverage) (Logic เดิม)
    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { value, checked } = e.target;
      setAnswers(prev => {
        const newCoverage = checked
          ? [...prev.coverage, value as Coverage]
          : prev.coverage.filter(v => v !== value);

        return {
          ...prev,
          coverage: newCoverage,
        };
      });
    };

    // 6. Handle Form Submission (Logic เดิม)
    const handleSubmit = (e: FormEvent) => {
      e.preventDefault();

      const requiredFields: (keyof InsuranceAnswers)[] = ['budget', 'repair', 'usage', 'accident'];
      const isFormValid = requiredFields.every(field => answers[field] !== undefined) && answers.coverage.length > 0;

      if (!isFormValid) {
        alert("กรุณาตอบคำถามให้ครบทุกข้อก่อนส่งคำตอบ!");
        return;
      }

      try {
        localStorage.setItem("insuranceAnswers", JSON.stringify(answers));
        router.push("/customer/car-insurance/insurance");
      } catch (error) {
        console.error("Error saving to localStorage:", error);
        alert("เกิดข้อผิดพลาดในการบันทึกคำตอบ!");
      }
    };


    // ------------------- Custom Input Component (ปรับ Icon) -------------------
    interface CardOptionProps {
      name: keyof InsuranceAnswers;
      value: string;
      label: string;
      checked: boolean;
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
      type: 'radio' | 'checkbox';
    }

    const CardOption: React.FC<CardOptionProps> = ({ name, value, label, checked, onChange, type }) => {
      const baseClasses = "block p-4 border-2 rounded-xl transition-all duration-300 cursor-pointer text-center";
      const checkedClasses = type === 'radio'
        ? "bg-blue-600 border-blue-600 text-white shadow-lg scale-[1.03]"
        : checked
          ? "bg-green-500 border-green-500 text-white shadow-lg scale-[1.03]"
          : "bg-gray-100 border-gray-200 text-gray-700 hover:bg-gray-200";

      const uncheckedClasses = "bg-white border-gray-300 text-gray-700 hover:border-blue-400 shadow-md";

      return (
        <label className={`${baseClasses} ${checked ? checkedClasses : uncheckedClasses} relative`}>
          <input
            type={type}
            name={name}
            value={value}
            checked={checked}
            onChange={onChange}
            className="absolute opacity-0 w-0 h-0"
          />
          {/* 2. ใช้ MUI Icon สำหรับ Custom Checkmark/Radio Dot */}
          {checked && (
            <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-white flex items-center justify-center shadow-md">
              <DoneIcon className="text-blue-600" style={{ fontSize: '1.2rem' }} />
            </div>
          )}
          <span className="font-semibold text-base">{label}</span>
        </label>
      );
    };
  //← ย้อนกลับ
    // ------------------- UI Rendering *********
    return (
      <div className="max-w-3xl mx-auto bg-white p-10 rounded-[2rem] shadow-3xl border border-gray-100 mt-8 mb-12">
        <h1 className="text-center text-4xl font-extrabold text-blue-800 mb-4 tracking-tighter">
          ค้นหาประกันที่ใช่สำหรับคุณ 🚀
        </h1>
        <p className="text-center text-gray-600 mb-10 text-lg">ตอบคำถาม 5 ข้อเพื่อรับคำแนะนำประกันรถยนต์ที่ดีที่สุด</p>

        <form onSubmit={handleSubmit} className="space-y-10">

          {/* Question Card: 1. งบประมาณ */}
          <div className="p-6 border-l-4 border-blue-500 rounded-lg bg-gray-50 shadow-inner">
            <p className="font-bold text-xl text-blue-800 mb-4 flex items-center">
              {/* 3. ใช้ MUI Icon */}
              <AttachMoneyIcon className="mr-3 text-3xl"/> 1. งบประมาณที่ตั้งไว้ต่อปี
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <CardOption name="budget" value="low" label="ไม่เกิน 5,000 บาท" type="radio" checked={answers.budget === 'low'} onChange={handleRadioChange} />
              <CardOption name="budget" value="mid-low" label="5,000 – 8,000 บาท" type="radio" checked={answers.budget === 'mid-low'} onChange={handleRadioChange} />
              <CardOption name="budget" value="mid" label="8,000 – 12,000 บาท" type="radio" checked={answers.budget === 'mid'} onChange={handleRadioChange} />
              <CardOption name="budget" value="high" label="ไม่จำกัด" type="radio" checked={answers.budget === 'high'} onChange={handleRadioChange} />
            </div>
          </div>
          
          {/* Question Card: 2. สถานที่ซ่อม */}
          <div className="p-6 border-l-4 border-blue-500 rounded-lg bg-gray-50 shadow-inner">
            <p className="font-bold text-xl text-blue-800 mb-4 flex items-center">
              <BuildIcon className="mr-3 text-3xl"/> 2. สถานที่ในการซ่อม
            </p>
            <div className="grid grid-cols-3 gap-3">
              <CardOption name="repair" value="ศูนย์" label="ซ่อมห้าง (ศูนย์)" type="radio" checked={answers.repair === 'ศูนย์'} onChange={handleRadioChange} />
              <CardOption name="repair" value="อู่" label="ซ่อมอู่" type="radio" checked={answers.repair === 'อู่'} onChange={handleRadioChange} />
              <CardOption name="repair" value="both" label="ซ่อมอู่ หรือ ห้าง" type="radio" checked={answers.repair === 'both'} onChange={handleRadioChange} />
            </div>
          </div>

          {/* Question Card: 3. ความคุ้มครอง (Checkbox) */}
          <div className="p-6 border-l-4 border-green-500 rounded-lg bg-gray-50 shadow-inner">
            <p className="font-bold text-xl text-green-700 mb-4 flex items-center">
              <SecurityIcon className="mr-3 text-3xl"/> 3. ความคุ้มครองที่ต้องการ (เลือกได้หลายข้อ)
            </p>
            <div className="grid grid-cols-2 gap-3">
              <CardOption name="coverage" value="all" label="คุ้มครองทุกอย่าง" type="checkbox" checked={answers.coverage.includes('all')} onChange={handleCheckboxChange} />
              <CardOption name="coverage" value="car" label="รถยนต์เสียหาย" type="checkbox" checked={answers.coverage.includes('car')} onChange={handleCheckboxChange} />
              <CardOption name="coverage" value="fire" label="สูญหาย ไฟไหม้" type="checkbox" checked={answers.coverage.includes('fire')} onChange={handleCheckboxChange} />
              <CardOption name="coverage" value="basic" label="คุ้มครองเฉพาะคู่กรณี" type="checkbox" checked={answers.coverage.includes('basic')} onChange={handleCheckboxChange} />
            </div>
          </div>

          {/* Question Card: 4. ความถี่การใช้รถ */}
          <div className="p-6 border-l-4 border-blue-500 rounded-lg bg-gray-50 shadow-inner">
            <p className="font-bold text-xl text-blue-800 mb-4 flex items-center">
              <DirectionsCarIcon className="mr-3 text-3xl"/> 4. ความถี่ในการใช้รถ
            </p>
            <div className="grid grid-cols-3 gap-3">
              <CardOption name="usage" value="low" label="สัปดาห์ละ 1-2 วัน" type="radio" checked={answers.usage === 'low'} onChange={handleRadioChange} />
              <CardOption name="usage" value="mid" label="สัปดาห์ละ 3-5 วัน" type="radio" checked={answers.usage === 'mid'} onChange={handleRadioChange} />
              <CardOption name="usage" value="high" label="ทุกวัน" type="radio" checked={answers.usage === 'high'} onChange={handleRadioChange} />
            </div>
          </div>

          {/* Question Card: 5. ความถี่การเกิดอุบัติเหตุ */}
          <div className="p-6 border-l-4 border-red-500 rounded-lg bg-gray-50 shadow-inner">
            <p className="font-bold text-xl text-red-700 mb-4 flex items-center">
              <WarningIcon className="mr-3 text-3xl"/> 5. ความถี่ในการเกิดอุบัติเหตุ
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <CardOption name="accident" value="never" label="ไม่เคยเกิด" type="radio" checked={answers.accident === 'never'} onChange={handleRadioChange} />
              <CardOption name="accident" value="rare" label="ปีละ 1-3 ครั้ง" type="radio" checked={answers.accident === 'rare'} onChange={handleRadioChange} />
              <CardOption name="accident" value="sometimes" label="ปีละ 3-5 ครั้ง" type="radio" checked={answers.accident === 'sometimes'} onChange={handleRadioChange} />
              <CardOption name="accident" value="often" label="มากกว่า 5 ครั้ง" type="radio" checked={answers.accident === 'often'} onChange={handleRadioChange} />
            </div>
          </div>


          <div className="text-center pt-6 border-t border-gray-200">
            <button type="submit"
              className="w-full sm:w-auto bg-blue-600 text-white px-12 py-4 rounded-full font-extrabold text-xl shadow-xl hover:bg-blue-700 transition duration-300 transform hover:scale-[1.05] tracking-wider uppercase focus:outline-none focus:ring-4 focus:ring-blue-300"
            >
              ส่งคำตอบและดูผลลัพธ์
            </button>
          </div>
        </form>
      </div>
    );
  }