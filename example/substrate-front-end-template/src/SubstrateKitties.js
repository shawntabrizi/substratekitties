import React, { useState, useEffect } from 'react';
import { Input, Form, Grid } from 'semantic-ui-react';

import { useSubstrate } from './substrate-lib';
import KittyCards from './KittyCard';
import { TxButton } from './substrate-lib/components';

// Based on the SubstrateKitties module
// https://github.com/shawntabrizi/substratekitties

export default function SubstrateKitties (props) {
  const { api } = useSubstrate();
  const [status, setStatus] = useState('');
  const [parents, setParents] = useState({});

  const [kittiesCount, setKittiesCount] = useState(0);
  const [allKitties, setAllKitties] = useState([]);

  // double check this function
  const onChange = (_, input) =>
    setParents(prev => ({ ...prev, [input.state]: input.value }));

  useEffect(() => {
    let unsubKittyCnt = null;
    const rpc = api.query.substratekitties;

    const fetchKitties = async () => {
      unsubKittyCnt = await rpc.kittiesCount(async kittyCnt => {
        kittyCnt = kittyCnt.toNumber();
        setKittiesCount(kittyCnt);

        // Retrieve all kitties, owners, and its price
        const kittyRange = Array.from(Array(kittyCnt).keys());
        const [dnas, kittyOwners, kittyPrices] = await Promise.all([
          rpc.kitties.multi(kittyRange),
          rpc.kittyOwners.multi(kittyRange),
          rpc.kittyPrices.multi(kittyRange)
        ]);
        const kitties = kittyRange.map(i => ({
          dna: dnas[i].unwrapOr(null),
          owner: kittyOwners[i].unwrapOr(null),
          price: kittyPrices[i].unwrapOr(null)
        }));
        setAllKitties(kitties);
      });
    };

    fetchKitties();

    return () => {
      // clean up function
      unsubKittyCnt && unsubKittyCnt();
    };
  }, [kittiesCount, api.query.substratekitties]);

  return (
    <Grid.Column>
      <h1>Substrate Kitties</h1>
      <h3>Number of Kitties Purring: {kittiesCount.toString()}</h3>
      {allKitties.length > 0 ? (
        <KittyCards kitties={allKitties} />
      ) : (
        'No Kitty Found.'
      )}

      <Grid stackable columns='2'>
        <Grid.Row>
          <Grid.Column>
            <Form>
              <h3>Create Kitty</h3>
              <Form.Field>
                <TxButton
                  accountPair={props.accountPair}
                  label={'Create Kitty'}
                  setStatus={setStatus}
                  type='TRANSACTION'
                  attrs={{ params: [], tx: api.tx.substratekitties.create }}
                />
              </Form.Field>
            </Form>
          </Grid.Column>
          <Grid.Column>
            <Form>
              <h3>Breed Kitty</h3>
              <Form.Field>
                <Input
                  fluid
                  label='Parent 1'
                  type='number'
                  placeholder='Kitty Index'
                  state='parent-1'
                  onChange={onChange}
                />
              </Form.Field>
              <Form.Field>
                <Input
                  fluid
                  label='Parent 2'
                  type='number'
                  placeholder='Kitty Index'
                  state='parent-2'
                  onChange={onChange}
                />
              </Form.Field>
              <Form.Field>
                <TxButton
                  accountPair={props.accountPair}
                  label={'Breed Kitty'}
                  setStatus={setStatus}
                  type='TRANSACTION'
                  disabled={!parents['parent-1'] || !parents['parent-2']}
                  attrs={{
                    params: [parents['parent-1'], parents['parent-2']],
                    tx: api.tx.substratekitties.breed
                  }}
                />
              </Form.Field>
            </Form>
          </Grid.Column>
        </Grid.Row>
        {status ? (
          <Grid.Row>
            <Grid.Column>{status}</Grid.Column>
          </Grid.Row>
        ) : null}
      </Grid>
    </Grid.Column>
  );
}
