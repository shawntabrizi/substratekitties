import React from "react";
import { Grid, Card } from 'semantic-ui-react';
import { bnToHex } from '@polkadot/util';
import { encodeAddress } from '@polkadot/util-crypto';

import KittyAvatar from './avatars';
import './KittyCard.css';

function KittyCard(props) {
  const { kittyIndex, kitty } = props;

  return <Card>
    <KittyAvatar dna={kitty.dna}/>
    <Card.Content>
      <Card.Header>
        <h4><span className='with-limit'>Kitty Index: {kittyIndex}</span></h4>
      </Card.Header>
      <Card.Meta>
        <span className='with-limit'>DNA: <b>{bnToHex(kitty.dna)}</b></span>
        <span className='with-limit'>Owner: <b>{encodeAddress(kitty.owner)}</b></span>
      </Card.Meta>
    </Card.Content>
    <Card.Content extra>
      { kitty.price ?
        `Price: ${kitty.price}` : 'Not for sale'
      }
    </Card.Content>
  </Card>;
}

function KittyCards(props) {
  const { kitties } = props;
  const colCount = 3;
  const rowCount = Math.ceil(kitties.length / colCount);

  return <Grid className="mb-3" stackable columns="3">{
    Array.from(Array(rowCount).keys()).map(row => <Grid.Row key={row}>{
      Array.from(Array(colCount).keys())
        .filter(col => row * colCount + col < kitties.length)
        .map(col => {
          const kittyInd = row * colCount + col;
          return <Grid.Column key={kittyInd}>
            <KittyCard kitty={kitties[kittyInd]} kittyIndex={kittyInd}/>
          </Grid.Column>
        })
    }</Grid.Row>)
  }</Grid>
}

export default KittyCards;
