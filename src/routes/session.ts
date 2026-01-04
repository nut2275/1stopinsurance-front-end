import { jwtDecode, JwtPayload } from "jwt-decode";

interface CustomJwtPayload extends JwtPayload {
    role?: string;  
    id?: string;    
    username?: string; 
}

const ROLES = {
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
        const decodedToken = jwtDecode<CustomJwtPayload>(token);
        if (decodedToken.role === ROLES.CUSTOMER) {
            return decodedToken;
        }
    }
    return null;
}