import React from 'react'
import Link from "next/link";
import Image from "next/image";

function MenuLogin() {
  return (
    <header className="flex items-center px-8 py-4 bg-white shadow" style={{zIndex:9999}}>
        <Link href="/" className="flex items-center space-x-2 text-blue-900 font-bold text-xl no-underline">
        
        <Image src="/fotos/Logo.png" alt="logo" width={40} height={40} />
        <span>1StopInsurance</span>
        </Link>
    </header>
  )
}

export default MenuLogin
