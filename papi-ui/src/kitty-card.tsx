import { Card, Flex, Heading, Text } from "@radix-ui/themes";
import { SetPriceForm } from "./set-price-form";
import { TransferKittyForm } from "./transfer-kitty-form";

interface Props {
  kitty: {
    dna: string;
    owner: string;
    price: number | null;
  };
  isOwner: boolean;
}

export function KittyCard({ kitty, isOwner }: Props) {
  return (
    <Card size="2">
      <Flex direction="column" gap="2">
        <Heading as="h3" size="4">
          Kitty DNA: {kitty.dna}
        </Heading>
        <Text>Owner: {kitty.owner}</Text>
        <Text>
          Price: {kitty.price === null ? "Not for sale" : kitty.price}
        </Text>
        {isOwner && (
          <>
            <TransferKittyForm kittyDna={kitty.dna} />
            <SetPriceForm kittyDna={kitty.dna} currentPrice={kitty.price} />
          </>
        )}
      </Flex>
    </Card>
  );
}
