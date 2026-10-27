"use client";

import { SignInButton, useClerk } from "@clerk/nextjs";
import { useEffect } from "react";

// 미로그인 상태로 접속하면 로그인 모달을 자동으로 연다.
export default function SignInGate() {
  const { openSignIn, loaded } = useClerk();

  useEffect(() => {
    if (loaded) openSignIn({ forceRedirectUrl: "/dashboard" });
  }, [loaded, openSignIn]);

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="text-2xl font-semibold">AI 뉴스 수집기</h1>
      <p className="text-zinc-600 dark:text-zinc-400">
        계속하려면 로그인해 주세요.
      </p>
      <SignInButton mode="modal" forceRedirectUrl="/dashboard">
        <button className="rounded-full bg-foreground px-5 py-2 text-background">
          로그인
        </button>
      </SignInButton>
    </div>
  );
}
