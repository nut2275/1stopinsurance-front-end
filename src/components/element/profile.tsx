// "use client";
// import { useEffect, useState } from "react";
// import { jwtDecode } from "jwt-decode";

// interface MyToken {
//   id: string;
//   username: string;
//   iat: number;
//   exp: number;
// }

// function ProfilePage() {
//   const [decoded, setDecoded] = useState<MyToken | null>(null);

//   useEffect(() => {
//     const token = localStorage.getItem("token");
//     if (token) {
//       try {
//         const decodedToken = jwtDecode<MyToken>(token);
//         console.log("Decoded:", decodedToken);
//         setDecoded(decodedToken);
//       } catch (err) {
//         console.error("Invalid token", err);
//       }
//     }
//   }, []);

//   return (
//     <div>
//       {decoded ? (
//         <>
//           <p>ID: {decoded.id}</p>
//           <p>Username: {decoded.username}</p>
//         </>
//       ) : (
//         <p>No token found</p>
//       )}
//     </div>
//   );
// }

// export default ProfilePage;



// "use client";
// import { useEffect, useState } from "react";
// import { jwtDecode } from "jwt-decode";
// import { motion } from "framer-motion"; // 1. นำเข้า Framer Motion

// // Interface เดิม
// interface MyToken {
//   id: string;
//   username: string;
//   iat: number;
//   exp: number;
// }

// // ------------------- Animation Variants -------------------

// // สำหรับคอนเทนเนอร์หลัก (การปรากฏตัวของหน้า)
// const containerVariants = {
//   hidden: { opacity: 0, scale: 0.95 },
//   visible: {
//     opacity: 1,
//     scale: 1,
//     transition: {
//       duration: 0.5,
//       when: "beforeChildren", // ให้คอนเทนเนอร์ปรากฏก่อน
//       staggerChildren: 0.2, // หน่วงเวลาการปรากฏตัวของ Children
//     },
//   },
// };

// // สำหรับแต่ละข้อมูล (ID, Username) และข้อความสถานะ
// const itemVariants = {
//   hidden: { opacity: 0, y: 20 },
//   visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
// };

// // ------------------- Component -------------------

// function ProfilePage() {
//   const [decoded, setDecoded] = useState<MyToken | null>(null);

//   useEffect(() => {
//     const token = localStorage.getItem("token");
//     if (token) {
//       try {
//         const decodedToken = jwtDecode<MyToken>(token);
//         console.log("Decoded:", decodedToken);
//         setDecoded(decodedToken);
//       } catch (err) {
//         console.error("Invalid token", err);
//         // อาจจะเพิ่ม logic ล้าง token ที่ไม่ถูกต้องออกจาก localStorage
//       }
//     }
//   }, []);

//   return (
//     // 2. ใช้ motion.div สำหรับคอนเทนเนอร์หลัก
//     <motion.div
//       className="min-h-screen flex items-center justify-center bg-gray-900 p-4"
//       variants={containerVariants}
//       initial="hidden"
//       animate="visible"
//     >
//       <div className="w-full max-w-md bg-gray-800 rounded-xl shadow-2xl p-8 transform hover:scale-[1.01] transition duration-300 ease-in-out border border-indigo-500/50">
//         <motion.h1 
//           className="text-4xl font-extrabold text-white mb-6 text-center tracking-wider"
//           initial={{ y: -50, opacity: 0 }}
//           animate={{ y: 0, opacity: 1 }}
//           transition={{ duration: 0.5 }}
//         >
//           👤 User Profile
//         </motion.h1>

//         <hr className="border-indigo-500 mb-6" />

//         {decoded ? (
//           <>
//             {/* 3. ส่วนของ Avatar & Username Header */}
//             <motion.div 
//                 className="flex flex-col items-center mb-8"
//                 initial={{ opacity: 0, scale: 0.8 }}
//                 animate={{ opacity: 1, scale: 1 }}
//                 transition={{ delay: 0.3, duration: 0.5 }}
//             >
//               {/* Avatar Animation - หมุนและมีแสงเงา */}
//               <motion.div
//                 className="relative w-24 h-24 mb-4 rounded-full bg-indigo-600 flex items-center justify-center p-1"
//                 whileHover={{ rotate: 360, scale: 1.1 }}
//                 transition={{ duration: 0.7 }}
//               >
//                 <span className="text-3xl font-bold text-white uppercase">{decoded.username[0]}</span>
//                 <motion.div // เอฟเฟกต์แสงสว่างรอบๆ
//                     className="absolute inset-0 rounded-full border-4 border-indigo-500/50"
//                     animate={{ rotate: 360 }}
//                     transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
//                 ></motion.div>
//               </motion.div>
//               <motion.h2 
//                 className="text-2xl font-semibold text-indigo-400"
//                 variants={itemVariants}
//               >
//                 @{decoded.username}
//               </motion.h2>
//             </motion.div>

//             {/* 4. ส่วนแสดงข้อมูล ID */}
//             <motion.div 
//               className="bg-gray-700 p-4 rounded-lg mb-4 hover:bg-gray-600 transition duration-300 shadow-md"
//               variants={itemVariants}
//               whileHover={{ x: 5 }} // ขยับเล็กน้อยเมื่อวางเมาส์
//             >
//               <p className="text-sm font-light text-gray-400">Unique ID</p>
//               <p className="text-lg font-mono text-pink-300 break-words">{decoded.id}</p>
//             </motion.div>

//             {/* 5. ส่วนแสดงเวลา */}
//             <motion.div 
//               className="grid grid-cols-2 gap-4"
//               variants={itemVariants}
//             >
//               <motion.div 
//                 className="bg-gray-700 p-4 rounded-lg hover:bg-gray-600 transition duration-300 shadow-md"
//                 whileHover={{ scale: 1.05 }}
//               >
//                 <p className="text-sm font-light text-gray-400">Created At (IAT)</p>
//                 <p className="text-md text-yellow-300">{new Date(decoded.iat * 1000).toLocaleString()}</p>
//               </motion.div>
//               <motion.div 
//                 className="bg-gray-700 p-4 rounded-lg hover:bg-gray-600 transition duration-300 shadow-md"
//                 whileHover={{ scale: 1.05 }}
//               >
//                 <p className="text-sm font-light text-gray-400">Expires At (EXP)</p>
//                 <p className="text-md font-bold text-red-400">{new Date(decoded.exp * 1000).toLocaleString()}</p>
//               </motion.div>
//             </motion.div>
//           </>
//         ) : (
//           // 6. Animation สำหรับสถานะ No Token
//           <motion.div
//             className="text-center p-10 border-4 border-dashed border-red-500/50 rounded-lg bg-red-900/20"
//             initial={{ rotate: -5, opacity: 0 }}
//             animate={{ rotate: 0, opacity: 1 }}
//             transition={{ type: "spring", stiffness: 100 }}
//           >
//             <motion.p 
//                 className="text-xl font-bold text-red-400"
//                 variants={itemVariants}
//             >
//                 ⚠️ No token found. Please Login.
//             </motion.p>
//           </motion.div>
//         )}

//         <hr className="border-gray-700 mt-6" />

//         {/* 7. Footer Animation */}
//         <motion.p 
//             className="text-center text-xs text-gray-500 mt-4"
//             initial={{ y: 10, opacity: 0 }}
//             animate={{ y: 0, opacity: 1 }}
//             transition={{ delay: 1, duration: 0.5 }}
//         >
//             Token Data Secured by JWT
//         </motion.p>
//       </div>
//     </motion.div>
//   );
// }

// export default ProfilePage;