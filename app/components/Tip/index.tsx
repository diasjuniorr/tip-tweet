interface TipProps {
  tip: Tip;
}

const TipComponent: React.FC<TipProps> = ({ tip }) => {
  return (
    <div className="flex flex-row bg-white w-full h-40 items-center rounded-md mb-6">
      <div className="basis-9/12 py-6 px-6 font-semibold">
        <p>{tip.tweet_text}</p>
        <div className="mt-4 font-light">
          <a className="hover:underline" target="_blank" href={tip.tweet_url}>
            Go to tweet
          </a>
        </div>
      </div>
      <div className="flex flex-col basis-3/12 items-center justify-between">
        <div className="text-center text-lg font-semibold">
          <p>{tip.amount} eth</p>
        </div>
        <div className="mt-4">
          <button className="text-lg text-white font-semibold btn-bg-2 py-1 px-3 rounded-md focus:outline-none focus:ring-2 h-12 w-32 transition ease delay-75 hover:-translate-y-1">
            Claim
          </button>
        </div>
      </div>
    </div>
  );
};

interface Tip {
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

export default TipComponent;
