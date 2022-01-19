#!/usr/bin/env bash
#
# Usage
# cd ~/my-wave-portal
# bash ./generate-abi.sh
set -e



cp ./artifacts/contracts/TipTweet.sol/TipTweet.json ./front-end/contracts/abi/TipTweet.json
