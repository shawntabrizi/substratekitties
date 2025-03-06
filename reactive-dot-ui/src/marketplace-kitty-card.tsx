import { Button, Card, Flex, Heading, Text } from "@radix-ui/themes";
import { pending } from "@reactive-dot/core";
import {
  useMutation,
  useNativeTokenAmountFromPlanck,
  useSigner,
} from "@reactive-dot/react";
import { Binary } from "polkadot-api";
import { KittyAvatar } from "./kitty-avatar";

interface Props {
  dna: string;
  owner: string;
  price: bigint;
}

export function MarketplaceKittyCard({ dna, price, owner }: Props) {
  const [state, buyKitty] = useMutation((tx) =>
    tx.Kitties.buy_kitty({
      kitty_id: Binary.fromHex(dna),
      max_price: BigInt(price),
    })
  );

  return (
    <Card size="2">
      <Flex direction="column" gap="2">
        <KittyAvatar dna={dna} />
        <Heading as="h3" size="4">
          Kitty DNA: {dna}
        </Heading>
        <Text>Owner: {owner}</Text>
        <Text>
          Price: {useNativeTokenAmountFromPlanck(price).toLocaleString()}
        </Text>
        <Button
          onClick={() => buyKitty()}
          loading={state === pending}
          disabled={useSigner() === undefined}
        >
          Purchase
        </Button>
      </Flex>
    </Card>
  );
}
