import { dev } from "@polkadot-api/descriptors";
import { defineConfig } from "@reactive-dot/core";
import { InjectedWalletProvider } from "@reactive-dot/core/wallets.js";
import { registerDotConnect } from "dot-connect";
import "dot-connect/font.css";
import { withPolkadotSdkCompat } from "polkadot-api/polkadot-sdk-compat";
import { getWsProvider } from "polkadot-api/ws-provider/web";

export const config = defineConfig({
  chains: {
    kitties: {
      descriptor: dev,
      provider: withPolkadotSdkCompat(getWsProvider("ws://127.0.0.1:9944")),
    },
  },
  wallets: [new InjectedWalletProvider()],
});

registerDotConnect({ wallets: config.wallets ?? [] });
