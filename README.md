# Spider solitaire npm
____ 

Simple spider solitaire package prepared to just include in your application

simpliest usage:

```js
// import
import Soli from 'spidersolitairegame';

// setup one suite type (1, 2 or 4 are available)
let soli = new Soli(1);

// prepare table
soli.gameSet();

// render table into DOM element
document.body.appendChild(soli.renderG());
```
