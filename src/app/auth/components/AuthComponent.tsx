"use client";
import React from "react";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Icons } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { AuthError } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

export const metadata: Metadata = {
  title: "Authentication",
  description: "Authentication forms built using the components.",
};

interface UserAuthFormProps extends React.HTMLAttributes<HTMLDivElement> {}

export default function AuthComponent() {
  const [login, setLogIn] = React.useState<boolean>(true); //login screen at start
  const [username, setUsername] = React.useState<string>("");
  const [email, setEmail] = React.useState<string>("");
  const [password, setPassword] = React.useState<string>("");
  const [confirmPass, setConfirmPass] = React.useState<string>("");
  const [err, setError] = React.useState<AuthError>();
  const [hide, setHide] = React.useState<boolean>(true); //hidden password
  const router = useRouter();
  const togglePasswordVisibility = () => {
    setHide((hide) => !hide);
  };
  const UserAuthForm = ({ className, ...props }: UserAuthFormProps) => {
    const [isLoading, setIsLoading] = React.useState<boolean>(false);
    const supabase = createClientComponentClient();

    const handleLoginWithGoogle = () => {
      supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: location.origin + "/auth/callback",
        },
      });
    };

    async function onSubmit(event: React.SyntheticEvent) {
      event.preventDefault();
      setIsLoading(true);
      try {
        if (email && password) {
          if (login) {
            const { data, error } = await supabase.auth.signInWithPassword({
              email: email,
              password: password,
            });
            if (error) {
              setError(error);
            } else {
              console.log(data);
              router.replace("/");
            }
          } else {
            console.log("1st");
            if (password !== confirmPass || !username) {
              setError(new AuthError("Fill all details correctly!"));
            } else {
              console.log("2d");
              const { data, error } = await supabase.auth.signUp({
                email: email,
                password: password,
                options: {
                  data: {
                    userName: username,
                  },
                },
              });
              if (error) {
                setError(error);
              } else {
                console.log(data.session);
                router.replace("/");
              }
            }
          }
        } else {
          setError(new AuthError("Please enter your details"));
        }
      } catch (err) {
        setIsLoading(false);
        console.log(err);
      }
      setTimeout(() => {
        setIsLoading(false);
      }, 3000);
    }

    return (
      <div
        className={cn(
          "grid gap-6",

          className
        )}
        {...props}
      >
        <div className="grid gap-2">
          <div className="grid gap-1">
            <Input
              defaultValue={email}
              onBlur={(e) => {
                e.preventDefault();
                setEmail(e.target.value);
              }}
              placeholder="email"
              type="email"
              autoComplete="email"
              disabled={isLoading}
            />
          </div>
          {!login && (
            <div className="grid gap-1">
              <Input
                defaultValue={username}
                onBlur={(e) => {
                  e.preventDefault();
                  setUsername(e.target.value);
                }}
                placeholder="username"
                type="text"
                autoComplete="off"
                disabled={isLoading}
              />
            </div>
          )}
          <div className="flex items-center">
            <Input
              defaultValue={password}
              onBlur={(e) => {
                e.preventDefault();
                setPassword(e.target.value);
              }}
              placeholder="password"
              type={hide ? "password" : "text"}
              autoCapitalize="none"
              autoComplete="new-password"
              disabled={isLoading}
              className="justify-start"
            />
            <Button
              onClick={(e) => {
                e.preventDefault();
                togglePasswordVisibility();
              }}
              className="ml-2 outline-2 bg-slate-50 text-black hover:bg-slate-50"
            >
              <Icons.eyelashes className="h-2 w-2 " />
            </Button>
          </div>

          {!login && (
            <div className="grid gap-1">
              {/* <Label className="sr-only" htmlFor="Password">
                Confirm Password
              </Label> */}
              <Input
                defaultValue={confirmPass}
                onBlur={(e) => {
                  e.preventDefault();
                  setConfirmPass(e.target.value);
                }}
                placeholder="confirm password"
                type="text"
                autoCapitalize="none"
                autoCorrect="off"
                autoComplete="new-password"
                disabled={isLoading}
              />
            </div>
          )}
          {err && (
            <div className="text-sm text-red-700">
              <p>{err.message}</p>
            </div>
          )}
          <Button disabled={isLoading} onClick={onSubmit}>
            {isLoading && (
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
            )}
            {login ? "Sign In" : "Create an account"}
          </Button>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>
        <Button
          variant="outline"
          type="button"
          disabled={isLoading}
          onClick={handleLoginWithGoogle}
        >
          {isLoading ? (
            <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Icons.google className="mr-2 h-4 w-4" />
          )}{" "}
          Google
        </Button>

        <div className="text-sm flex justify-center">
          {login ? (
            <>
              First Time?{"  "}
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setEmail("");
                  setPassword("");
                  setLogIn(false);
                  setError(undefined);
                }}
                className="underline underline-offset-4 ml-1"
              >
                Create an account
              </a>
            </>
          ) : (
            <>
              Already User?{"  "}
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setLogIn(true);
                  setEmail("");
                  setPassword("");
                  setError(undefined);
                }}
                className="underline underline-offset-4 ml-1"
              >
                Log in
              </a>
            </>
          )}
        </div>
      </div>
    );
  };
  return (
    <>
      <div className="md:hidden ">
        <Image
          src="/banana.png"
          width={1280}
          height={843}
          alt="Authentication"
          className="block dark:hidden"
        />
        <Image
          src="/banana.png"
          width={1280}
          height={843}
          alt="Authentication"
          className="hidden dark:block"
        />
      </div>
      <div className="container relative hidden h-[800px] flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-1 lg:px-0 ">
        <div className="lg:p-8 border-2 border-black rounded-lg shadow-md max-w-screen-md mx-auto">
          <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
            <div className="flex flex-col space-y-2 text-center">
              <h1 className="text-2xl font-semibold tracking-tight">
                {login ? "Log In" : "Sign up"}
              </h1>
              <p className="text-sm text-muted-foreground">
                {login
                  ? "Enter your email and password below to log in !"
                  : "Enter your details below to Sign up!"}
              </p>
            </div>
            <UserAuthForm />
            <p className="px-8 text-center text-sm text-muted-foreground">
              By clicking continue, you agree to our{" "}
              <Link
                href="/terms"
                className="underline underline-offset-4 hover:text-primary"
              >
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link
                href="/privacy"
                className="underline underline-offset-4 hover:text-primary"
              >
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
