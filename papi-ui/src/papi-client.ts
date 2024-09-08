import { dev } from "@polkadot-api/descriptors";
import { createClient } from "polkadot-api";
import { getWsProvider } from "polkadot-api/ws-provider/web";

const client = createClient(getWsProvider("ws://127.0.0.1:9944"));

const polkadotApi = client.getTypedApi(dev);

export default polkadotApi;
