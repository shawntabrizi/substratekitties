import React, { useState, useEffect } from "react";
import { Form, Input, Grid, Message } from "semantic-ui-react";

import { useSubstrate } from "./substrate-lib";
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
    let unsubKittyCnt = null, unsubKitties = null;
    const fetchKitties = async () => {
      unsubKittyCnt = await api.query.substratekitties.kittiesCount(async kittyCnt => {
        kittyCnt = kittyCnt.toNumber();
        setKittiesCount(kittyCnt);

        // Retrieve all kitties
        unsubKitties = await api.query.substratekitties.kitties.multi(
          Array.from(Array(kittyCnt).keys()), kitties => {
          kitties = kitties.map(val => val.unwrapOr(null));
          setAllKitties(kitties);
        });
      });
    }

    fetchKitties();

    return () => {
      // clean up function
      unsubKittyCnt && unsubKittyCnt();
      unsubKitties && unsubKitties();
    }
  }, [kittiesCount, api.query.substratekitties]);

  return (
    <Grid.Column>
      <h1>Substrate Kitties</h1>
      <h3>Number of Kitties Purring: {kittiesCount.toString()}</h3>

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
    </Grid.Column>
  );
}
