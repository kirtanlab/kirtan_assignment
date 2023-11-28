import { createNewChat, insertMessage } from "@/lib/utils";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import axios from 'axios'
import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPEN_AI_KEY,
});

async function getSummary(text: string) { 
  const options = {
    method: "POST",
    url : "https://api.edenai.run/v2/text/summarize",
    headers: {
      "authorization": `Bearer ${process.env.SUMMARIZE_KEY}`
    },
    data: {
      "output_sentences": 1,
      "providers": "connexun",
      "text": text,
      "language": "en"
    }
  }

 let res = {}
  try {  res = await axios.request(options) } catch (err) { console.log('err',err)}
  console.log('summary',res)
  return res?.data?.connexun?.result;
}

export async function POST(req: Request) {
  const supabase = createServerComponentClient({ cookies });

  const { data } = await supabase.auth.getSession();
 
  if (!data.session) {
    return NextResponse.json({ message: "Unauthorize" }, { status: 403 });
  }

   const {
    data: { user },
  } = await supabase.auth.getUser();
  console.log("user", user);
  if (!user) { 
    console.log("can't find user")
  }
  var { prompt, searchText, chatId } = await req.json();
  
  try {
    const res = await openai.completions.create({
      prompt,
      model: "text-davinci-003",
      max_tokens: 512,
      temperature: 0,
    });
    let ChatName = "Chat";
    let chatData = []
    // await createNewChat()
    console.log('openai',res)
    if (chatId === "") {
      if (res.choices[0].text != "\n\nSorry, I don't know how to help with that.") { 
        const summary  = await getSummary(res.choices[0].text)
      console.log("New Chat", summary)
      const ChatName = summary.slice(0, 20) + (summary.length > 20 ? "..." : "");
      chatData = await createNewChat(ChatName, user?.id)
        chatId = chatData[0].id
        await insertMessage(searchText, res.choices[0].text, chatId) 
        console.log('ChatData',chatData[0])
      }
   
    } 
    
    // 
    return NextResponse.json({ answer: res.choices[0].text,chatName: ChatName,chat: chatData[0] });
  } catch {
    return NextResponse.json(
      { message: "Something went wrong!" },
      { status: 400 }
    );
  }
}
