import { dev } from "@polkadot-api/descriptors";
import { createClient } from "polkadot-api";
import { getWsProvider } from "polkadot-api/ws-provider/web";

export const createPolkadotApi = () => {
  const client = createClient(getWsProvider("ws://127.0.0.1:9944"));
  return client.getTypedApi(dev);
};

export const polkadotApi = createPolkadotApi();
