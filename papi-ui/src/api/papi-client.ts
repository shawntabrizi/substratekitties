import { dev } from "@polkadot-api/descriptors";
import { createClient } from "polkadot-api";
import { getWsProvider } from "polkadot-api/ws-provider/web";
import { SHOULD_USE_LOCAL_DATA } from "./constants";

export const createPolkadotApi = () => {
  const client = createClient(getWsProvider("ws://127.0.0.1:9944"));
  return client.getTypedApi(dev);
};

export const polkadotApi = SHOULD_USE_LOCAL_DATA
  ? undefined
  : createPolkadotApi();
