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
    let unsubscribe;

    api.query.substratekitties
      .kittiesCount(count => {
        setKittiesCount(count);
      })
      .then(unsub => {
        unsubscribe = unsub;
      });

    api.query.substratekitties.kitties(kitties => {
      console.log("Kitties", kitties);
    });

    return () => unsubscribe && unsubscribe();
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
