import React from 'react';

class Socialmedia extends React.Component {
  render() {
    return (
        <ul className="socialmedia">
            <li><a className="opensea" href="https://opensea.io/collection/degen-mutoonz" target="_blank" title="Go to OpenSea"></a></li>
            <li><a className="tofunft" href="https://tofunft.com/collection/degen-mutoonz/items" target="_blank" title="Go to tofuNFT.com"></a></li>
            <li><a className="twitter" href="https://twitter.com/degen_mutoonz" target="_blank" title="Go to twitter"></a></li>
        </ul>
    );
  }
}

export {Socialmedia};