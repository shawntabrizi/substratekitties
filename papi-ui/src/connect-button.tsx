import { ss58PublicKey } from "@polkadot-labs/hdkd-helpers";
import { Button, Flex } from "@radix-ui/themes";
import { useKittyContext } from "./context/kitty-context";

export function ConnectButton() {
  const { connect, polkadotSigner, disconnect, connectWithDevPhrase } =
    useKittyContext();

  const isConnected = polkadotSigner !== undefined;

  if (isConnected) {
    return (
      <Flex>
        <Button onClick={disconnect}>
          Disconnect {ss58PublicKey(polkadotSigner!.publicKey, 42)}
        </Button>
      </Flex>
    );
  }

  return (
    <Flex gap="2">
      <Button onClick={connect}>Connect</Button>
      <Button onClick={() => connectWithDevPhrase()}>Connect with Alice</Button>
      <Button onClick={() => connectWithDevPhrase("//Bob")}>
        Connect with Bob
      </Button>
    </Flex>
  );
}
