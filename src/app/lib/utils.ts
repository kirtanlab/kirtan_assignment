import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { UserIdentity } from "@supabase/supabase-js";
import { type ClassValue, clsx } from "clsx";
import { UUID } from "crypto";
import { twMerge } from "tailwind-merge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { error } from "console";
const supabase = createClientComponentClient();
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

async function createNewChat(chat_name: string, userId: string | undefined) {
  try {
    if (!userId) {
      return null;
    }
    const { data, error, status } = await supabase
      .from("chat")
      .insert([{ user_id: userId, chat_name }])
      .select();
    if (error) {
      return status;
    }
    console.log("Inserted");
    return data;
  } catch (e) {
    console.log(e);
    return e;
  }
}

async function getAllChats(user_id: string) {
  try {
    if (!user_id) {
      return null;
    }
    const { data, error, status } = await supabase
      .from("chat")
      .select("*")
      .eq("user_id", user_id);
    if (error) {
      console.log("error retrieving all chats", error);
      return status;
    }
    console.log("all chats", data);
    return data;
  } catch (e) {
    console.log(e);
    return e;
  }
}



// user_id: UUID
const getAllmessages = async (chatId) => {
  try {
    const { data, error } = await supabase
      .from("message")
      .select("*")
      .eq("chat_id", chatId);

    console.log('read message data', data, error);

    if (error) {
      console.log("error", error);
      return [];
    }

    return data;
  } catch (error) {
    console.error("Error fetching messages", error);
    return [];
  }
};


// user_id: UUID
async function insertMessage(
  question: string,
  response: string,
  chatId: bigint
) {
  try {
    if (!chatId) {
      console.log("Not chatID");
      return null;
    }
    const { data, error, status } = await supabase
      .from("message")
      .insert([{ chat_id: chatId, question, response }]);
    if (error) {
      console.log("insert MEssage", error);
      return status;
    }
    console.log("Inserted MEssage", data);
    return data;
  } catch (e) {
    console.log("insert MEssage", e);
    console.log(e);
    return e;
  }
}

export {
  cn,
  insertMessage,
  createNewChat,
  getAllChats,

  getAllmessages,
};
