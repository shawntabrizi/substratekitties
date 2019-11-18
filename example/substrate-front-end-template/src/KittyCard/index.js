import React, { useState, useEffect } from "react";
import { Grid, Card } from 'semantic-ui-react';

import { useSubstrate } from '../substrate-lib';
import KittyAvatar from './avatars';

import './KittyCard.css';

function KittyCard(props) {
  const { kittyIndex, kitty } = props;

  return <Card>
    <KittyAvatar dna={kitty.dna}/>
    <Card.Content>
      <Card.Header>
        <span className='limit-name'>Kitty Index: {kittyIndex}</span>
      </Card.Header>
      <Card.Meta>
        <span className='limit-name'>{kitty.dna}</span>
      </Card.Meta>
      <span className='limit-name'>
        <b>Owner</b>: { kitty.owner }
      </span>
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

  return <Grid className="mb-grid" stackable columns="3">{
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
