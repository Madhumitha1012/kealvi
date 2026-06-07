"use client";

import { useState, useEffect } from "react";
import { getVoterId } from "@/lib/voter";

type Question = {
  id: string;
  body: string;
  author: string | null;
  votes: number;
};

export default function QuestionsList({
  initialQuestions,
  initialHasMore,
}: {
  initialQuestions: Question[];
  initialHasMore: boolean;
}) {
  const [questions, setQuestions] = useState(initialQuestions);
  const [draft, setDraft] = useState("");
  const [query, setQuery] = useState("");
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loading, setLoading] = useState(false);
  const [improving, setImproving] = useState(false);

  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    const id = setTimeout(async () => {
      const url = query
        ? `/api/questions?q=${encodeURIComponent(query)}`
        : `/api/questions`;

      const res = await fetch(url);
      const data = await res.json();

      setQuestions(data.questions);
      setHasMore(data.hasMore);
    }, 300);

    return () => clearTimeout(id);
  }, [query]);

  async function submit() {
    if (!draft.trim()) return;

    const res = await fetch("/api/questions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        body: draft,
      }),
    });

    const created = await res.json();

    setQuestions((qs) => [{ ...created, votes: 0 }, ...qs]);

    setDraft("");
  }

  async function improveQuestion() {
  if (!draft.trim()) return;

  setImproving(true);

  try {
    const res = await fetch("/api/improve", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: draft,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "AI request failed");
      return;
    }

    setDraft(data.improved);
  } catch (error) {
    console.error(error);
    alert("Failed to connect to AI");
  } finally {
    setImproving(false);
  }
}

  async function upvote(id: string) {
    setQuestions((qs) =>
      qs.map((q) =>
        q.id === id
          ? { ...q, votes: q.votes + 1 }
          : q
      )
    );

    const res = await fetch(`/api/questions/${id}/vote`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        voterId: getVoterId(),
      }),
    });

    if (!res.ok) {
      setQuestions((qs) =>
        qs.map((q) =>
          q.id === id
            ? { ...q, votes: q.votes - 1 }
            : q
        )
      );
    }
  }

  async function loadMore() {
    setLoading(true);

    const res = await fetch(
      `/api/questions?offset=${questions.length}`
    );

    const data = await res.json();

    setQuestions((qs) => [...qs, ...data.questions]);
    setHasMore(data.hasMore);

    setLoading(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-pink-300">
          {hydrated
            ? "Interactive ✓"
            : "Loading interactivity..."}
        </p>
      </div>

      {/* Ask Question */}
      <div className="rounded-2xl border border-pink-500/20 bg-[#16161d] p-5 shadow-lg">
        <div className="flex gap-3">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Ask a question..."
            className="flex-1 rounded-xl border border-pink-500/20 bg-black/30 px-4 py-3 text-white outline-none placeholder:text-gray-500"
          />

          <button
            type="button"
            onClick={improveQuestion}
            disabled={improving}
            className="rounded-xl border border-pink-500 px-4 py-3 text-pink-400 transition hover:bg-pink-500/10 disabled:opacity-50"
          >
            {improving ? "Improving..." : "✨ Improve"}
          </button>

          <button
            onClick={submit}
            className="rounded-xl bg-pink-500 px-6 py-3 font-semibold text-white transition hover:bg-pink-600"
          >
            Ask
          </button>
        </div>
      </div>

      {/* Search */}
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search questions..."
        className="w-full rounded-xl border border-pink-500/20 bg-[#16161d] px-4 py-3 text-white outline-none placeholder:text-gray-500"
      />

      {/* Questions */}
      <ul className="space-y-4">
        {questions.map((q) => (
          <li
            key={q.id}
            className="flex items-center gap-4 rounded-2xl border border-pink-500/20 bg-[#16161d] p-5 shadow-lg"
          >
            <button
              onClick={() => upvote(q.id)}
              className="flex min-w-[56px] flex-col items-center rounded-xl border border-pink-500/30 bg-pink-500/10 px-3 py-2 font-mono text-pink-400 transition hover:bg-pink-500/20"
            >
              <span>▲</span>
              <span>{q.votes}</span>
            </button>

            <div className="flex-1">
              <p className="text-lg text-white">
                {q.body}
              </p>

              {q.author && (
                <p className="mt-1 text-sm text-gray-400">
                  {q.author}
                </p>
              )}
            </div>
          </li>
        ))}
      </ul>

      {/* Load More */}
      {hasMore && (
        <button
          onClick={loadMore}
          disabled={loading}
          className="w-full rounded-xl border border-pink-500/30 bg-pink-500/10 px-4 py-3 text-pink-300 transition hover:bg-pink-500/20 disabled:opacity-50"
        >
          {loading ? "Loading..." : "Load More"}
        </button>
      )}
    </div>
  );
}