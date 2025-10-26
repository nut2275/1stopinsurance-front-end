import Link from 'next/link';
import CustomerTable from '@/app/agent/agent_manage_customer/CustomerTable'; // ต้องสร้างไฟล์นี้ใน components
import { customerPolicies } from '@/app/agent/agent_manage_customer/mockData'; // ต้องสร้างไฟล์นี้
import MenuAgent from '@/components/element/MenuAgent';


export default function ManageCustomerPage() {
  return (
    <>
      <MenuAgent activePage="/agent/agent_manage_customer" />
      
      <main className="flex-grow max-w-6xl mx-auto w-full bg-white shadow rounded-xl my-10 p-4 md:p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-blue-900">จัดการลูกค้า</h1>
          <Link
            href="/agent/agent_manage_customer/Insarance_insert"
            className="bg-blue-700 text-white px-5 py-2 rounded-full hover:bg-blue-800 transition shadow-md"
          >
            + เพิ่มลูกค้าใหม่
          </Link>
        </div>

        {/* Customer Table Component (จัดการ Search/Filter ใน Component นี้) */}
        <CustomerTable initialData={customerPolicies} />
        
        </main>
    </>
  );
}