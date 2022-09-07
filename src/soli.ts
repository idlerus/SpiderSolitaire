import './soli.scss';

type c = {'type': string, 'c': string, 'hidden': boolean};

class Soli
{
  private table: HTMLDivElement;
  private window: HTMLDivElement;

  private pack: string[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
  private type: string[] = ['RH', 'RD', 'BL', 'BD'];
  private sCount: number;
  private set: c[] = [];

  private typesCount: number;

  private win: boolean = false;
  private lose: boolean = false;

  private slots: {[slot: string]: c[]} = {};

  private hist: {action: string, data: any}[] = [];
  private maxHist: number = 20;

  private selected: {slot: number|null, index: number|null} = {slot: null, index: null};

  constructor(types: number = 1, packs: number = 2)
  {
    this.typesCount = types;
    this.sCount = packs;
    this.gameSet(types);
  }

  public gameSet(types: number = 1): void
  {
    this.set = [];
    this.slots = {};

    let multiplier = 1;
    if(![1,2,4].includes(types))
    {
      throw new Error('Types must be 1, 2 or 4');
    }

    if(types === 1)
    {
      multiplier = 4;
    }
    else if(types === 2)
    {
      multiplier = 2;
    }

    for(let i = 0; i < this.sCount * multiplier; i++)
    {
      for(let i = 0; i < types; i++)
      {
        for(let c of this.pack)
        {
          this.set.push(
              {
                'type': this.type[i],
                'c': c,
                'hidden': true,
              }
          );
        }
      }
    }
    this.shuffle(this.set);

    for(let i = 0; i < 10; i++)
    {
      this.slots[i] = [];
      for(let x = 0; x < 4; x++)
      {
        this.slots[i].push(this.set.pop());
      }
    }

    for(let i = 0; i < 4; i++)
    {
      this.slots[i].push(this.set.pop());
    }

    for(let i = 0; i < 10; i++)
    {
      this.slots[i].push(this.set.pop());
      this.slots[i][this.slots[i].length -1].hidden = false;
    }
  }

  public updateG(): void
  {
    this.rowSolved();
    this.gameWon();
    this.checkLost();

    this.table.innerHTML = '';

    if(this.win)
    {
      let win = document.createElement('span');
      win.innerText = 'You win!';
      win.classList.add('win');
      win.style.position = 'absolute';
      win.style.top = '50%';
      win.style.left = '50%';
      win.style.transformOrigin = '50% 50%';
      win.style.background = '#fff';
      win.style.padding = '15px';
      win.style.fontSize = '32px';
      win.style.border = '3px solid #ddd';
      win.style.boxShadow = '0 10px 15px rgb(0 0 0 / 30%)';
      this.table.appendChild(win);
    }

    if(this.lose)
    {
      let lose = document.createElement('span');
      lose.innerText = 'You lost!';
      lose.classList.add('lose');
      lose.style.position = 'absolute';
      lose.style.top = '50%';
      lose.style.left = '50%';
      lose.style.transformOrigin = '50% 50%';
      lose.style.background = '#fff';
      lose.style.padding = '15px';
      lose.style.fontSize = '32px';
      lose.style.border = '3px solid #ddd';
      lose.style.boxShadow = '0 10px 15px rgb(0 0 0 / 30%)';
      this.table.appendChild(lose);
    }

    for(let i in this.slots)
    {
      let slot = document.createElement('div');
      if(this.slots[i].length < 1)
      {
        let cDiv = document.createElement('div');
        cDiv.classList.add('empty');
        let listener = () =>
        {
          if(this.selected.slot !== null && this.selected.index !== null)
          {
            this.moveC(this.selected.slot, this.selected.index, parseInt(i));
            this.selected.slot = null;
            this.selected.index = null;
            this.updateG();
          }
        };
        cDiv.addEventListener('click', listener.bind(this));
        slot.appendChild(cDiv);
      }
      else
      {
        for(let c of this.slots[i])
        {
          let cDiv = document.createElement('div');

          if(!c.hidden)
          {
            if(this.selected.slot === parseInt(i) && this.selected.index === this.slots[i].indexOf(c))
            {
              cDiv.classList.add('active');
            }

            cDiv.dataset['type'] = c.type;
            cDiv.dataset['c'] = c.c;
            cDiv.dataset['hidden'] = c.hidden ? 'true':'false';
            cDiv.classList.add(c.type.toLowerCase());
            cDiv.innerHTML = '<span>' + c.c + '</span><span></span>';
            let listener = () =>
            {
              if(this.selected.slot !== null && this.selected.index !== null)
              {
                this.moveC(this.selected.slot, this.selected.index, parseInt(i));
                this.selected.slot = null;
                this.selected.index = null;
                this.updateG();
              }
              else
              {
                this.selected.slot = parseInt(i);
                this.selected.index = this.slots[i].indexOf(c);
                this.updateG();
              }
            };
            cDiv.addEventListener('click', listener.bind(this));
          }
          else
          {
            cDiv.classList.add('back');
            cDiv.innerHTML = '<span></span>';
          }

          slot.appendChild(cDiv);
        }
      }
      this.table.appendChild(slot);
    }

    if(this.set.length >= 10)
    {
      let deck = document.createElement('div');
      deck.id = 'deck';
      deck.innerText = (this.set.length / 10).toString();
      deck.addEventListener('click', this.handOut.bind(this));
      this.table.appendChild(deck);
    }
  }

  public renderG(): HTMLDivElement
  {
    let window = document.createElement('div');
    window.id = 'soliG';
    this.window = window;

    let div = document.createElement('div');
    div.id = 'soliGTable';
    this.table = div;
    this.window.appendChild(div);

    let menu = document.createElement('div');
    menu.id = 'soliGMenu';
    let histButton = document.createElement('button');
    let histListener = () => {
      this.rollBackHist();
    }
    histButton.innerText = 'Undo';
    histButton.addEventListener('click', histListener.bind(this));
    menu.appendChild(histButton);

    let restartButton = document.createElement('button');
    let restartListener = () => {
      this.gameSet(this.typesCount);
      this.updateG();
    }
    restartButton.innerText = 'Restart game';
    restartButton.addEventListener('click', restartListener.bind(this));
    menu.appendChild(restartButton);

    window.appendChild(menu);


    this.updateG();
    return window;
  }

  private gameWon(): void
  {
    let empty = true;
    for(let i in this.slots)
    {
      if(this.slots[i].length > 0)
      {
        empty = false;
      }
    }

    if(empty)
    {
      this.win = true;
    }
  }

  private canMove(slot: number, index: number): boolean
  {
    let count = this.slots[slot].length - index;
    if(count > 0)
    {
      let c = this.slots[slot][index];
      if(c === undefined)
      {
        return false;
      }
      for(let i = 0; i < count; i++)
      {
        if(this.slots[slot][index + i] !== undefined && c.type !== this.slots[slot][index + i].type)
        {
          return false;
        }

        if(this.slots[slot][index + i + 1] !== undefined)
        {
          if (this.slots[slot][index + i].c !== 'A' && this.slots[slot][index + i + 1].c !== this.pack[this.pack.indexOf(this.slots[slot][index + i].c) - 1])
          {
            return false;
          }
        }
      }
    }

    return true;
  }

  private rowSolved()
  {
    for(let i in this.slots)
    {
      for(let c of this.slots[i])
      {
        if(c.hidden === false && c.c === 'A')
        {
          let index = this.slots[i].indexOf(c);
          if(this.slots[i].length - 1 === index)
          {
            if(this.slots[i].length >= 12)
            {
              let test = this.slots[i].slice(-13).reverse();
              console.log(test, this.slots[i]);
              let string = '';
              for(let c of test)
              {
                string += c.c;
              }
              if(string === 'A2345678910JQK')
              {
                this.slots[i].splice(this.slots[i].length-13, 13);
                if(this.slots[i][this.slots[i].length -1] !== undefined)
                {
                  this.slots[i][this.slots[i].length - 1].hidden = false;
                }
                this.updateHist('rowComplete', {slotIn: i, type: c.type});
              }
            }
          }
        }
      }
    }
  }

  public moveC(slot: number, index: number, slotTarget: number): boolean
  {
    let targetC = this.slots[slotTarget][this.slots[slotTarget].length-1];
    let sourceC = this.slots[slot][index];

    if(!this.canMove(slot, index))
    {
      return false;
    }

    if(this.slots[slotTarget].length < 1 || this.canPlace(sourceC, targetC))
    {
      this.updateHist('move', {moveFromSlot: slot, moveFromIndex: index, moveToSlot: slotTarget, moveToIndex: this.slots[slotTarget].length});

      let moveIndex = this.slots[slot].length-index;
      let tempDeck = [];

      for(let i = 0; i < moveIndex; i++)
      {
        tempDeck.push(this.slots[slot].pop());
      }

      tempDeck = tempDeck.reverse();

      for(let c of tempDeck)
      {
        this.slots[slotTarget].push(c);
      }

      if(this.slots[slot][index-1] !== undefined && this.slots[slot][index-1].hidden !== false)
      {
        this.slots[slot][index-1].hidden = false;
      }

      return true;
    }
    else
    {
      return false;
    }
  }

  private updateHist(action: string, data: any): void
  {
    if(this.hist.length >= this.maxHist)
    {
      this.hist.shift();
    }

    this.hist.push({
      action: action,
      data: data,
    });
  }

  private rollBackHist(): void
  {
    if(this.hist.length < 1)
    {
      return;
    }

    let action = this.hist.pop();

    if(action.action === 'move')
    {
      let moveIndex = this.slots[action.data.moveToSlot].length-action.data.moveToIndex;
      let tempDeck = [];

      for(let i = 0; i < moveIndex; i++)
      {
        tempDeck.push(this.slots[action.data.moveToSlot].pop());
      }

      tempDeck = tempDeck.reverse();

      for(let c of tempDeck)
      {
        this.slots[action.data.moveFromSlot].push(c);
      }

      if(this.slots[action.data.moveToSlot][action.data.moveToIndex-1] !== undefined && this.slots[action.data.moveToSlot][action.data.moveToIndex-1].hidden !== false)
      {
        this.slots[action.data.moveToSlot][action.data.moveToIndex-1].hidden = false;
      }
    }
    else if(action.action === 'handout')
    {
      for(let i in this.slots)
      {
        let c = this.slots[i].pop();
        this.set.push(c);
      }
    }
    else if(action.action === 'rowComplete')
    {
      this.slots[action.data.slotIn].push(
        {type: action.data.type, c: 'K', hidden: false},
        {type: action.data.type, c: 'Q', hidden: false},
        {type: action.data.type, c: 'J', hidden: false},
        {type: action.data.type, c: '10', hidden: false},
        {type: action.data.type, c: '9', hidden: false},
        {type: action.data.type, c: '8', hidden: false},
        {type: action.data.type, c: '7', hidden: false},
        {type: action.data.type, c: '6', hidden: false},
        {type: action.data.type, c: '5', hidden: false},
        {type: action.data.type, c: '4', hidden: false},
        {type: action.data.type, c: '3', hidden: false},
        {type: action.data.type, c: '2', hidden: false},
        {type: action.data.type, c: 'A', hidden: false},
      );

      this.rollBackHist();
    }

    this.updateG();
  }

  private checkLost(): void
  {
    let possibleMoves = 0;

    if(this.set.length > 1 || this.win === true)
    {
      return;
    }

    for(let i in this.slots)
    {
      for(let c of this.slots[i])
      {
        if(c.hidden === false)
        {
          for(let x in this.slots)
          {
            let targetC = this.slots[x][this.slots[x].length-1];
            let sourceC = this.slots[i][this.slots[i].indexOf(c)];

            if(this.canMove(parseInt(i), this.slots[i].indexOf(c)))
            {
              if(this.slots[x].length < 1 || this.canPlace(sourceC, targetC))
              {
                possibleMoves++;
              }
            }
          }
        }
      }
    }
    if(possibleMoves < 1)
    {
      this.lose = true;
    }
  }

  private handOut(): boolean
  {
    let canDo = true;
    for(let i in this.slots)
    {
      if(this.slots[i].length < 1)
      {
        canDo = false;
      }
    }

    if(this.set.length < 10)
    {
      return false;
    }

    if(canDo)
    {
      for(let i in this.slots)
      {
        let c = this.set.pop();
        c.hidden = false;
        this.slots[i].push(c);
      }
      this.updateHist('handout', true);
      this.updateG();
      return true;
    }
    else
    {
      return false;
    }
  }

  private canPlace(c: c, target: c): boolean
  {
    let index = this.pack.indexOf(c.c);
    return this.pack[index + 1] !== undefined && this.pack[index + 1] === target.c;
  }

  private shuffle(array: any[]): any[]
  {
    let currentIndex = array.length,  randomIndex;
    while (currentIndex != 0)
    {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;

      [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }

    return array;
  }
}

export default Soli;
module.exports.default = Soli;
