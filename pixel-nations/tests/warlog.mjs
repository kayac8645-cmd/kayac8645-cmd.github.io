import {newGame,stepHour} from '../js/game.js';
const S=newGame(+process.argv[2]||1234,2);
for(let h=0;h<24*(+process.argv[3]||120);h++) stepHour(S);
for(const e of S.log) if(['war','capture'].includes(e.tag)||/SAVAŞ|barış|tarihe/.test(e.text)) console.log(Math.floor(e.t/24),e.text);
