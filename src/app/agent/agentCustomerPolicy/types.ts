export type PurchaseStatus = 'active' | 'pending' | 'pending_payment' | 'about_to_expire' | 'expired' | 'rejected';
export type PaymentMethod = 'full' | 'installment';

// ✅ เพิ่ม Tab ให้ครบตาม Legend
export type FilterTab = 'all' | 'pending' | 'pending_payment' | 'active' | 'about_to_expire' | 'rejected';

export interface Customer {
  _id: string;
  first_name: string;
  last_name: string;
  username: string;
  imgProfile_customer?: string;
}

export interface Car {
  _id: string;
  brand: string;
  carModel: string;
  subModel: string;
  year: number | string;
  color: string;
  registration: string;
  province: string;
}

export interface CarInsurance {
  _id: string;
  insuranceBrand: string;
  level: string;
}

export interface Purchase {
  _id: string;
  customer_id: Customer;
  agent_id?: string | null;
  carInsurance_id: CarInsurance;
  car_id: Car;
  
  purchase_date: string;
  start_date: string;
  end_date?: string;
  
  policy_number?: string;
  status: PurchaseStatus;
  reject_reason?: string;
  
  citizenCardImage?: string;
  carRegistrationImage?: string;
  paymentSlipImage?: string;
  policyFile?: string;
  installmentDocImage?: string;
  consentFormImage?: string;
  
  paymentMethod: PaymentMethod;
  
  createdAt: string;
  updatedAt: string;
}