import React, { useEffect, useState } from "react";
import { PublicKey } from "@solana/web3.js";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
  VStack,
  HStack,
  FormControl,
  Input,
  FormHelperText,
  FormLabel,
  Heading,
  Button,
  Alert,
  AlertIcon,
} from "@chakra-ui/react";
import {
  useTokenBonding,
  useTokenMetadata,
  usePrimaryClaimedTokenRef,
  useErrorHandler,
  useProvider,
  useCollective,
  humanReadablePercentage,
} from "@strata-foundation/react";
import { ISetMetadataArgs, useSetMetadata } from "../hooks";
import { TokenPill } from "../TokenPill";
import { Avatar } from "../Avatar";
import { Spinner } from "../Spinner";
import { ITokenBondingSettings } from "@strata-foundation/spl-token-collective";

interface IEditProfileProps {
  ownerWalletKey: PublicKey;
  onComplete(completeArgs: { metadataAccount: PublicKey }): void;
}

const validationSchema = yup
  .object({
    name: yup.string().required().min(2),
    symbol: yup.string().required().min(2).max(10),
    sellBaseRoyaltyPercentage: yup.number().required(),
    buyBaseRoyaltyPercentage: yup.number().required(),
    sellTargetRoyaltyPercentage: yup.number().required(),
    buyTargetRoyaltyPercentage: yup.number().required(),
    image: yup.mixed(),
  })
  .required();

