"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

// 로그인된 상태로 홈에 오면 대시보드로 보낸다.
export default function RedirectToDashboard() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard");
  }, [router]);

  return null;
}
