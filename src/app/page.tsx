import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import React from "react";
import Search from "@/components/Search";
import { createNewChat, getAllChats } from "./lib/utils";

export default async function Page() {
  const supabase = createServerComponentClient({ cookies });

  const { data } = await supabase.auth.getSession();

  if (!data.session) {
    return redirect("/auth");
  }

  const allChats = await getAllChats(data.session.user.id);

  return (
    <div className="h-screen w-screen flex items-center">
      <Search allchats={allChats} />
    </div>
  );
}
