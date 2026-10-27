import { Show } from "@clerk/nextjs";
import RedirectToDashboard from "@/components/RedirectToDashboard";
import SignInGate from "@/components/SignInGate";

export default function Home() {
  return (
    <>
      <Show when="signed-out">
        <SignInGate />
      </Show>
      <Show when="signed-in">
        <RedirectToDashboard />
      </Show>
    </>
  );
}
