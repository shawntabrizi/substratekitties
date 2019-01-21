import React from 'react';
import { ReactiveComponent } from 'oo7-react';
const { Pretty } = require('./Pretty');
import { Card, Icon, Image } from 'semantic-ui-react'
import { pretty } from 'oo7-substrate';
import { BalanceBond } from "./BalanceBond";


function KittyImage(props) {
    // FIXME: actually render a kitty based on DNA
    return <span>Image</span>
}

class KittyCard extends ReactiveComponent {
    constructor(props) {
        super(['kitty'])
    }

    render() {
        let item = this.state.kitty;
        if (!item) {
            return <Card>
                    <span>loading</span>
                </Card>;
        }

        console.log(item);

        return <Card>
                    <KittyImage dna={item.dna} />
                    <Card.Content>
                        <Card.Header><Pretty value={item.name} /></Card.Header>
                        <Card.Description><span><Pretty value={item.dna} /></span></Card.Description>
                        </Card.Content>
                        <Card.Content extra>
                        <Pretty value={item.price} prefix="$" />
                    </Card.Content>
                </Card>;
    }
}

class Kitty extends ReactiveComponent {
    constructor(props) {
        super(['hash'])
    }

    render() {
        // one level of indirection: convert a given hash
        // to the request of the actual kitty data
        let hash = this.state.hash;
        if (!hash) {
            return <Card>
                    <span>loading</span>
                </Card>;
        }

        return <KittyCard kitty={runtime.cryptokitties.kitties(hash)} />
    }
}
export class KittyCards extends ReactiveComponent {
    constructor(props) {
        super(['count'])
    }
    render() {
        if (!this.state.count) {
            return <span>No kittens found yet</span>
        }

        let kitties = [];
        for (var i=0; i < this.state.count; i++){
            kitties.push(
                <div className="column" key={i}>
                    <Kitty hash={runtime.cryptokitties.allKittiesArray(i)} />
                </div>
            );
        }
        
        return <div className="ui stackable twelve column grid">{kitties}</div>;
    }
}
