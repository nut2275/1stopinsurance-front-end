import { jwtDecode, JwtPayload } from "jwt-decode";

export interface CustomJwtPayload extends JwtPayload {
    role?: string;  
    id?: string;    
    username?: string; 
}

export interface CustomerToken extends JwtPayload {
    _id: string;          // Backend ส่ง _id มา
    first_name: string;
    last_name: string;
    email: string;
    address: string;
    birth_date: string;   // ข้อมูล Date ใน JWT จะกลายเป็น String
    phone: string;
    username: string;
    imgProfile_customer?: string; // อาจจะมีหรือไม่มี
    role: string;
}

export const ROLES = {
  ADMIN: 'admin',
  AGENT: 'agent',
  CUSTOMER: 'customer'
};

export const routesAgentsSession = () => {
    const token = localStorage.getItem("token");
    if (token) {
        const decodedToken = jwtDecode<CustomJwtPayload>(token);
        if (decodedToken.role === ROLES.AGENT) {
            return decodedToken;
        }
    }
    return null;
}

export const routesCustomersSession = () => {
    const token = localStorage.getItem("token");
    if (token) {
        const decodedToken = jwtDecode<CustomerToken>(token);
        if (decodedToken.role === ROLES.CUSTOMER) {
            return decodedToken;
        }
    }
    return null;
}