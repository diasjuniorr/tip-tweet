import React, { useState } from "react";

import { useRouter } from "next/router";

import { User } from "@supabase/supabase-js";
import supabase from "../../lib/supabase";

const SignIn = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();

    const { user, error } = await supabase.auth.signIn({
      email,
      password,
    });

    if (error) {
      return alert(JSON.stringify(error));
    }

    const userAlreadyCreated = await getUser(user as User);

    if (!userAlreadyCreated) {
      const user_id = await createUser(user as User);
      console.log("user_id", user_id);

      return router.push("/");
    }

    router.push("/");
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gray-800">
      <div className="max-w-lg w-full">
        <h1 className="text-3xl font-semibold text-center text-white">
          Sign in to your account
        </h1>

        <div className="flex flex-col p-6">
          <form className="flex flex-col" onSubmit={handleSignIn}>
            <label htmlFor="email" className="text-gray-200">
              Email
            </label>
            <input
              className="py-2 px-4 rounded-md focus:outline-none focus:ring-2"
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <label htmlFor="password" className="mt-6 text-gray-200">
              Password
            </label>
            <input
              className="py-2 px-4 rounded-md focus:outline-none focus:ring-2"
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <button
              className="mt-10 text-lg text-white font-semibold btn-bg py-3 px-6 rounded-md focus:outline-none focus:ring-2"
              type="submit"
            >
              Sign in with Email
            </button>
            <div className="mt-3 text-white text-left">
              <a href="/signup">Need an account? Signup here</a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignIn;

const getUser = async (user: User) => {
  const { data: error } = await supabase
    .from("users")
    .select("id")
    .eq("id", user.id);

  if (error) return false;

  return true;
};

const createUser = async (user: User) => {
  const { data: user_id, error } = await supabase
    .from("users")
    .insert({
      id: user.id,
    })
    .single();

  if (error) return console.log("error", error);

  return user_id;
};
