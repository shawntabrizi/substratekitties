import { Button, Heading } from "@radix-ui/themes";

import { pending } from "@reactive-dot/core";
import { useMutation, useSigner } from "@reactive-dot/react";

export function MintKitty() {
  const [state, mintKitty] = useMutation((tx) => tx.Kitties.create_kitty());

  return (
    <>
      <Heading>Mint New Kitty</Heading>
      <Button
        onClick={() => mintKitty()}
        loading={state === pending}
        disabled={useSigner() === undefined}
      >
        Mint New Kitty
      </Button>
    </>
  );
}
