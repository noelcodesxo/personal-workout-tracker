import { AppShell } from "@/components/layout/AppShell";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

export default function HomePage() {
  return (
    <AppShell appName>
      <EmptyState
        title="No workouts yet"
        description="Start tracking your training. Every session counts."
        action={
          <Link href="/workouts/new">
            <Button variant="primary" fullWidth>
              Start a Workout
            </Button>
          </Link>
        }
      />
    </AppShell>
  );
}