export const EditProfile = React.memo(
  ({ ownerWalletKey, onComplete }: IEditProfileProps) => {
    const hiddenFileInput = React.useRef<HTMLInputElement>(null);
    const { awaitingApproval } = useProvider();
    const { handleErrors } = useErrorHandler();
    const { info: tokenRef, loading: loadingTokenRef } =
      usePrimaryClaimedTokenRef(ownerWalletKey);
    const {
      watch,
      register,
      handleSubmit,
      setValue,
      setError,
      clearErrors,
      reset,
      formState: { errors },
    } = useForm<ISetMetadataArgs>({
      resolver: yupResolver(validationSchema),
    });
    const { info: collective } = useCollective(tokenRef?.collective);
    const tokenBondingSettings = collective?.config
      .claimedTokenBondingSettings as ITokenBondingSettings | undefined;

    function percentOr(percentu32: number | undefined, def: number) {
      return percentu32 ? Number(humanReadablePercentage(percentu32)) : def;
    }

    const { info: tokenBonding, loading: loadingTokenBonding } =
      useTokenBonding(tokenRef?.tokenBonding);

    const {
      image: metadataImage,
      metadata: targetMetadata,
      error: targetMetadataError,
      loading: targetMetadataLoading,
    } = useTokenMetadata(tokenBonding?.targetMint);

    const {
      metadata: baseMetadata,
      error: baseMetadataError,
      loading: baseMetadataLoading,
    } = useTokenMetadata(tokenBonding?.baseMint);

    const { name = "", symbol = "", image } = watch();
    const [setMetadata, { loading, loadingState, error }] = useSetMetadata(
      tokenRef?.publicKey
    );

    handleErrors(targetMetadataError || baseMetadataError);
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files![0];
      const sizeKB = file.size / 1024;

      if (sizeKB < 25) {
        setError("image", {
          type: "manual",
          message: `The file ${file.name} is too small. It is ${
            Math.round(10 * sizeKB) / 10
          }KB but should be at least 25KB.`,
        });
        return;
      }

      setValue("image", file || null);
      clearErrors("image");
    };

    const handleOnSubmit = async (values: ISetMetadataArgs) => {
      const result = await setMetadata(values);

      if (result && result.metadataAccount) {
        onComplete(result as any);
      }
    };

    const humanRedablePercent = (p: number | undefined = 0) =>
      Number(((p / 4294967295) * 100).toFixed(2));

    const [imgUrl, setImgUrl] = useState<string>();

    useEffect(() => {
      if (image) {
        const reader = new FileReader();
        reader.onload = (event) => {
          setImgUrl((event.target?.result as string) || "");
        };

        reader.readAsDataURL(image);
      } else {
        setImgUrl(undefined);
      }
    }, [image]);

    useEffect(() => {
      if (metadataImage) {
        setImgUrl(metadataImage);
      }

      if (loadingState == "idle") {
        reset({
          name: targetMetadata?.data.name,
          symbol: targetMetadata?.data.symbol,
          sellBaseRoyaltyPercentage: humanRedablePercent(
            tokenBonding?.sellBaseRoyaltyPercentage
          ),
          buyBaseRoyaltyPercentage: humanRedablePercent(
            tokenBonding?.buyBaseRoyaltyPercentage
          ),
          sellTargetRoyaltyPercentage: humanRedablePercent(
            tokenBonding?.sellTargetRoyaltyPercentage
          ),
          buyTargetRoyaltyPercentage: humanRedablePercent(
            tokenBonding?.buyTargetRoyaltyPercentage
          ),
        });
      }
    }, [targetMetadata?.data.name, targetMetadata?.data.symbol, metadataImage]);

    const avatar = <Avatar src={imgUrl} name={symbol} />;

    if (
      (!tokenRef && !tokenBonding) ||
      loadingTokenRef ||
      loadingTokenBonding ||
      targetMetadataLoading ||
      baseMetadataLoading
    ) {
      return <Spinner />;
    }

    return (
      <form onSubmit={handleSubmit(handleOnSubmit)}>
        <VStack w="full" spacing={6} padding={4} alignItems="start">
          <Heading fontSize="xl">Preview</Heading>
          {tokenRef && tokenBonding && (
            <TokenPill
              name={name}
              ticker={symbol}
              icon={avatar}
              tokenBonding={tokenBonding}
            />
          )}
          <Heading fontSize="xl">Settings</Heading>
          <FormControl id="photo">
            <FormLabel>Photo</FormLabel>
            <HStack w="full" spacing={4}>
              {avatar}
              <Button
                size="md"
                colorScheme="gray"
                variant="outline"
                onClick={() => hiddenFileInput.current!.click()}
              >
                Choose
              </Button>
            </HStack>
            <input
              id="image"
              type="file"
              accept=".png,.jpg,.gif,.mp4,.svg"
              multiple={false}
              onChange={handleImageChange}
              ref={hiddenFileInput}
              style={{ display: "none" }}
            />
            <FormHelperText color={errors.image?.message && "red.400"}>
              {errors.image?.message || `The image of your token.`}
            </FormHelperText>
          </FormControl>
          <FormControl id="name" borderColor="gray.200">
            <FormLabel>Name</FormLabel>
            <Input
              isInvalid={!!errors.name}
              placeholder="My Awesome Coin"
              defaultValue={""}
              {...register("name")}
            />
            <FormHelperText color={errors.symbol?.message && "red.400"}>
              {errors.name?.message || `The name for your token.`}
            </FormHelperText>
          </FormControl>
          <FormControl id="symbol" borderColor="gray.200">
            <FormLabel>Symbol</FormLabel>
            <Input
              isInvalid={!!errors.symbol}
              placeholder="NXX2"
              defaultValue={""}
              {...register("symbol")}
            />
            <FormHelperText color={errors.symbol?.message && "red.400"}>
              {errors.symbol?.message ||
                `The short name for your token. For Example, WUM is the token of
              Wum.bo.`}
            </FormHelperText>
          </FormControl>
          <VStack align="left" w="full">
            <Heading fontSize="xl" mb={4}>
              Royalties
            </Heading>
            <HStack>
              <FormControl
                id="buyTargetRoyaltyPercentage"
                borderColor="gray.200"
              >
                <FormLabel>
                  {symbol || targetMetadata?.data.symbol} (Buy)
                </FormLabel>
                <Input
                  isRequired
                  type="number"
                  min={percentOr(
                    tokenBondingSettings?.minBuyTargetRoyaltyPercentage,
                    0
                  )}
                  max={percentOr(
                    tokenBondingSettings?.maxBuyTargetRoyaltyPercentage,
                    100
                  )}
                  placeholder="5"
                  defaultValue={5}
                  step={0.00001}
                  {...register("buyTargetRoyaltyPercentage")}
                />
              </FormControl>
              <FormControl
                id="sellTargetRoyaltyPercentage"
                borderColor="gray.200"
              >
                <FormLabel>
                  {symbol || targetMetadata?.data.symbol} (Sell)
                </FormLabel>
                <Input
                  isRequired
                  type="number"
                  min={percentOr(
                    tokenBondingSettings?.minSellTargetRoyaltyPercentage,
                    0
                  )}
                  max={percentOr(
                    tokenBondingSettings?.maxSellTargetRoyaltyPercentage,
                    100
                  )}
                  placeholder="5"
                  defaultValue={5}
                  step={0.00001}
                  {...register("sellTargetRoyaltyPercentage")}
                />
              </FormControl>
            </HStack>
            <HStack>
              <FormControl id="buyBaseRoyaltyPercentage" borderColor="gray.200">
                <FormLabel>{baseMetadata?.data.symbol} (Buy)</FormLabel>
                <Input
                  isRequired
                  type="number"
                  min={percentOr(
                    tokenBondingSettings?.minBuyBaseRoyaltyPercentage,
                    0
                  )}
                  max={percentOr(
                    tokenBondingSettings?.maxBuyBaseRoyaltyPercentage,
                    100
                  )}
                  placeholder="5"
                  defaultValue={5}
                  step={0.00001}
                  {...register("buyBaseRoyaltyPercentage")}
                />
              </FormControl>
              <FormControl
                id="sellBaseRoyaltyPercentage"
                borderColor="gray.200"
              >
                <FormLabel>{baseMetadata?.data.symbol} (Sell)</FormLabel>
                <Input
                  isRequired
                  type="number"
                  min={percentOr(
                    tokenBondingSettings?.minSellBaseRoyaltyPercentage,
                    0
                  )}
                  max={percentOr(
                    tokenBondingSettings?.maxSellBaseRoyaltyPercentage,
                    100
                  )}
                  placeholder="5"
                  defaultValue={5}
                  step={0.00001}
                  {...register("sellBaseRoyaltyPercentage")}
                />
              </FormControl>
            </HStack>
            <FormControl>
              <FormHelperText>
                A Percentage of coin buys/sales that will be sent to your
                wallet. We recommend to keep this less than a combined 10% for
                buys/sales.
              </FormHelperText>
            </FormControl>
          </VStack>
          {error && (
            <Alert status="error">
              <AlertIcon />
              {error.toString()}
            </Alert>
          )}
          <Button
            w="full"
            colorScheme="indigo"
            size="lg"
            isLoading={loading}
            type="submit"
            loadingText={
              awaitingApproval
                ? "Awaiting Approval"
                : loadingState === "submit-solana"
                ? "Sending to Solana"
                : loadingState === "submit-arweave"
                ? "Sending to Arweave"
                : "Gathering Files"
            }
          >
            Save
          </Button>
        </VStack>
      </form>
    );
  }
);
