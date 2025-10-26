"use client";
import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";

interface MyToken {
  id: string;
  username: string;
  iat: number;
  exp: number;
}

function ProfilePage() {
  const [decoded, setDecoded] = useState<MyToken | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decodedToken = jwtDecode<MyToken>(token);
        console.log("Decoded:", decodedToken);
        setDecoded(decodedToken);
      } catch (err) {
        console.error("Invalid token", err);
      }
    }
  }, []);

  return (
    <div>
      {decoded ? (
        <>
          <p>ID: {decoded.id}</p>
          <p>Username: {decoded.username}</p>
        </>
      ) : (
        <p>No token found</p>
      )}
    </div>
  );
}

export default ProfilePage;



