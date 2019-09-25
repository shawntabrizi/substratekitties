import React, { useState, useEffect } from "react";
import { Form, Input, Grid, Message } from "semantic-ui-react";

import TxButton from "../../TxButton";

// Based on the SubstrateKitties module
// https://github.com/shawntabrizi/substratekitties

export default function SubstrateKitties(props) {
  const { api, accountPair } = props;
  const [status, setStatus] = useState("");
  const [kittiesCount, setKittiesCount] = useState(0);
  const [allKitties, setAllKitties] = useState([]);

  // useEffect(() => {
  //   let unsubscribe;

  //   api
  //     .queryMulti(
  //       [
  //         [api.query.substratekitties.kitties, 0],
  //         [api.query.substratekitties.kittyOwners, 0],
  //         [api.query.substratekitties.kittyPrices, 0]
  //       ],
  //       ([id, owner, price]) => {
  //         console.log(`${id}: owner ${owner} and a price of ${price}`);
  //       }
  //     )
  //     .then(unsub => {
  //       unsubscribe = unsub;
  //     });

  //   return () => unsubscribe && unsubscribe();
  // }, [kittiesCount]);

  useEffect(() => {
    let unsubscribe;

    api.query.substratekitties
      .kittiesCount(count => {
        setKittiesCount(count);
      })
      .then(unsub => {
        unsubscribe = unsub;
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
            api={api}
            accountPair={accountPair}
            label={"Create Kitty"}
            setStatus={setStatus}
            params={[]}
            tx={api.tx.substratekitties.create}
          />
          {status}
        </Form.Field>
      </Form>
    </Grid.Column>
  );
}
