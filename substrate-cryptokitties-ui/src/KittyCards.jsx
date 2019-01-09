import React from 'react';
import { ReactiveComponent } from 'oo7-react';
const { Pretty } = require('./Pretty');
import { Card, Icon, Image } from 'semantic-ui-react'
import { pretty } from 'oo7-substrate';

export class KittyCards extends ReactiveComponent {
    constructor() {
        super(["value"])
        this.state.kittyArray = []
    }

    componentDidMount() {
        this.getKitties()
    }

    getKitties() {
        runtime.cryptokitties.kittiesCount
        .then(num => {
            for(let i=0; i < this.state.value; i ++) {
                runtime.cryptokitties.kitties(i)
                .then(cat => {
                    this.setState({kittyArray:[...this.state.kittyArray, cat]});
                })
            }
        })
    }

    renderKitties() {
        return this.state.kittyArray.map((item,i) =>
                    <div class="column">
                    <Card>
                    <Image src={'https://robohash.org/' + i + '.png?set=set4'} />
                    <Card.Content>
                    <Card.Header>{item.name}</Card.Header>
                    <Card.Meta>
                        <span className='date'>{i}</span>
                    </Card.Meta>
                    <Card.Description><span>{item.dna.toString().substring(0,3)}</span></Card.Description>
                    </Card.Content>
                    <Card.Content extra>
                    <a>
                        <Icon name='dollar' />
                        {item.price.toString()}
                    </a>
                    </Card.Content>
                </Card>
                </div>)
      }

    readyRender() {
        return <div class="ui stackable twelve column grid">{this.renderKitties()}</div>
    }
}
