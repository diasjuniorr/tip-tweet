import { User } from "@supabase/supabase-js";
import { NextPage } from "next";
import { MouseEventHandler, useEffect, useState } from "react";
import supabase from "../../lib/supabase";

const Tips: NextPage = () => {
  const [user, setUser] = useState<User | null>(null);

  const handleLogOut: MouseEventHandler = async (e) => {
    e.preventDefault();

    const { error } = await supabase.auth.signOut();

    if (error) {
      alert(JSON.stringify(error));
    }
  };

  useEffect(() => {
    const getProfile = async () => {
      const profile = supabase.auth.user();

      if (!profile) {
        return await supabase.auth.signIn({
          provider: "twitter",
          
        },{
            redirectTo: "/tips",
        });
      }
      setUser(profile);
    };

    getProfile();
  }, []);

  if (!user) {
    // Currently loading asynchronously User Supabase Information
    return null;
  }
  return (
    <>
      <h1>Tips</h1>
      <div>Tweet </div>
      <button onClick={handleLogOut}>log out</button>
    </>
  );
};

export default Tips;
