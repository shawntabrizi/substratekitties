import { Button, Card, Flex, Heading, Text } from "@radix-ui/themes";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { buyKitty } from "../api/methods";
import { useKittyContext } from "../context/use-kitty-context";
import { KittyAvatar } from "./kitty-avatar";

interface Props {
  dna: string;
  owner: string;
  price: string;
}

export function MarketplaceKittyCard({ dna, price, owner }: Props) {
  const queryClient = useQueryClient();
  const { polkadotSigner } = useKittyContext();
  const { mutate, isPending } = useMutation({
    mutationKey: ["purchase-kitty", dna],
    mutationFn: buyKitty,
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

    mutate({ polkadotSigner, dna, maxPrice: BigInt(price) });
  };

  return (
    <Card size="2">
      <Flex direction="column" gap="2">
        <KittyAvatar dna={dna} />
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
