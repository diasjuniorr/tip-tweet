import { User } from "@supabase/supabase-js";
import { NextPage } from "next";
import { MouseEventHandler, useEffect, useState } from "react";
import supabase from "../../lib/supabase";

const Tips: NextPage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [tips, setTips] = useState<Tip[]>([]);

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
            redirectTo: "https://tip-tweet.vercel.app/tips",
        });
      }
      setUser(profile);
    };

    getProfile();
  }, []);

  useEffect(() => {
    const getTips = async () => {
      try {
        let { data: tips, error } = await supabase.from("tips").select("*");
        if (error) {
          console.log("getTips failed: ", error);
          throw new Error("getTips failed");
        }


        return setTips(tips as Tip[]);
      } catch (e) {
        console.log("getTips failed: ", e);
        throw new Error("getTips failed");
      }
    };

    getTips();
  }, [user]);

  if (!user) {
    // Currently loading asynchronously User Supabase Information
    return null;
  }
  return (
    <>
      <h1>Tips</h1>
      <div>
          {tips.map((tip) => (
            <div key={tip.id}>
                <p>{tip.tweet_id}</p>
                <button>Claim Tip</button>
            </div>
          ))}
      </div>
      <button onClick={handleLogOut}>log out</button>
    </>
  );
};

export default Tips;

const getTips = async () => {
  try {
    let { data: tips, error } = await supabase.from("tips").select("*");
    if (error) {
      console.log("getTips failed: ", error);
      throw new Error("getTips failed");
    }

    return tips;
  } catch (e) {
    console.log("getTips failed: ", e);
    throw new Error("getTips failed");
  }
};

interface Tip {
  id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  deleted_at: string;
  contract_id: string;
  tweet_id: string;
  nonce: string;
  amount: string;
  tweet_owner_id: string;
  signature: string;
}