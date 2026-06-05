"use client";

import { useEffect, useState } from "react";

type PollOption = {
  id: string;
  option_text: string;
  votes: number;
};

type Poll = {
  id: string;
  question: string;
  poll_options: PollOption[];
};

export default function PollsList() {
  const [polls, setPolls] = useState<Poll[]>([]);

  useEffect(() => {
    fetch("/api/polls")
      .then((res) => res.json())
      .then((data) => setPolls(data.polls));
  }, []);

  async function vote(optionId: string) {
    setPolls((prev) =>
      prev.map((poll) => ({
        ...poll,
        poll_options: poll.poll_options.map((opt) =>
          opt.id === optionId
            ? { ...opt, votes: opt.votes + 1 }
            : opt
        ),
      }))
    );

    await fetch(`/api/polls/${optionId}/vote`, {
      method: "POST",
    });
  }

  return (
    <div className="mb-8 space-y-6">
      <h2 className="text-2xl font-bold text-pink-400">
        Polls
      </h2>

      {polls.map((poll) => (
        <div
          key={poll.id}
          className="rounded-2xl border border-pink-500/20 bg-[#16161d] p-5 shadow-lg"
        >
          <h3 className="mb-4 text-lg font-semibold text-white">
            {poll.question}
          </h3>

          <div className="space-y-3">
            {poll.poll_options.map((opt) => (
              <button
                key={opt.id}
                onClick={() => vote(opt.id)}
                className="flex w-full items-center justify-between rounded-xl border border-pink-500/20 bg-black/30 px-4 py-3 text-left text-white transition hover:border-pink-400 hover:bg-pink-500/10"
              >
                <span>{opt.option_text}</span>

                <span className="rounded-lg bg-pink-500/20 px-3 py-1 text-sm text-pink-300">
                  {opt.votes} votes
                </span>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}