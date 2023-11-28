import supabaseServer from "@/supabaseServer";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPEN_AI_KEY,
});

export async function POST(req: Request) {
  const { data } = await supabaseServer().auth.getSession();

  if (!data.session) {
    return NextResponse.json({ message: "Unauthorize" }, { status: 403 });
  }

  // console.log('data',data)
  const request = await req.json();

  if (!request?.text) {
    return NextResponse.json(
      {
        message: "Invalid request missing key.",
      },
      { status: 422 }
    );
  }
  try {
    // console.log('enters',request)
    const result = await openai.embeddings.create({
      input: request.text,
      model: "text-embedding-ada-002",
    });
    // console.log('results',result)
    const embedding = result.data[0].embedding;
    const token = result.usage.total_tokens;
    // console.log('embeddings',embedding)
    return NextResponse.json({
      token,
      embedding,
    });
  } catch (err) {
    // console.log('generate embeddings',err)
    return NextResponse.json(
      {
        message: "Something went wrong" + err,
      },
      { status: 400 }
    );
  }
}
