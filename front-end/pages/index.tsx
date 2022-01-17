import { MouseEventHandler, useEffect, useState } from "react";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import { ethers } from "ethers";
import supabase from "../lib/supabase";
import { User } from "@supabase/supabase-js";
import { v4 as uuidv4 } from "uuid";
import { http } from "../lib/http";
import abi from "../contracts/abi/TipTweet.json";

const CONTRACT_ABI = abi;

//typescript workaround
declare let window: any;

const Home: NextPage = () => {
  const [currentAccount, setCurrentAccount] = useState("");
  const [tweetUrl, setTweetUrl] = useState("");
  const [tweetID, setTweetID] = useState("");
  const [tip, setTip] = useState("");
  const [contractAddress, setContractAddress] = useState("");
  const [user, setUser] = useState<User | null>();

  const router = useRouter();

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

  const handleLogOut: MouseEventHandler = async (e) => {
    e.preventDefault();

    const { error } = await supabase.auth.signOut();

    if (error) {
      alert(JSON.stringify(error));
    } else {
      router.push("/signin");
    }
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const tweetID = getTweetID(tweetUrl);
    if (!tweetID) {
      alert("Invalid tweet URL");
      return;
    }

    setTweetID(tweetID);

    //get twiiter user id
    const tweetOwnerData = await http(
      `/api/v1/twitter/users/tweets/${tweetID}`
    );
    console.log("data", tweetOwnerData);

    if (!contractAddress) {
      const newContract = await createContract("123123", user as User);
      setContractAddress(newContract.address);
      console.log("created contract", newContract);
    }

    //check if tip amount is valid
    //request GET to /contract
    //returns contract address or 204

    //if contract address is valid
    //sendTransaction with tip amount to the contract

    //if no contract address returned
    //deploy a new contract with tip amount
    //save contract address to the database

    //generate nonce
    //create message using tweetID, nonce, tip amount and contract address
    //sign message with private key
    //save signature to the database and attach a twitter user id to it
  }

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

  // Render Methods
  const renderNotConnectedContainer = () => (
    <div className="flex justify-center">
      <button
        onClick={connectWallet}
        className="mt-10 text-lg text-white font-semibold btn-bg py-3 px-6 rounded-md focus:outline-none focus:ring-2"
      >
        Connect to Wallet
      </button>
    </div>
  );

  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);

  useEffect(() => {
    const getProfile = () => {
      const profile = supabase.auth.user();

      if (profile) {
        setUser(profile);
      } else {
        router.push("/signin");
      }
    };

    getProfile();
  }, []);

  useEffect(() => {
    getContract().then((contracts) => {
      if (contracts) {
        const contract = contracts[0];
        setContractAddress(contract?.address);
      }
    });
  }, [user]);

  if (!user) {
    // Currently loading asynchronously User Supabase Information
    return null;
  }

  return (
    <div className="h-screen flex items-center justify-center bg-gray-800">
      <div className="max-w-lg w-full">
        <h1 className="text-3xl font-semibold text-center text-white">
          Tip a tweet and support the author
        </h1>
        {currentAccount === "" ? (
          renderNotConnectedContainer()
        ) : (
          <div className="flex flex-col p-6">
            <form className="flex flex-col" onSubmit={handleSubmit}>
              <label htmlFor="tweet" className="text-gray-200">
                Tweet URL
              </label>
              <input
                className="py-2 px-4 rounded-md focus:outline-none focus:ring-2"
                type="text"
                id="tweet"
                value={tweetUrl}
                onChange={(e) => setTweetUrl(e.target.value)}
              />

              <label htmlFor="tipAmount" className="mt-6 text-gray-200">
                Tip Amount
              </label>
              <input
                className="py-2 px-4 rounded-md focus:outline-none focus:ring-2"
                type="text"
                id="text"
                value={tip}
                onChange={(e) => setTip(e.target.value)}
              />

              <button
                className="mt-10 text-lg text-white font-semibold btn-bg py-3 px-6 rounded-md focus:outline-none focus:ring-2"
                type="submit"
              >
                Tip Tweet
              </button>
            </form>
            <div className="text-center text-3xl text-white m-10">OR</div>
            <button
              className="text-lg text-white font-semibold btn-bg-2 py-3 px-6 rounded-md focus:outline-none focus:ring-2"
              onClick={handleLogOut}
            >
              Claim your tip
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;

function getTweetID(tweetUrl: string): string | undefined {
  const tweetID = tweetUrl.split("/").pop();

  if (tweetID?.length === 19) {
    return tweetID;
  }

  return undefined;
}

const getContract = async () => {
  let { data: contract, error } = await supabase
    .from("contracts")
    .select("*")
    .eq("active", true);
  if (error) console.log("error", error);

  return contract;
};

const createContract = async (address: string, user: User) => {
  const user_id = user.id;
  const id = uuidv4();

  let { data: contract, error } = await supabase
    .from("contracts")
    .insert({
      address,
      user_id,
      id,
    })
    .single();

  if (error) return console.log("error", error);

  return contract;
};
