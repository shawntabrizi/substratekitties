import { Card, Flex, Heading, Text } from "@radix-ui/themes";
import { KittyAvatar } from "./kitty-avatar";
import { SetPriceForm } from "./set-price-form";
import { TransferKittyForm } from "./transfer-kitty-form";

interface Props {
  dna: string;
  owner: string;
  price?: string;
  isOwner: boolean;
}

export function KittyCard({ dna, owner, price, isOwner }: Props) {
  return (
    <Card size="2">
      <Flex direction="column" gap="2">
        <KittyAvatar dna={dna} />
        <Heading as="h3" size="2">
          DNA
        </Heading>
        <Text>{dna}</Text>
        <Heading as="h3" size="2">
          Owner
        </Heading>
        <Text>{owner}</Text>
        <Heading as="h3" size="2">
          Price
        </Heading>
        <Text>{price ?? "Not for sale"}</Text>
        {isOwner && (
          <>
            <TransferKittyForm kittyDna={dna} />
            <SetPriceForm kittyDna={dna} currentPrice={price} />
          </>
        )}
      </Flex>
    </Card>
  );
}
