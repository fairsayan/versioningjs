# versioningjs
library to manage data versioning on nodeJS and browsers

## Usage
var versioning = require('versioningjs'); // only for nodeJS, not required on browsers

// data must be stringifyable (JSON.stringify applied)
var data = {
  title: 'Lord Of The Rings',
  characters: ['Frodo', 'Gandalf', 'Aragorn']
};

### store history inside the data
```javascript
versioning.push(data);

console.info(data);
/*
{
  title:'Lord Of The Rings',
  characters:[
    'Frodo',
    'Gandalf',
    'Aragorn'
  ],
  versioning:{
    history:[
      {
        action:'created',
        date: Tue Oct 04 2016 23:02:01 GMT+0200 (CEST)
      }
    ],
    strLast:'{"title":"Lord Of The Rings","characters":["Frodo","Gandalf","Aragorn"]}'
  }
}
*/

data.characters.push('Legolas');
versioning.push(data);
console.info(data);
/*
{
  title:'Lord Of The Rings',
  characters:[
    'Frodo',
    'Gandalf',
    'Aragorn',
    'Legolas'
  ],
  versioning:{
    history:[
      {
        action:'created',
        date: Tue Oct 04 2016 23:02:01 GMT+0200 (CEST)
      },
      {
        action:'updated',
        date: Tue Oct 04 2016 23:02:01 GMT+0200 (CEST),
        diff:[
          {
            start:70,
            size:12,
            substitution:']}'
          }
        ]
      }
    ],
    strLast:'{"title":"Lord Of The Rings","characters":["Frodo","Gandalf","Aragorn","Legolas"]}'
  }
}
*/

data = versioning.rollback(data);
console.info(data);
/*
{
  title:'Lord Of The Rings',
  characters:[
    'Frodo',
    'Gandalf',
    'Aragorn'
  ],
  versioning:{
    history:[
      {
        action:'created',
        date: Tue Oct 04 2016 23:02:01 GMT+0200 (CEST)
      },
      {
        action:'updated',
        date: Tue Oct 04 2016 23:02:01 GMT+0200 (CEST),
        diff:[
          {
            start:70,
            size:12,
            substitution:']}'
          }
        ]
      },
      {
        action:'rollback',
        date: Tue Oct 04 2016 23:02:02 GMT+0200 (CEST),
        diff:[
          {
            start:70,
            size:2,
            substitution:',"Legolas"]}'
          }
        ]
      }
    ],
    strLast:'{"title":"Lord Of The Rings","characters":["Frodo","Gandalf","Aragorn"]}'
  }
}
*/
```
