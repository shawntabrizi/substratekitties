import { Button, Heading } from "@radix-ui/themes";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { mintKitty } from "./api/methods";
import { useKittyContext } from "./context/kitty-context";

export function MintKitty() {
  const { polkadotSigner } = useKittyContext();
  const queryClient = useQueryClient();
  const { mutate, isPending } = useMutation({
    mutationKey: ["mintKitty"],
    mutationFn: mintKitty,
    onSuccess: async (response) => {
      console.log("Kitty minted", response);
      if (response.ok) {
        toast.success("Kitty minted successfully");
      } else {
        toast.error(
          "Kitty minting failed, check the console for more information"
        );
      }
      queryClient.invalidateQueries({ queryKey: ["kitties"] });
    },
  });

  function handleMintKitty() {
    if (!polkadotSigner) {
      toast.error("No signer found");
      return;
    }
    mutate({ polkadotSigner });
  }

  return (
    <>
      <Heading>Mint New Kitty</Heading>
      <Button
        onClick={handleMintKitty}
        loading={isPending}
        disabled={polkadotSigner === undefined}
      >
        Mint New Kitty
      </Button>
    </>
  );
}
