import React from 'react';
import { ReactiveComponent } from 'oo7-react';
const { Pretty } = require('./Pretty');
import { Card, Icon, Image } from 'semantic-ui-react'
import { pretty } from 'oo7-substrate';
import { BalanceBond } from "./BalanceBond";

const IMAGES = {
    accessories: [
        require('./avatars/accessorie_1.png'),
        require('./avatars/accessorie_2.png'),
        require('./avatars/accessorie_3.png'),
        require('./avatars/accessorie_4.png'),
        require('./avatars/accessorie_5.png'),
        require('./avatars/accessorie_6.png'),
        require('./avatars/accessorie_7.png'),
        require('./avatars/accessorie_8.png'),
        require('./avatars/accessorie_9.png'),
        require('./avatars/accessorie_10.png'),
        require('./avatars/accessorie_11.png'),
        require('./avatars/accessorie_12.png'),
        require('./avatars/accessorie_13.png'),
        require('./avatars/accessorie_14.png'),
        require('./avatars/accessorie_15.png'),
        require('./avatars/accessorie_16.png'),
        require('./avatars/accessorie_17.png'),
        require('./avatars/accessorie_18.png'),
        require('./avatars/accessorie_19.png'),
        require('./avatars/accessorie_20.png')
    ],
    body: [
        require('./avatars/body_1.png'),
        require('./avatars/body_2.png'),
        require('./avatars/body_3.png'),
        require('./avatars/body_4.png'),
        require('./avatars/body_5.png'),
        require('./avatars/body_6.png'),
        require('./avatars/body_7.png'),
        require('./avatars/body_8.png'),
        require('./avatars/body_9.png'),
        require('./avatars/body_10.png'),
        require('./avatars/body_11.png'),
        require('./avatars/body_12.png'),
        require('./avatars/body_13.png'),
        require('./avatars/body_14.png'),
        require('./avatars/body_15.png')
    ],
    eyes: [
        require('./avatars/eyes_1.png'),
        require('./avatars/eyes_2.png'),
        require('./avatars/eyes_3.png'),
        require('./avatars/eyes_4.png'),
        require('./avatars/eyes_5.png'),
        require('./avatars/eyes_6.png'),
        require('./avatars/eyes_7.png'),
        require('./avatars/eyes_8.png'),
        require('./avatars/eyes_9.png'),
        require('./avatars/eyes_10.png'),
        require('./avatars/eyes_11.png'),
        require('./avatars/eyes_12.png'),
        require('./avatars/eyes_13.png'),
        require('./avatars/eyes_14.png'),
        require('./avatars/eyes_15.png')
    ],
    mouth: [
        require('./avatars/mouth_1.png'),
        require('./avatars/mouth_2.png'),
        require('./avatars/mouth_3.png'),
        require('./avatars/mouth_4.png'),
        require('./avatars/mouth_5.png'),
        require('./avatars/mouth_6.png'),
        require('./avatars/mouth_7.png'),
        require('./avatars/mouth_8.png'),
        require('./avatars/mouth_9.png'),
        require('./avatars/mouth_10.png')
    ],
    fur: [
        require('./avatars/fur_1.png'),
        require('./avatars/fur_2.png'),
        require('./avatars/fur_3.png'),
        require('./avatars/fur_4.png'),
        require('./avatars/fur_5.png'),
        require('./avatars/fur_6.png'),
        require('./avatars/fur_7.png'),
        require('./avatars/fur_8.png'),
        require('./avatars/fur_9.png'),
        require('./avatars/fur_10.png')
    ],
};


function dnaToAttributes(dna) {
    let attribute = (frm, steps) => {
        let cur = 0;
        for (var idx = frm; idx < (frm + steps); idx++) {
            cur += dna[idx];
            console.log(idx, frm, steps);
        } 
        return cur % steps
    };

    return {
        body: IMAGES.body[attribute(0, 7)],
        eyes: IMAGES.eyes[attribute(7, 7)],
        accessory: IMAGES.accessories[attribute(14, 8)],
        fur: IMAGES.fur[attribute(22, 5)],
        mouth: IMAGES.mouth[attribute(27, 5)]
    }
} 

function KittyImage(props) {
    // FIXME: actually render a kitty based on DNA
    let outerStyle = {height: "150px", position: 'relative', width: "50%"},
        innerStyle = {height: "150px", position: 'absolute', top: '0%', left: '50%'};

    let cat = dnaToAttributes(props.dna);
    return <div className="">
        <div style={outerStyle}>
            <img alt='body' src={cat.body} style={innerStyle} />
            <img alt='fur' src={cat.fur} style={innerStyle} />
            <img alt='mouth' src={cat.mouth} style={innerStyle} />
            <img alt='eyes' src={cat.eyes} style={innerStyle} />
            <img alt='accessory' src={cat.accessory} style={innerStyle} />
        </div>
    </div>
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
        
        return <div className="ui stackable five column grid">{kitties}</div>;
    }
}
