import React, { useState, useEffect } from "react";
import { Card } from 'semantic-ui-react';

import { useSubstrate } from "../substrate-lib";

import './KittyCard.css';

function KittyCard(props) {
  const { kittyIndex, kittyInfo } = props;

  console.log(kittyInfo);

  return <Card>
    <Card.Content>
      <Card.Header>
        <span className='limit-name'>Kitty Index: {kittyIndex}</span>
      </Card.Header>
      <Card.Meta>
        <span className='limit-name'>{kittyInfo.kitty}</span>
      </Card.Meta>
      <span className='limit-name'>
        <b>Owner</b>: { kittyInfo.owner }
      </span>
    </Card.Content>
    <Card.Content extra>
      { kittyInfo.price ?
        `Price: ${kittyInfo.price}` : 'Not for sale'
      }
    </Card.Content>
  </Card>;
}

export default KittyCard;
