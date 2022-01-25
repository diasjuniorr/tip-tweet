# Tip Tweet 

## Table of Contents

- [About](#about)
- [Folder Structure](#folder_structure)
- [Contract Deveopment](#contract_deveopment)
- [Starting the App](#getting_started)
- [Usage](#usage)
- [Contributing](../CONTRIBUTING.md)

## About <a name = "about"></a>

Tip Tweet is hybrid dApp that allows users to tip a tweet with crypto currency without needing the author's wallet address or any other information but the tweet URL. The author can claim the tip just by logging with their Twitter account. It's under development and currently only supports Ethereum. At the moment it uses [Rinkeby](https://rinkeby.etherscan.io/) network.

## Folder structure <a name = "folder_structure"></a>

- root: contains the smart contract development environment. It uses [Hardhat](https://hardhat.org/).
- app: contains the app to interact with the contract developed with [Next.js](https://nextjs.org/) and [Supabase](https://supabase.io/).

## Contract Development <a name = "contract_development"></a>

The root directory contains the smart contract development environment. It uses [Hardhat](https://hardhat.org/). as mentioned above.
To set up the development environment, run the following command in the root directory:
```bash
npm install
## or
yarn
```

Now you can compile, test and deploy the contract.

### Compiling the contract
in the root directory, run the following command:
```bash
npx hardhat compile
```

### Testing the contract
in the root directory, run the following command:
```bash
npx hardhat test
```

### Deploying the contract
in the root directory, run the following command:
```bash
npx hardhat run scripts/deploy.ts --network <network>
```

### Copying contract ABI to the app
Every time you compile a new version of the contract you will need to provide the ABI of the contract to the app.
To do so, run the following command in the root directory:
```bash
make abi
```

## Starting the App <a name = ""></a>

To start the app to interact with the contract on the blockchain, you need to `cd app` and run the following command:

To install the dependencies, run:
```bash
npm install
## or
yarn
```

 To start it:
```bash
npm run dev
## or
yarn dev
```

## Usage <a name = "usage"></a>

Under construction.