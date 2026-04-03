import { AppShell } from "@/components/AppShell";
import { GameRunner } from "@/components/GameRunner";

export default function GamePage() {
  return (
    <AppShell>
      <GameRunner mode="arcade" />
    </AppShell>
  );
}
