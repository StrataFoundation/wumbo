#!/bin/bash

pushd ../strata
anchor localnet &
localnet_pid=$!
popd


pushd ../strata-data-pipelines
docker-compose up -d
sleep 15
pushd strata-compose
docker-compose up -d
popd
popd

sleep 15
solana transfer -u http://127.0.0.1:8899 wwm872RcvN7XwNZBjXLSHfAYrFUATKgkV9v3BewHj5M 10  --allow-unfunded-recipient
solana transfer -u http://127.0.0.1:8899 GibysS6yTqHWw4AZap416Xs26rAo9nV9HTRviKuutytp 10  --allow-unfunded-recipient

pushd ../strata
echo "Bootstrapping localnet"
./bootstrap-localnet.sh
popd

sleep 10

echo "Setting up identity service"
pushd ../wumbo-identity-service
echo "[65,132,47,88,190,203,121,144,128,74,168,72,223,142,99,217,37,69,160,251,149,35,244,207,84,215,60,50,97,177,113,194,233,135,171,110,133,84,123,5,221,78,104,240,67,217,2,28,6,229,231,56,141,138,249,55,23,239,192,197,165,117,249,85]" > $HOME/.config/solana/twitter-dev.json
env ANCHOR_WALLET=$HOME/.config/solana/twitter-dev.json SOLANA_URL=http://127.0.0.1:8899 yarn run bootstrap
popd

echo "Localnet: $localnet_pid"
echo $localnet_pid > localnet.pid
