// Customer db
export type Customer = {
  first_name:string;
  last_name:string;
  email: string;
  address: string;
  birth_date: Date;
  phone: string;
  username: string;
  password: string;
  imgProfile_customer: string;
};


// agent manage customer
export type PolicyStatus = 'คุ้มครอง' | 'หมดอายุ' | 'กำลังดำเนินการ';

export interface CustomerPolicy {
  id: number;
  name: string;
  type: string;
  company: string;
  policy: string;
  status: PolicyStatus;
}