import { Show, UserButton } from "@clerk/nextjs";
import SignInGate from "@/components/SignInGate";

export default function Home() {
  return (
    <>
      <Show when="signed-out">
        <SignInGate />
      </Show>
      <Show when="signed-in">
        <header className="flex items-center justify-between border-b px-6 py-3">
          <h1 className="text-lg font-semibold">AI 뉴스 수집기</h1>
          <UserButton />
        </header>
        <main className="flex-1 p-6">뉴스 카드는 이후 단계에서 추가됩니다.</main>
      </Show>
    </>
  );
}
