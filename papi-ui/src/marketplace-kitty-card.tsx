import { Button, Card, Flex, Heading, Text } from "@radix-ui/themes";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FixedSizeBinary } from "polkadot-api";
import { toast } from "sonner";
import { useKittyContext } from "./context/kitty-context";

interface Props {
  dna: string;
  owner: string;
  price: bigint;
}

export function MarketplaceKittyCard({ dna, price, owner }: Props) {
  const { polkadotSigner, api } = useKittyContext();
  const queryClient = useQueryClient();
  const { mutate, isPending } = useMutation({
    mutationKey: ["purchase-kitty", dna],
    mutationFn: async () =>
      api.tx.Kitties.buy_kitty({
        kitty_id: FixedSizeBinary.fromHex(dna),
        max_price: price,
      }).signAndSubmit(polkadotSigner!),
    onSuccess: async (response) => {
      console.log("Kitty purchased", response);
      if (response.ok) {
        toast.success("Kitty purchased");
      } else {
        toast.error(
          "Kitty purchase failed, check the console for more information"
        );
      }
      await queryClient.invalidateQueries({ queryKey: ["kitties"] });
    },
  });

  const handlePurchase = () => {
    if (!polkadotSigner) {
      toast.error("No signer found");
      return;
    }

    mutate();
  };

  return (
    <Card size="2">
      <Flex direction="column" gap="2">
        <Heading as="h3" size="4">
          Kitty DNA: {dna}
        </Heading>
        <Text>Owner: {owner}</Text>
        <Text>Price: {price?.toString()}</Text>
        <Button
          onClick={handlePurchase}
          loading={isPending}
          disabled={polkadotSigner === undefined}
        >
          Purchase
        </Button>
      </Flex>
    </Card>
  );
}
