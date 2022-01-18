import { MouseEventHandler, useEffect, useState } from "react";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import { BigNumber, ethers } from "ethers";
import supabase from "../lib/supabase";
import { User } from "@supabase/supabase-js";
import { v4 as uuidv4 } from "uuid";
import { http } from "../lib/http";
import abi from "../contracts/abi/TipTweet.json";

const CONTRACT_ABI = abi.abi;

//typescript workaround
declare let window: any;

const Home: NextPage = () => {
  const [currentAccount, setCurrentAccount] = useState("");
  const [tweetUrl, setTweetUrl] = useState("");
  const [tipAmount, setTipAmount] = useState("");
  const [contract, setContract] = useState<Contract | null>();
  const [user, setUser] = useState<User | null>();

  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    try {
      const tweetID = getTweetID(tweetUrl);
      if (!tweetID) {
        alert("Invalid tweet URL");
        return;
      }

      //get twiiter user id
      const tweetOwnerData = await http(
        `/api/v1/twitter/users/tweets/${tweetID}`
      );
      console.log("data", tweetOwnerData);
      const tweetOwnerId = tweetOwnerData.userId;

      const nonce = generateNonce();
      const ethAmount = ethers.utils.parseEther(tipAmount);

      //if user does not have a wallet (contract deployed) deploy a new one
      if (!contract) {
        console.log("No contract address found");
        const address = await deployTipContract(ethAmount);

        const newContract = await postContract(address as string, user as User);

        if (!newContract) {
          throw new Error("Could not post contract");
        }

        const message = makeNewMessage(
          ethAmount,
          tweetID,
          nonce,
          newContract.address
        );

        console.log("message", message);
        const signature = await signMessage(message);

        //what if saving tip fails?
        const newTip = await postTip(
          message,
          signature as string,
          tweetOwnerId,
          newContract,
          user as User
        );
        console.log("newTip", newTip);
        return;
      }

      //if user already has a wallet (deployed contract) use it
      //TODO: transfer founds to user's wallet (deployed contract)

      const message = makeNewMessage(
        ethAmount,
        tweetID,
        nonce,
        contract.address
      );

      const signature = await signMessage(message);

      const newTip = await postTip(
        message,
        signature as string,
        tweetOwnerId,
        contract,
        user as User
      );
      console.log("newTip", newTip);
      return;
    } catch (e) {
      throw new Error("Attempt to tip tweet failed");
    }
  }

  const deployTipContract = async (ethAmount: BigNumber) => {
    try {
      const { ethereum } = window;

      if (!currentAccount) {
        throw new Error("No account connected");
      }

      // const provider = new ethers.providers.Web3Provider(ethereum)
      const provider = new ethers.providers.JsonRpcProvider();
      const signer = provider.getSigner();

      const factory = new ethers.ContractFactory(
        CONTRACT_ABI,
        abi.bytecode,
        signer
      );

      const tipTweet = await factory.deploy({
        value: ethAmount,
      });
      await tipTweet.deployed();

      return tipTweet.address;
    } catch (err) {
      console.log(err);
      throw new Error("Could not deploy contract");
    }
  };

  const signMessage = async (message: Message) => {
    const { ethAmount, tweetID, nonce, contractAddress } = message;
    try {
      if (!currentAccount) {
        throw new Error("No account connected");
      }
      // const provider = new ethers.providers.Web3Provider(ethereum)
      const provider = new ethers.providers.JsonRpcProvider();
      const signer = provider.getSigner();
      const messageHashed = ethers.utils.solidityKeccak256(
        ["string", "uint256", "string", "address"],
        [tweetID, ethAmount, nonce, contractAddress]
      );

      const signature = await signer.signMessage(
        ethers.utils.arrayify(messageHashed)
      );
      return signature;
    } catch (err) {
      console.log(err);
      throw new Error("Could not sign message");
    }
  };

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

  const handleLogOut: MouseEventHandler = async (e) => {
    e.preventDefault();

    const { error } = await supabase.auth.signOut();

    if (error) {
      alert(JSON.stringify(error));
    } else {
      router.push("/signin");
    }
  };

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
    getContract().then((contract) => {
      if (contract) {
        setContract(contract);
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
                value={tipAmount}
                onChange={(e) => setTipAmount(e.target.value)}
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

const getContract = async (): Promise<Contract | null> => {
  try {
    let { data: contracts, error } = await supabase
      .from("contracts")
      .select("*")
      .eq("active", true);
    if (error) {
      console.log("getContract failed : ", error);
      throw new Error("getContract failed");
    }

    if (contracts) {
      const contract = contracts[0];
      return contract as Contract;
    }

    return null;
  } catch (e) {
    console.log("getContract failed : ", e);
    throw new Error("getContract failed");
  }
};

const postContract = async (address: string, user: User): Promise<Contract> => {
  const user_id = user.id;
  const id = uuidv4();

  try {
    let { data: contract, error } = await supabase
      .from("contracts")
      .insert({
        address,
        user_id,
        id,
      })
      .single();

    if (error) {
      console.log("postContract failed : ", error);
      throw new Error("postContract failed");
    }

    return contract as Contract;
  } catch (e: any) {
    console.log("postContract failed : ", e);
    throw new Error("postContract failed: ");
  }
};

const postTip = async (
  message: Message,
  signature: string,
  tweetOwnerId: string,
  contract: any,
  user: User
): Promise<Tip> => {
  const user_id = user.id;
  const id = uuidv4();

  try {
    let { data: tip, error } = await supabase
      .from("tips")
      .insert({
        id,
        user_id,
        tweet_id: message.tweetID,
        nonce: message.nonce,
        tweet_owner_id: tweetOwnerId,
        amount: message.ethAmount,
        contract_id: contract.id,
        signature,
      })
      .single();

    if (error) {
      console.log("postTip failed: ", error);
      throw new Error("postTip failed");
    }

    return tip as Tip;
  } catch (e) {
    console.log("postTip failed: ", e);
    throw new Error("postTip failed");
  }
};

const makeNewMessage = (
  ethAmount: BigNumber,
  tweetID: string,
  nonce: string,
  contractAddress: string
): Message => {
  const message = {
    tweetID,
    ethAmount,
    nonce,
    contractAddress,
  };

  return message;
};

const generateNonce = () => {
  return ethers.utils.hexlify(ethers.utils.randomBytes(16));
};

interface Message {
  tweetID: string;
  ethAmount: BigNumber;
  nonce: string;
  contractAddress: string;
}

interface Contract {
  id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  address: string;
  active: boolean;
}

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
