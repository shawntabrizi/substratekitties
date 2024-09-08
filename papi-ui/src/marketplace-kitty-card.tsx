import { Button, Card, Flex, Heading, Text } from "@radix-ui/themes";
import { type Kitty } from "./context/kitty-context";

interface Props {
  kitty: Kitty;
}

export function MarketplaceKittyCard({ kitty }: Props) {
  const handlePurchase = () => {
    // TODO: Implement purchase logic
    console.log(`Purchasing kitty ${kitty.dna} for ${kitty.price}`);
  };

  return (
    <Card size="2">
      <Flex direction="column" gap="2">
        <Heading as="h3" size="4">
          Kitty DNA: {kitty.dna}
        </Heading>
        <Text>Owner: {kitty.owner}</Text>
        <Text>Price: {kitty.price}</Text>
        <Button onClick={handlePurchase}>Purchase</Button>
      </Flex>
    </Card>
  );
}
