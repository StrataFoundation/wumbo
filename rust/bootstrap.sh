#!/bin/bash

set -e

WUM_CURVE_LOG=$(./spl-token-bonding/cli/target/debug/spl-token-bonding create-log-curve 1000000000 1000000000000 15 --base-relative false)
echo $WUM_CURVE_LOG
WUM_CURVE_ARR=( $WUM_CURVE_LOG )
WUM_CURVE=${WUM_CURVE_ARR[2]}

sleep 15 # No idea why, doesn't work without this.

WUM_BONDING_LOG=$(./spl-token-bonding/cli/target/debug/spl-token-bonding create-bonding $WUM_CURVE So11111111111111111111111111111111111111112)
echo $WUM_BONDING_LOG
WUM_BONDING_ARR=( $WUM_BONDING_LOG )
WUM_TOKEN=${WUM_BONDING_ARR[3]}
WUM_BONDING=${WUM_BONDING_ARR[7]}

CREATOR_CURVE_LOG=$(./spl-token-bonding/cli/target/debug/spl-token-bonding create-log-curve 10000000000 1000000000000 15 --base-relative false)
echo $CREATOR_CURVE_LOG
CREATOR_CURVE_ARR=( $WUM_CURVE_LOG )
CREATOR_CURVE=${CREATOR_CURVE_ARR[2]}

./spl-wumbo/cli/target/debug/spl-wumbo create-wumbo-instance $WUM_TOKEN $CREATOR_CURVE
