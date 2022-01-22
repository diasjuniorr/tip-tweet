import { User } from "@supabase/supabase-js";
import { ethers } from "ethers";
import { NextPage } from "next";
import { MouseEventHandler, useEffect, useState } from "react";
import supabase from "../../lib/supabase";
import abi from "../../contracts/abi/TipTweet.json";
import { useRouter } from "next/router";
import TipComponent from "../../components/Tip";

declare let window: any;

const CONTRACT_ABI = abi.abi;
// const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS || "";
const CONTRACT_ADDRESS = "0x65c9dc7066be9caad1cb102c114aa2401c7a3b03";

const Tips: NextPage = () => {
  const [currentAccount, setCurrentAccount] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [tips, setTips] = useState<Tip[]>([]);

  const router = useRouter();

  const handleLogOut: MouseEventHandler = async (e) => {
    e.preventDefault();

    const { error } = await supabase.auth.signOut();

    if (error) {
      alert(JSON.stringify(error));
    }

    return router.push("/");
  };

  useEffect(() => {
    const getProfile = async () => {
      const profile = supabase.auth.user();

      if (!profile) {
        return await supabase.auth.signIn(
          {
            provider: "twitter",
          },
          {
            redirectTo: "https://tip-tweet.vercel.app/tips",
          }
        );
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

        return setTips(tips?.filter((tip) => !tip.claimed) as Tip[]);
      } catch (e) {
        console.log("getTips failed: ", e);
        throw new Error("getTips failed");
      }
    };

    getTips();
  }, [user]);

  const checkIfWalletIsConnected = async () => {
    const { ethereum } = window;

    if (!ethereum) {
      console.log("Make sure you have metamask!");
      return;
    } else {
      console.log("We have the ethereum object", ethereum);
    }

    const accounts = await ethereum.request({ method: "eth_accounts" });

    if (accounts.length !== 0) {
      const account = accounts[0];
      console.log("Found an authorized account:", account);
      setCurrentAccount(account);
    } else {
      console.log("No authorized account found");
    }
  };

  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);

  if (!user) {
    // Currently loading asynchronously User Supabase Information
    return null;
  }

  return (
    <div className="h-screen flex items-center justify-center bg-gray-800">
      <div className="max-w-2xl w-full">
        {currentAccount ? (
          <>
            <h1 className="text-center font-bold text-white">Tips</h1>
            <div>
              {tips.map((tip) => (
                <TipComponent tip={tip} />
              ))}
            </div>
          </>
        ) : (
          <button
            onClick={connectWallet}
            className="mt-10 text-lg text-white font-semibold btn-bg py-3 px-6 rounded-md focus:outline-none focus:ring-2"
          >
            Connect to Wallet
          </button>
        )}
        {/* <button onClick={handleLogOut}>log out</button> */}
      </div>
    </div>
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

export interface Tip {
  id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  deleted_at: string;
  contract_id: string;
  tweet_url: string;
  tweet_text: string;
  tweet_id: string;
  nonce: string;
  amount: string;
  tweet_owner_id: string;
  signature: string;
}
