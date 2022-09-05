import './soli.scss';

type c = {'type': string, 'c': string, 'hidden': boolean};

export default class Soli
{
  private table: HTMLDivElement;

  private pack: string[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
  private type: string[] = ['RD', 'RH', 'BL', 'BD'];
  private sCount: number = 2;
  private set: c[] = [];

  private slots: {[slot: string]: c[]} = {};
  private decks: c[] = [];

  private selected: {slot: number|null, index: number|null} = {slot: null, index: null};

  constructor(types: number = 1, decks: number = 2)
  {
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
  }

  public gameSet(): void
  {
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
    this.table.innerHTML = '';
    for(let i in this.slots)
    {
      let slot = document.createElement('div');
      console.log(this.slots[i].length);
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
            cDiv.innerHTML = '<span>' + c.c + '</span><span>' + c.type + ' •</span>';
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
    let div = document.createElement('div');
    div.id = 'soliG';
    this.table = div;
    this.updateG();
    return div;
  }

  private canMove(slot: number, index: number): boolean
  {
    let count = this.slots[slot].length - index;
    if(count > 0)
    {
      let c = this.slots[slot][index];
      for(let i = 0; i < count; i++)
      {
        if(c.type !== this.slots[slot][index + i].type)
        {
          return false
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
            let cnt = 0;
            for(let x = index-1; x > 0; x--)
            {
              if(this.canPlace(this.slots[i][x+1], this.slots[i][x]))
              {
                cnt++;
              }
            }
            if(cnt === this.pack.length-1)
            {
              for(let x = index; x > index-this.pack.length; x--)
              {
                this.slots[i].pop();
              }
              if(this.slots[i][this.slots[i].length-1].hidden === true)
              {
                this.slots[i][this.slots[i].length-1].hidden = false;
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
