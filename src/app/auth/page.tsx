import React from "react";
import AuthComponent from "./components/AuthComponent";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import supabaseServer from "@/supabaseServer";

export default async function page() {
  const { data } = await supabaseServer().auth.getSession();

  if (data.session) {
    return redirect("/");
  }

  return <AuthComponent />;
}
