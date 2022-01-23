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

  const claimTip = async (tip: Tip) => {
    try {
      const { ethereum } = window;

      if (!currentAccount) {
        throw new Error("No account connected");
      }

      const provider = new ethers.providers.Web3Provider(ethereum);
      // const provider = new ethers.providers.JsonRpcProvider();
      const signer = provider.getSigner();
      const tipTweetContract = new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        signer
      );

      const amount = ethers.utils.parseEther(tip.amount);

      const claimTip = await tipTweetContract.claimTip(
        tip.tweet_id,
        amount,
        tip.nonce,
        tip.signature,
        { gasLimit: 300000 }
      );

      await claimTip.wait();
      console.log("claimTip: ", claimTip);

      const updated = await updateTip(tip);

      if (!updated) {
        console.log("updating tip failed");
        throw new Error("updating tip failed");
      }

      const getTips = async () => {
        try {
          let { data: tips, error } = await supabase
            .from("tips")
            .select("*")
            .eq("claimed", false);
          if (error) {
            console.log("getTips failed: ", error);
            throw new Error("getTips failed");
          }

          console.log("getTips updated: ", tips);
          return setTips(tips as Tip[]);
        } catch (e) {
          console.log("getTips failed: ", e);
          throw new Error("getTips failed");
        }
      };

      getTips();
    } catch (err) {
      console.log(err);
    }
  };

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
        let { data: tips, error } = await supabase
          .from("tips")
          .select("*")
          .eq("claimed", false);
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
    <div className="min-h-screen flex items-center justify-center bg-gray-800">
      <div className="max-w-2xl w-full">
        {currentAccount ? (
          <>
            <h1 className="text-center font-bold text-white">Tips</h1>
            {JSON.stringify(tips, null, 2)}
            <div>
              {tips.map((tip) => (
                <TipComponent key={tip.id} tip={tip} claimTip={claimTip} />
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
      </div>
    </div>
  );
};

export default Tips;

const updateTip = async (tip: Tip) => {
  let { data: error } = await supabase
    .from("tips")
    .update({ claimed: true })
    .eq("id", tip.id);

  if (error) {
    console.log("claimTip failed: ", error);
    throw new Error("claimTip failed");
  }

  return true;
};

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
