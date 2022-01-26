import React, { useEffect } from "react";
import { useHistory, useParams } from "react-router-dom";
import { useAsync } from "react-async-hook";
import { useForm } from "react-hook-form";
import { PublicKey, Transaction } from "@solana/web3.js";
import {
  AccountLayout,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  Token,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import toast from "react-hot-toast";
import {
  useErrorHandler,
  useTokenMetadata,
  useAssociatedAccount,
  useAssociatedTokenAddress,
  usePrimaryClaimedTokenRef,
  useMint,
  usePriceInUsd,
  useOwnedAmount,
  useSolPrice,
  useEstimatedFees,
  usePublicKey,
  useProvider,
} from "@strata-foundation/react";
import {
  Text,
  HStack,
  VStack,
  Center,
  FormLabel,
  Input,
  FormControl,
  InputRightElement,
  InputGroup,
  Circle,
  Button,
  Alert,
  AlertIcon,
  Icon,
  Flex,
} from "@chakra-ui/react";
import { AiOutlineExclamation } from "react-icons/ai";
import { BiCheck } from "react-icons/bi";
import { Notification } from "../Notification";
import { Spinner } from "../Spinner";
import { Avatar } from "../Avatar";
import { useWallet } from "@solana/wallet-adapter-react";
import { SplTokenMetadata } from "@strata-foundation/spl-utils";
import { useQuery } from "../utils";

type FormValues = { amount: number; recipient: string };

export const Send = ({ finishRedirectUrl }: { finishRedirectUrl: string }) => {
  const query = useQuery();
  const recipientRaw = query.get("recipient");

  const { handleErrors } = useErrorHandler();
  const history = useHistory();
  const params = useParams<{ mint: string | undefined }>();
  const mint = usePublicKey(params.mint);
  const { publicKey } = useWallet();
  const { awaitingApproval, provider } = useProvider();
  const ownedAmount = useOwnedAmount(mint);
  const validationSchema = yup.object({
    amount: yup
      .number()
      .required()
      .max(ownedAmount || 0)
      .positive(),
    recipient: yup.string().required(),
  });
  const mintAcc = useMint(mint);
  const { result: source, loading: myAtaLoading } = useAssociatedTokenAddress(
    publicKey,
    mint
  );

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormValues>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      amount: undefined,
      recipient: recipientRaw || "",
    },
  });

  const fiatPrice = usePriceInUsd(mint);
  const solFiatPrice = useSolPrice();
  const toFiat = (a: number) => (fiatPrice ? fiatPrice * a : undefined);

  const recipientStr = watch("recipient");
  const amount = watch("amount");
  const recipient = usePublicKey(recipientStr);
  console.log(recipientRaw, recipientStr, recipient);
  const {
    associatedAccount: ata,
    loading: ataLoading,
    associatedAccountKey,
  } = useAssociatedAccount(recipient, mint);
  const { amount: fee, error: feeError } = useEstimatedFees(
    !ataLoading && recipient && !ata ? AccountLayout.span : 0,
    1
  );

  const {
    image: baseImage,
    metadata: baseMetadata,
    loading,
    error,
  } = useTokenMetadata(mint);

  const { info: tokenRef, loading: refLoading } =
    usePrimaryClaimedTokenRef(recipient);
  const { metadata, loading: metadataLoading } = useTokenMetadata(
    tokenRef?.tokenMetadata
  );
  const {
    result: image,
    error: imageError,
    loading: imageLoading,
  } = useAsync(SplTokenMetadata.getImage, [metadata?.data.uri]);
  const recipientLoading = refLoading || metadataLoading || imageLoading;

  const recipientRegister = register("recipient");
  const recipientRef = React.useRef<HTMLParagraphElement>(null);
  useEffect(() => {
    if (recipientRef.current && recipientRaw) {
      recipientRef.current.innerHTML = recipientRaw;
    }
  }, [recipientRef, recipientRaw]);
  handleErrors(imageError, error, feeError);

  const handleUseMax = () => {
    setValue("amount", ownedAmount || 0);
  };

  const handleOnSubmit = async (values: FormValues) => {
    const tx = new Transaction();
    const recipient = new PublicKey(values.recipient);
    if (!ata) {
      tx.add(
        Token.createAssociatedTokenAccountInstruction(
          ASSOCIATED_TOKEN_PROGRAM_ID,
          TOKEN_PROGRAM_ID,
          mint!,
          associatedAccountKey!,
          recipient,
          publicKey!
        )
      );
    }
    tx.add(
      Token.createTransferInstruction(
        TOKEN_PROGRAM_ID,
        source!,
        associatedAccountKey!,
        publicKey!,
        [],
        values.amount * Math.pow(10, mintAcc!.decimals)
      )
    );

    await provider!.send(tx, [], {
      commitment: "confirmed",
      preflightCommitment: "confirmed",
    });

    toast.custom((t) => (
      <Notification
        show={t.visible}
        type="success"
        heading="Transaction Successful"
        message={`Successfully sent ${Number(values.amount).toFixed(4)} of ${
          baseMetadata?.data.symbol
        }!`}
        onDismiss={() => toast.dismiss(t.id)}
      />
    ));
    history.push(finishRedirectUrl);
    reset();
  };

  const noBalance = ata?.amount.toNumber() === 0;
  const noAta = !ataLoading && recipient && !ata;
  const invalidAddress = Boolean(!recipient && recipientStr);
  return (
    <form onSubmit={handleSubmit(handleOnSubmit)}>
      <VStack spacing={4}>
        <Center>
          {loading && <Spinner />}
          {!loading && <Avatar h="64px" w="64px" src={baseImage} />}
        </Center>
        <FormControl>
          <HStack mb={1} w="full" justifyContent="space-between">
            <FormLabel
              color="gray.600"
              m={0}
              fontSize="sm"
              fontWeight="500"
              fontStyle="normal"
              for="send"
            >
              Send
            </FormLabel>
            <Text
              fontSize="sm"
              fontWeight="500"
              onClick={handleUseMax}
              color="indigo.500"
              textDecoration="underline"
              _hover={{ cursor: "pointer" }}
            >
              Use Max {baseMetadata?.data.symbol}{" "}
              {fiatPrice && ownedAmount
                ? `(~$${toFiat(ownedAmount)?.toFixed(2)})`
                : undefined}
            </Text>
          </HStack>
          <InputGroup>
            <Input
              autoFocus
              size="lg"
              type="number"
              {...register("amount")}
              max={ownedAmount}
              step={0.0000000001}
              placeholder="0"
            />
            <InputRightElement
              h="100%"
              width="inherit"
              maxWidth="100px"
              minWidth="40px"
            >
              <Text color="gray.700">{baseMetadata?.data.symbol}</Text>
            </InputRightElement>
          </InputGroup>
        </FormControl>
        {errors.amount && (
          <Alert status="error" rounded={4}>
            <AlertIcon />
            {errors.amount.message}
          </Alert>
        )}

        <FormControl>
          <FormLabel
            color="gray.600"
            mb={1}
            fontSize="sm"
            fontWeight="500"
            fontStyle="normal"
            for="recipient"
          >
            Recipient
          </FormLabel>
          <HStack
            spacing={4}
            rounded={4}
            border="1px"
            borderColor="gray.200"
            p={4}
          >
            <Center>
              {metadata && (
                <Avatar
                  w="57px"
                  h="57px"
                  showDetails
                  src={image}
                  direction="column"
                />
              )}
              {!metadata && (
                <Circle
                  w={recipientStr ? "57px" : "24px"}
                  h={recipientStr ? "57px" : "24px"}
                  backgroundColor="gray.200"
                >
                  {recipient && !ataLoading && (
                    <Center>
                      {noAta || noBalance ? (
                        <Icon color="#dd6b20" as={AiOutlineExclamation} />
                      ) : (
                        <Icon color="green" as={BiCheck} />
                      )}
                    </Center>
                  )}
                  {invalidAddress && (
                    <Center>
                      <Icon color="red" as={AiOutlineExclamation} />
                    </Center>
                  )}
                </Circle>
              )}
            </Center>
            <VStack
              w="full"
              spacing={1}
              alignItems="start"
              justifyContent="stretch"
            >
              {metadata && (
                <Text flexGrow={0} fontWeight={800}>
                  {metadata.data.name}
                </Text>
              )}
              {recipient && noBalance && (
                <Text flexGrow={0} fontSize="xs" color="#dd6b20">
                  This address does not own any {baseMetadata?.data.symbol}
                </Text>
              )}
              {recipient && noAta && (
                <Text flexGrow={0} fontSize="xs" color="#dd6b20">
                  This address has no {baseMetadata?.data.symbol} account, you
                  will pay to create it
                </Text>
              )}
              {invalidAddress && (
                <Text flexGrow={0} fontSize="xs" color="red">
                  Invalid address
                </Text>
              )}
              <Text
                {...recipientRegister}
                ref={recipientRef}
                onInput={(e) => {
                  // @ts-ignore
                  e.target.value = e.target.innerText;
                  // @ts-ignore
                  e.target.name = recipientRegister.name;
                  recipientRegister.onChange(e);
                }}
                wordBreak="break-word"
                flexGrow={1}
                className="input"
                role="textbox"
                contentEditable
                w="full"
                border="none"
                overflow="auto"
                outline="none"
                resize="none"
                boxShadow="none"
                ring="none"
                placeholder="Enter Address"
                _focus={{ boxShadow: "none" }}
              />
            </VStack>
          </HStack>
        </FormControl>
        {errors.recipient && (
          <Alert rounded={4} status="error">
            <AlertIcon />
            {errors.recipient.message}
          </Alert>
        )}

        <VStack
          w="full"
          spacing={2}
          padding={4}
          align="stretch"
          color="gray.400"
          borderColor="gray.200"
          borderWidth="1px"
          rounded="lg"
          fontSize="md"
        >
          <Flex justify="space-between" alignItems="center">
            <Text>You'll Send</Text>
            <Text>
              {amount} {baseMetadata?.data.symbol}
              {amount && fiatPrice ? ` ≈ $${toFiat(amount)?.toFixed(2)}` : ""}
            </Text>
          </Flex>
          <Flex justify="space-between" alignItems="center">
            <Text>Estimated Fees</Text>
            <Flex>
              {fee?.toFixed(4)} SOL ≈ $
              {solFiatPrice && fee
                ? (solFiatPrice * fee).toFixed(2)
                : undefined}
            </Flex>
          </Flex>
        </VStack>
        <Button
          isDisabled={
            !!errors.amount ||
            !!errors.recipient ||
            invalidAddress ||
            !recipientStr
          }
          w="full"
          type="submit"
          colorScheme="indigo"
          size="lg"
          isLoading={
            isSubmitting ||
            myAtaLoading ||
            ataLoading ||
            recipientLoading ||
            awaitingApproval
          }
          loadingText={
            awaitingApproval
              ? "Awaiting Approval"
              : isSubmitting
              ? "Sending"
              : "Loading"
          }
        >
          Send
        </Button>
      </VStack>
    </form>
  );
};
