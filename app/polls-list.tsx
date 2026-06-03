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
    // optimistic UI update
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
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Polls</h2>

      {polls.map((poll) => (
        <div key={poll.id} className="rounded-lg border p-4 space-y-2">
          <h3 className="font-medium">{poll.question}</h3>

          <div className="space-y-2">
            {poll.poll_options.map((opt) => (
              <button
                key={opt.id}
                onClick={() => vote(opt.id)}
                className="flex w-full justify-between rounded-md border px-3 py-2 hover:bg-gray-50"
              >
                <span>{opt.option_text}</span>
                <span>{opt.votes} votes</span>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}