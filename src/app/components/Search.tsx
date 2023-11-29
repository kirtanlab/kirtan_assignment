"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";

import { useToast } from "@/components/ui/use-toast";
import { stripIndent, oneLine } from "common-tags";
import { Icons } from "./ui/icons";
import { ScrollArea } from "./ui/scroll-area";

import { getAllmessages } from "@/lib/utils";
import Newchat from "./NewChat";

export default function Search({ allchats }) {
  const router = useRouter();
  const inputRef = useRef() as React.MutableRefObject<HTMLInputElement>;
  const { toast } = useToast();
  const [questions, setQuestion] = useState<string[]>([]);
  const [answers, setAnswer] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [chatId, setChatId] = useState<string>("");
  const [showAlert, setShowAlert] = useState<boolean>(false);
  const [chatName, setChatName] = useState<string>(
    "It was a chat by you ok..."
  );

  const [ChatListItem, setChatListItem] = useState(null);
  const [new_allchats, setAllchats] = useState<Object[]>([]);

  useEffect(() => {
    // Dynamic import ChatListItem component
    console.log("newAllchats", allchats);
    setAllchats(allchats);
    import("./ChatListItem").then((module) => {
      setChatListItem(() => module.default);
    });
  }, []);
  const supabase = createClientComponentClient();
  const MAX_CHARACTERS = 23;
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.refresh();
  };

  const toastError = (message = "Something went wrong") => {
    toast({
      title: "Fail to create embedding",
      description: message,
    });
  };
  const toastSuccess = (message = "Task complete successfully") => {
    toast({
      title: "Task complete successfully",
      description: message,
    });
  };
  const clearInput = () => {
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };
  const handleSearch = async () => {
    setLoading(true);
    const searchText = inputRef.current.value;
    clearInput()
    if (searchText && searchText.trim()) {
      setQuestion((currentQuestion) => [...currentQuestion, searchText]);
      try {
        const res = await fetch(location.origin + "/embedding", {
          method: "POST",
          body: JSON.stringify({ text: searchText.replace(/\n/g, " ") }),
        });
        const data = await res.json();

        const { data: documents } = await supabase.rpc("match_documents", {
          query_embedding: data.embedding,
          match_threshold: 0.8,
          match_count: 10,
        });
        console.log(data);
        let tokenCount = 0;
        let contextText = "";
        for (let i = 0; i < documents.length; i++) {
          const document = documents[i];
          const content = document.content;
          tokenCount += document.token;

          if (tokenCount > 1500) {
            break;
          }
          contextText += `${content.trim()}\n--\n`;
        }
        if (contextText) {
          const prompt = generatePrompt(contextText, searchText);
          console.log("prompt: ", prompt);
          await generateAnswer(prompt, searchText);
        } else {
          setAnswer((currentAnswer) => [
            ...currentAnswer,
            "Sorry there is no context related to this question. Please ask something about something",
          ]);
        }
      } catch (err) {
        console.log("fetch embeddings", err);
        toastError();
      }
    }
    inputRef.current.value = "";
    setLoading(false);
  };
  const generateAnswer = async (prompt: string, searchText: string) => {
    try {
      const res = await fetch(location.origin + "/chat", {
        method: "POST",
        body: JSON.stringify({ prompt, searchText, chatId }),
      });

      const data = await res.json();

      setAnswer((currentAnswer) => [...currentAnswer, data.answer]);
      let trimmedContent = data.chatName;
      if (trimmedContent && trimmedContent > MAX_CHARACTERS) {
        trimmedContent = trimmedContent.slice(0, MAX_CHARACTERS).append("...");
      } else if (!trimmedContent) {
        trimmedContent = "It was a chat by you ok...";
      }

      if (data.chat) {
        //new chat
        console.log("data.chat", data.chat);
        if (!chatId) {
          setAllchats((prevchats) => [...prevchats, data.chat]);
        }
        setChatName(data.chatName);
        setChatId(data.chat.id);
      }
    } catch (err) {
      console.log("generate", err);
      toastError();
    }
  };

  const generatePrompt = (contextText: string, searchText: string) => {
    const prompt = stripIndent`${oneLine`
    You are a very enthusiastic DailyAI representative who loves
    to help people! Given the following sections from the DailyAI
    documentation, answer the question using only that information,
    outputted in markdown format.Also If you are unsure and the answer
    is not explicitly written in the documentation, say
    "Sorry, I don't know how to help with that."`}

    Context sections:
    ${contextText}

    Question: """
    ${searchText}
    """

    Answer as markdown (including related code snippets if available):
  `;
    return prompt;
  };
  const onSelect = async (chatid) => {
    // console.log("onSelect", chatid);
    clearInput();
    setChatId(chatid);
    if (!chatid) {
      setQuestion([]);
      setAnswer([]);
    } else {
      const res = await getAllmessages(chatid);
      const extractedQuestion = res.map((obj) => obj.question);
      const extractedAnswers = res.map((obj) => obj.response);
      setQuestion(extractedQuestion);
      setAnswer(extractedAnswers);
    }
  };
  async function deleteChat(chatId: string) {
    try {
      console.log("all chats before", new_allchats);
      
      console.log("all chats after", new_allchats);
      if (!chatId) {
        return null;
      }
      supabase
        .from("chat")
        .delete()
        .eq("id", chatId)
        .then((response) => {
          // Assuming response is an object with properties like [[PromiseState]] and [[PromiseResult]]
          const { data, error, status } = response;
          console.log("delete chat", status);
          setAllchats((prevChats) =>
            prevChats.filter((obj: any) => obj.id !== chatId)
          );
          setQuestion([])
          setAnswer([])
          setChatId("")
          return status;
        });
    } catch (e) {
      console.log(e);
      return e;
    }
  }
  return (
    <div className="root">
      <div className="flex flex-col sm:flex-row">
        <ScrollArea>
          <div className="flex flex-col h-screen sm:w-52 px-2 py-7 bg-black shadow border-r items-center">
            <div className="text-xl font-bold text-white">Dashboard</div>
            <Newchat active={!chatId} onSelect={onSelect} />
            {new_allchats &&
              new_allchats.map((obj: any) => (
                <React.Fragment key={obj.id}>
                  {ChatListItem ? (
                    <ChatListItem
                      chat={obj}
                      toastError={toastError}
                      onDelete={deleteChat}
                      toastSuccess={toastSuccess}
                      onSelect={onSelect}
                      chatId={chatId}
                    />
                  ) : (
                    <></>
                  )}
                </React.Fragment>
              ))}
          </div>
        </ScrollArea>
        <div className="flex flex-col flex-1 px-5 py-5 max-w-screen-xl ">
          <div className="sm:h-20 flex mt-3 justify-between  ">
            <div className="flex   gap-2">
              <Icons.apple className="w-7 h-7" />
              <h1 className="text-xl font-medium mt-1">Apple.ai</h1>
            </div>
            <Button
              onClick={handleLogout}
              className="justify-end w-fit h-7 mt-2"
            >
              Logout
            </Button>
          </div>
          {!chatId &&
            questions.length === 0 &&
            answers.length === 0 &&
            !loading && (
              <div className="flex-1 flex items-center justify-center text-2xl font-semibold text-gray-800">
                Welcome to the world of Apple! <br /> How can I help you today?
                ...
              </div>
            )}
          <ScrollArea>
            {questions.map((question, index) => {
              const answer = answers[index];
              ``;
              const isLoading = loading && !answer;

              return (
                <div className="space-y-3" key={index}>
                  <div className="flex items-center gap-2 text-indigo-500">
                    <Icons.user className="w-5 h-5" />
                    <h1 className="text-black font-bold">{question}</h1>
                  </div>
                  {isLoading ? (
                    <h1>Loading...</h1>
                  ) : (
                    <p className="text-black">{answer}</p>
                  )}
                </div>
              );
            })}
          </ScrollArea>

          <Input
            ref={inputRef}
            placeholder="Ask questions related to Apple products ..."
            className="p-5 mt-auto"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSearch();
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}
