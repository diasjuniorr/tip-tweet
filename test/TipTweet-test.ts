import { expect } from "chai";
import { ethers } from "hardhat";

describe("TipTweet", function () {
  let tipTweetContractFactory;
  let tipTweetContract: any;
  let contractAddress: string;

  const tweetID = "123456789";
  const ethAmount = ethers.utils.parseEther("0.005");
  const nonce = ethers.utils.hexlify(ethers.utils.randomBytes(16));
  const noAmount = ethers.utils.parseEther("0");

  beforeEach(async () => {
    tipTweetContractFactory = await ethers.getContractFactory("TipTweet");
    tipTweetContract = await tipTweetContractFactory.deploy();
    await tipTweetContract.deployed();

    contractAddress = tipTweetContract.address;
  });

  it("Should be able to receive a tip", async function () {
    const [owner] = await ethers.getSigners();

    const messageHashed = ethers.utils.solidityKeccak256(
      ["string", "uint256", "string", "address"],
      [tweetID, ethAmount, nonce, contractAddress]
    );

    const signature = await owner.signMessage(
      ethers.utils.arrayify(messageHashed)
    );

    const tx = await tipTweetContract.tipTweet(signature, {
      value: ethAmount,
      gasLimit: 300000,
    });

    await tx.wait();

    expect(await tipTweetContract.getBalance()).to.equal(ethAmount);
  });

  it("Should be able to claim a tip", async function () {
    const [owner, add1] = await ethers.getSigners();

    const messageHashed = ethers.utils.solidityKeccak256(
      ["string", "uint256", "string", "address"],
      [tweetID, ethAmount, nonce, contractAddress]
    );

    const signature = await owner.signMessage(
      ethers.utils.arrayify(messageHashed)
    );

    const tx = await tipTweetContract.tipTweet(signature, {
      value: ethAmount,
      gasLimit: 300000,
    });

    await tx.wait();

    const balanceBeforeClaim = await add1.getBalance();

    await tipTweetContract
      .connect(add1)
      .claimTip(tweetID, ethAmount, nonce, signature);

    // needs to find an easy way to concat bigNumbers to check equality
    expect(await tipTweetContract.getBalance()).to.equal(noAmount);
    expect(await add1.getBalance()).to.not.equal(balanceBeforeClaim);
  });

  it("Should not be able to claim same tip more than once", async function () {
    const [owner, add1] = await ethers.getSigners();

    const messageHashed = ethers.utils.solidityKeccak256(
      ["string", "uint256", "string", "address"],
      [tweetID, ethAmount, nonce, contractAddress]
    );

    const signature = await owner.signMessage(
      ethers.utils.arrayify(messageHashed)
    );

    const tx = await tipTweetContract.tipTweet(signature, {
      value: ethAmount,
      gasLimit: 300000,
    });

    await tx.wait();

    await tipTweetContract
      .connect(add1)
      .claimTip(tweetID, ethAmount, nonce, signature);

    await expect(
      tipTweetContract
        .connect(add1)
        .claimTip(tweetID, ethAmount, nonce, signature)
    ).to.be.revertedWith("Nonce already used");
  });

  it("Should not be able to claim tip using wrong nonce", async function () {
    const [owner, add1] = await ethers.getSigners();

    const messageHashed = ethers.utils.solidityKeccak256(
      ["string", "uint256", "string", "address"],
      [tweetID, ethAmount, nonce, contractAddress]
    );

    const signature = await owner.signMessage(
      ethers.utils.arrayify(messageHashed)
    );

    const tx = await tipTweetContract.tipTweet(signature, {
      value: ethAmount,
      gasLimit: 300000,
    });

    await tx.wait();

    await expect(
      tipTweetContract
        .connect(add1)
        .claimTip(tweetID, ethAmount, "1", signature)
    ).to.be.revertedWith("Signature is not valid.");
  });

  it("Should not be able to claim tip using wrong amount", async function () {
    const [owner, add1] = await ethers.getSigners();

    const messageHashed = ethers.utils.solidityKeccak256(
      ["string", "uint256", "string", "address"],
      [tweetID, ethAmount, nonce, contractAddress]
    );

    const signature = await owner.signMessage(
      ethers.utils.arrayify(messageHashed)
    );

    const tx = await tipTweetContract.tipTweet(signature, {
      value: ethAmount,
      gasLimit: 300000,
    });

    await tx.wait();

    const differentAmount = ethers.utils.parseEther("0.001");

    await expect(
      tipTweetContract
        .connect(add1)
        .claimTip(tweetID, differentAmount, nonce, signature)
    ).to.be.revertedWith("Signature is not valid.");
  });

  it("Should not be able to claim tip using wrong tweet ID", async function () {
    const [owner, add1] = await ethers.getSigners();

    const messageHashed = ethers.utils.solidityKeccak256(
      ["string", "uint256", "string", "address"],
      [tweetID, ethAmount, nonce, contractAddress]
    );

    const signature = await owner.signMessage(
      ethers.utils.arrayify(messageHashed)
    );

    const tx = await tipTweetContract.tipTweet(signature, {
      value: ethAmount,
      gasLimit: 300000,
    });

    await tx.wait();

    const differentTweetID = "1234567890";

    await expect(
      tipTweetContract
        .connect(add1)
        .claimTip(differentTweetID, ethAmount, nonce, signature)
    ).to.be.revertedWith("Signature is not valid.");
  });
});
