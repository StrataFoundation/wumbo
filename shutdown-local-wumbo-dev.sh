pkill solana-test-validator
pushd ../strata-data-pipelines
docker-compose down
pushd strata-compose
docker-compose down
popd
popd
