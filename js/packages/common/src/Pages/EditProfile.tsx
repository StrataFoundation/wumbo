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
} from "@chakra-ui/react";
import { useClaimedTokenRef } from "../utils/tokenRef";
import {
  SetMetadataArgs,
  useSetMetadata,
  useTokenMetadata,
} from "../utils/metaplex";
import { useAccount } from "../utils/account";
import { TokenPill } from "../TokenPill";
import { Avatar } from "../Avatar";
import { Alert } from "../Alert";
import { TokenBonding } from "../utils/deserializers/spl-token-bonding";
import { handleErrors, useWallet } from "../contexts";

interface IEditProfileProps {
  ownerWalletKey: PublicKey;
  onComplete(completeArgs: { metadataAccount: PublicKey }): void;
}

const validationSchema = yup
  .object({
    name: yup.string().required().min(2),
    symbol: yup.string().required().min(2).max(10),
    targetRoyaltyPercentage: yup.number().required(),
    image: yup.mixed(),
  })
  .required();

export const EditProfile = React.memo(
  ({ ownerWalletKey, onComplete }: IEditProfileProps) => {
    const hiddenFileInput = React.useRef<HTMLInputElement>(null);
    const { awaitingApproval } = useWallet();
    const { info: tokenRef } = useClaimedTokenRef(ownerWalletKey);
    const {
      watch,
      register,
      handleSubmit,
      setValue,
      reset,
      getValues,
      formState: { errors },
    } = useForm<SetMetadataArgs>({
      resolver: yupResolver(validationSchema),
    });

    const { info: tokenBonding } = useAccount(
      tokenRef?.tokenBonding,
      TokenBonding
    );

    const {
      image: metadataImage,
      metadata,
      error: tokenMetadataError,
    } = useTokenMetadata(tokenBonding?.targetMint);
    const { name = "", symbol = "", targetRoyaltyPercentage, image } = watch();
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
          targetRoyaltyPercentage:
            ((tokenBonding?.targetRoyaltyPercentage || 0) / 4294967295) * 100,
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
          <FormControl id="targetRoyaltyPercentage" borderColor="gray.200">
            <FormLabel>
              Royalties
            </FormLabel>
            <Input
              isRequired
              type="number"
              min={0}
              max={100}
              placeholder="5"
              defaultValue={5}
              {...register("targetRoyaltyPercentage")}
            />
            <FormHelperText>
              A Percentage of coin sales that will be sent to your wallet. We
              recommend keep this less than 10%.
            </FormHelperText>
          </FormControl>
          {error && <Alert type="error" message={error.toString()} />}
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
