import Image from "next/image";
import LoginForm from "./customer/login/LoginForm";
import RegisterForm from "@/app/customer/register/RegisterForm"
import MainPage from "@/components/page/MainPage";

export default function Home() {
  return (
    <div >
      {/* <LoginForm /> */}
      {/* <RegisterForm /> */}
      <MainPage />
    </div>
  );
}
