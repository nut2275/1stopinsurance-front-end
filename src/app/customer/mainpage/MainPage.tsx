import React from 'react'; // Import React for JSX
import Link from 'next/link';
import Image from 'next/image';
 


export default function MainPage() {
  
  return (
    <div className="flex flex-col min-h-screen font-sans text-gray-800 bg-gray-50">

      {/* Main content */}
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-blue-100 to-blue-200 py-12">
          <div className="max-w-6xl mx-auto bg-white/50 backdrop-blur-sm rounded-2xl p-8 flex flex-col md:flex-row items-center gap-10 shadow-lg border border-white/30">
            <div className="relative w-full md:w-96 h-60 md:h-auto md:aspect-square rounded-lg shadow-md overflow-hidden">
               <Image
                 src="/fotos/Home1.png"
                 alt="รถยนต์ที่ได้รับการคุ้มครอง"
                 className="w-full h-full object-cover"
                 width={384}
                 height={384}
               />
            </div>

            <div className="text-blue-900 text-center md:text-left">
              <h1 className="text-3xl md:text-4xl font-bold">
                1StopInsurance <span className="text-blue-700">ดูแลคุณทุกช่วงเวลา</span>
              </h1>
              <p className="mt-2 text-gray-600 text-lg">พร้อมบริการประกันครบวงจร</p>

              <div className="mt-6 bg-white/60 p-4 rounded-lg">
                <h2 className="text-xl md:text-2xl font-semibold">
                  ประกันรถยนต์ เริ่มต้น <span className="text-blue-800 font-bold">7,xxx</span>
                </h2>
                <p className="text-xl"><span className="text-blue-800 font-bold">ผ่อน 0%</span> นาน 10 เดือน</p>
              </div>

              <Link href="car-insurance/car-Insurance-form"
                 className="inline-block mt-8 bg-blue-600 text-white px-8 py-3 rounded-full font-bold hover:bg-blue-700 transition shadow-md hover:shadow-lg transform hover:-translate-y-1">
                 เช็คเบี้ยประกันรถยนต์ →
              </Link>
            </div>
          </div>


        </section>

        {/* Partners Section */}
        <section className="text-center py-16 px-6 bg-white">
          <h2 className="text-3xl font-bold text-gray-900">พันธมิตรของเรา</h2>
          <p className="mt-2 text-gray-500 max-w-2xl mx-auto">
            1StopInsurance มีแผนประกันรถยนต์ให้คุณเลือกเปรียบเทียบจากบริษัทชั้นนำ
          </p>
          <div className="flex flex-wrap justify-center items-center gap-x-8 gap-y-6 mt-10">
            <Image  src="/fotos/Insur1.png" alt="Partner 1" width={60} height={60} />
            <Image  src="/fotos/Insur2.png" alt="Partner 2" width={60} height={60} />
            <Image  src="/fotos/Insur3.png" alt="Partner 3" width={60} height={60} />
            <Image  src="/fotos/Insur4.png" alt="Partner 4" width={60} height={60} />
            <Image  src="/fotos/Insur5.png" alt="Partner 5" width={60} height={60} />
            <Image  src="/fotos/Insur6.png" alt="Partner 6" width={60} height={60} />
          </div>
        </section>
      </main>

    </div>
  );
}


