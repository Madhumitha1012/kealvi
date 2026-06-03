import QuestionsList from "./questions-list";
import PollsList from "./polls-list";
import { getQuestionsPage } from "@/lib/questions";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 10;

export default async function Page() {
  const { questions, hasMore } = await getQuestionsPage(0, PAGE_SIZE);

  return (
    <main className="mx-auto max-w-2xl p-6 space-y-8">
      <h1 className="text-2xl font-medium">Live Q&A</h1>

      {/* 🔥 ADD POLLS HERE (THIS WAS MISSING) */}
      <PollsList />

      <QuestionsList
        initialQuestions={questions}
        initialHasMore={hasMore}
      />
    </main>
  );
}