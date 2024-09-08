import { Button } from "@radix-ui/themes";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useKittyContext } from "./context/kitty-context";

export function MintKitty() {
  const { polkadotSigner, api } = useKittyContext();
  const { mutate: mintKitty } = useMutation({
    mutationKey: ["mintKitty"],
    mutationFn: async () =>
      api.tx.Kitties.create_kitty().signAndSubmit(polkadotSigner!),
    onSuccess: async (response) => {
      console.log("Kitty minted", response);
      if (response.ok) {
        toast.success("Kitty minted successfully");
      } else {
        toast.error(
          "Kitty minting failed, check the console for more information"
        );
      }
    },
  });

  return <Button onClick={() => mintKitty()}>Mint New Kitty</Button>;
}
