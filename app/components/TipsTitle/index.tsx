import LoadingComponent from "../Loading";

interface TipsTitleProps {
  hasTips: boolean;
  isLoading: boolean;
}

const TipsTitle: React.FC<TipsTitleProps> = ({ hasTips, isLoading }) => {
  return (
    <>
      {isLoading ? (
        <div className="text-center">
          <LoadingComponent />
        </div>
      ) : (
        <h1 className="text-center text-2xl font-bold text-white mb-6">
          {hasTips ? "Tips to claim" : "No tips to claim"}
        </h1>
      )}
    </>
  );
};

export default TipsTitle;
