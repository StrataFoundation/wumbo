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
  Text,
  Button,
  Alert,
  AlertIcon,
} from "@chakra-ui/react";
import {
  useTokenBonding,
  useTokenMetadata,
  useClaimedTokenRef,
  useErrorHandler,
} from "@strata-foundation/react";
import { SetMetadataArgs, useSetMetadata } from "../utils/metaplex";
import { TokenPill } from "../TokenPill";
import { Avatar } from "../Avatar";
import { useWallet } from "../contexts";

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
    const { awaitingApproval } = useWallet();
    const { handleErrors } = useErrorHandler();
    const { info: tokenRef } = useClaimedTokenRef(ownerWalletKey);
    const {
      watch,
      register,
      handleSubmit,
      setValue,
      reset,
      formState: { errors },
    } = useForm<SetMetadataArgs>({
      resolver: yupResolver(validationSchema),
    });

    const { info: tokenBonding } = useTokenBonding(tokenRef?.tokenBonding);

    const {
      image: metadataImage,
      metadata,
      error: tokenMetadataError,
    } = useTokenMetadata(tokenBonding?.targetMint);
    const { name = "", symbol = "", image } = watch();
    const { setMetadata, state, error } = useSetMetadata(tokenRef?.publicKey);

    handleErrors(tokenMetadataError, error);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setValue("image", e.target.files![0] || null);
    };

    const handleOnSubmit = async (values: SetMetadataArgs) => {
      const result = await setMetadata(values);
      if (result) {
        onComplete(result);
      }
    };

    const humanRedablePercent = (p: number | undefined = 0) =>
      (p / 4294967295) * 100;

    const [imgUrl, setImgUrl] = useState<string>();
    useEffect(() => {
      const reader = new FileReader();
      function loadListiner() {
        setImgUrl(reader.result?.toString());
      }
      reader.addEventListener("load", loadListiner);
      if (image) {
        reader.readAsDataURL(image);
      } else {
        setImgUrl(undefined);
      }

      return () => {
        reader.removeEventListener("load", loadListiner);
      };
    }, [image]);

    useEffect(() => {
      if (metadataImage) {
        setImgUrl(metadataImage);
      }

      if (state == "idle") {
        reset({
          name: metadata?.data.name,
          symbol: metadata?.data.symbol,
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
    }, [metadata?.data.name, metadata?.data.symbol, metadataImage]);

    const avatar = <Avatar src={imgUrl} name={symbol} />;

    return (
      <form onSubmit={handleSubmit(handleOnSubmit)}>
        <VStack w="full" spacing={6} padding={4} alignItems="start">
          <Text fontSize="lg">Preview</Text>
          {tokenRef && tokenBonding && (
            <TokenPill
              name={name}
              ticker={symbol}
              icon={avatar}
              tokenBonding={tokenBonding}
            />
          )}
          <Text fontSize="lg">Settings</Text>
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
              accept="image/*"
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
          <FormControl id="buyBaseRoyaltyPercentage" borderColor="gray.200">
            <FormLabel>Royalties</FormLabel>
            <Input
              isRequired
              type="number"
              min={0}
              max={100}
              placeholder="5"
              defaultValue={5}
              {...register("buyBaseRoyaltyPercentage")}
            />
            <FormHelperText>
              A Percentage of coin sales that will be sent to your wallet. We
              recommend keep this less than 10%.
            </FormHelperText>
          </FormControl>
          <FormControl id="sellBaseRoyaltyPercentage" borderColor="gray.200">
            <FormLabel>Royalties</FormLabel>
            <Input
              isRequired
              type="number"
              min={0}
              max={100}
              placeholder="5"
              defaultValue={5}
              {...register("sellBaseRoyaltyPercentage")}
            />
            <FormHelperText>
              A Percentage of coin sales that will be sent to your wallet. We
              recommend keep this less than 10%.
            </FormHelperText>
          </FormControl>
          <FormControl id="buyTargetRoyaltyPercentage" borderColor="gray.200">
            <FormLabel>Royalties</FormLabel>
            <Input
              isRequired
              type="number"
              min={0}
              max={100}
              placeholder="5"
              defaultValue={5}
              {...register("buyTargetRoyaltyPercentage")}
            />
            <FormHelperText>
              A Percentage of coin sales that will be sent to your wallet. We
              recommend keep this less than 10%.
            </FormHelperText>
          </FormControl>
          <FormControl id="sellTargetRoyaltyPercentage" borderColor="gray.200">
            <FormLabel>Royalties</FormLabel>
            <Input
              isRequired
              type="number"
              min={0}
              max={100}
              placeholder="5"
              defaultValue={5}
              {...register("sellTargetRoyaltyPercentage")}
            />
            <FormHelperText>
              A Percentage of coin sales that will be sent to your wallet. We
              recommend keep this less than 10%.
            </FormHelperText>
          </FormControl>
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
            isLoading={state != "idle"}
            type="submit"
            loadingText={
              awaitingApproval
                ? "Awaiting Approval"
                : state === "submit-solana"
                ? "Sending to Solana"
                : state === "submit-arweave"
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
