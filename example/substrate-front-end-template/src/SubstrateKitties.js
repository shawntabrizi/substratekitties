import React, { useState, useEffect } from "react";
import { Form, Input, Grid, Message } from "semantic-ui-react";

import { useSubstrate } from "./substrate-lib";
import KittyCard from './KittyCard';
import { TxButton } from "./substrate-lib/components";

// Based on the SubstrateKitties module
// https://github.com/shawntabrizi/substratekitties

export default function SubstrateKitties(props) {
  const { api, keyring } = useSubstrate();
  const accounts = keyring.getPairs();
  const [status, setStatus] = useState("");
  const [kittiesCount, setKittiesCount] = useState(0);
  const [allKitties, setAllKitties] = useState([]);

  useEffect(() => {
    let unsubKittyCnt = null;
    const rpc = api.query.substratekitties;

    const fetchKitties = async () => {
      unsubKittyCnt = await rpc.kittiesCount(async kittyCnt => {
        kittyCnt = kittyCnt.toNumber();
        setKittiesCount(kittyCnt);

        // Retrieve all kitties, owners, and its price
        const kittyRange = Array.from(Array(kittyCnt).keys());
        const [kitties, kittyOwners, kittyPrices] = await Promise.all([
          rpc.kitties.multi(kittyRange),
          rpc.kittyOwners.multi(kittyRange),
          rpc.kittyPrices.multi(kittyRange),
        ]);
        const kittyInfo = kittyRange.map(i => ({
          kitty: kitties[i].unwrapOr(null),
          owner: kittyOwners[i].unwrapOr(null),
          price: kittyPrices[i].unwrapOr(null),
        }));
        setAllKitties(kittyInfo);
      });
    }

    fetchKitties();

    return () => {
      // clean up function
      unsubKittyCnt && unsubKittyCnt();
    }
  }, [kittiesCount, api.query.substratekitties]);

  return <Grid.Column>
    <h1>Substrate Kitties</h1>
    <h3>Number of Kitties Purring: {kittiesCount.toString()}</h3>
    {
      allKitties.length > 0 ?
      allKitties.map((kittyInfo, ind) => <KittyCard key={ind} kittyInfo={kittyInfo} kittyIndex={ind}/>) :
      "No Kitty Found."
    }
    <Form>
      <Form.Field>
        <TxButton
          accountPair={props.accountPair}
          label={"Create Kitty"}
          setStatus={setStatus}
          type="TRANSACTION"
          attrs={{ params: [], tx: api.tx.substratekitties.create }}
        />
        {status}
      </Form.Field>
    </Form>
  </Grid.Column>;
}
