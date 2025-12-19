import { JobTitlesManager } from "@/components/JobTitlesManager";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <main className="flex-1 p-8">
        <JobTitlesManager />
      </main>
    </div>
  );
}
