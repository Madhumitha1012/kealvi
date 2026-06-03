import { supabase } from "@/lib/supabase";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: pollOptionId } = await params;

  const { data, error } = await supabase
    .from("poll_options")
    .select("votes")
    .eq("id", pollOptionId)
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  const { error: updateError } = await supabase
    .from("poll_options")
    .update({ votes: (data.votes ?? 0) + 1 })
    .eq("id", pollOptionId);

  if (updateError) {
    return Response.json(
      { error: updateError.message },
      { status: 500 }
    );
  }

  return Response.json({ ok: true });
}