import React from 'react';

const IMAGES = {
    accessories: [
        require('./accessorie_1.png'),
        require('./accessorie_2.png'),
        require('./accessorie_3.png'),
        require('./accessorie_4.png'),
        require('./accessorie_5.png'),
        require('./accessorie_6.png'),
        require('./accessorie_7.png'),
        require('./accessorie_8.png'),
        require('./accessorie_9.png'),
        require('./accessorie_10.png'),
        require('./accessorie_11.png'),
        require('./accessorie_12.png'),
        require('./accessorie_13.png'),
        require('./accessorie_14.png'),
        require('./accessorie_15.png'),
        require('./accessorie_16.png'),
        require('./accessorie_17.png'),
        require('./accessorie_18.png'),
        require('./accessorie_19.png'),
        require('./accessorie_20.png')
    ],
    body: [
        require('./body_1.png'),
        require('./body_2.png'),
        require('./body_3.png'),
        require('./body_4.png'),
        require('./body_5.png'),
        require('./body_6.png'),
        require('./body_7.png'),
        require('./body_8.png'),
        require('./body_9.png'),
        require('./body_10.png'),
        require('./body_11.png'),
        require('./body_12.png'),
        require('./body_13.png'),
        require('./body_14.png'),
        require('./body_15.png')
    ],
    eyes: [
        require('./eyes_1.png'),
        require('./eyes_2.png'),
        require('./eyes_3.png'),
        require('./eyes_4.png'),
        require('./eyes_5.png'),
        require('./eyes_6.png'),
        require('./eyes_7.png'),
        require('./eyes_8.png'),
        require('./eyes_9.png'),
        require('./eyes_10.png'),
        require('./eyes_11.png'),
        require('./eyes_12.png'),
        require('./eyes_13.png'),
        require('./eyes_14.png'),
        require('./eyes_15.png')
    ],
    mouth: [
        require('./mouth_1.png'),
        require('./mouth_2.png'),
        require('./mouth_3.png'),
        require('./mouth_4.png'),
        require('./mouth_5.png'),
        require('./mouth_6.png'),
        require('./mouth_7.png'),
        require('./mouth_8.png'),
        require('./mouth_9.png'),
        require('./mouth_10.png')
    ],
    fur: [
        require('./fur_1.png'),
        require('./fur_2.png'),
        require('./fur_3.png'),
        require('./fur_4.png'),
        require('./fur_5.png'),
        require('./fur_6.png'),
        require('./fur_7.png'),
        require('./fur_8.png'),
        require('./fur_9.png'),
        require('./fur_10.png')
    ],
};


function dnaToAttributes(dna) {
    let attribute = (index, options) => {
        return dna[index] % options
    };

    return {
        body: IMAGES.body[attribute(0, 15)],
        eyes: IMAGES.eyes[attribute(1, 15)],
        accessory: IMAGES.accessories[attribute(2, 20)],
        fur: IMAGES.fur[attribute(3, 10)],
        mouth: IMAGES.mouth[attribute(4, 10)]
    }
} 

export function KittyAvatar(props) {
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