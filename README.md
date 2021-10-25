# Freelancer-Save-Parser
A package to parse Freelancer Multiplayer saves so they can be used in a node.js application.

## Usage

Use npm to install:

`npm i freelancer-save-parser`

Then in your project:

````javascript
import playerParser from 'freelancer-save-parser';

let players = new playerParser.Parser().ParsePlayerFiles('C:\\Users\\Raikkonen\\Documents\\My Games\\Freelancer\\Accts\\MultiPlayer');
````

## Filter by Created / Last Seen

You can also filter by either when the player was last seen (Date Modified) or when the character was created.

The below example will return characters who have been online in the last 7 days:

````javascript
let players = new playerParser.Parser().ParsePlayerFiles('C:\\Users\\Raikkonen\\Documents\\My Games\\Freelancer\\Accts\\MultiPlayer', 7, 'LastSeen');
````

The below example will return characters who have been created in the last 365 days: 

````javascript
let players = new playerParser.Parser().ParsePlayerFiles('C:\\Users\\Raikkonen\\Documents\\My Games\\Freelancer\\Accts\\MultiPlayer', 365, 'Created');
````

## Sorting

You can also sort by **Name**, **Rank** or **LastSeen** in Ascending (default) or Descending order.

**1st Parameter:** Name/Rank/LastSeen  
**2nd Parameter (optional)**: Desc

````javascript
let players = new playerParser.Parser().ParsePlayerFiles('C:\\Users\\Raikkonen\\Documents\\My Games\\Freelancer\\Accts\\MultiPlayer').SortPlayerFiles('LastSeen', 'Desc');
````

## Example of output

````javascript
[
  {
    lastseen: 2021-04-19T00:36:04.000Z,
    created: 2021-04-24T17:08:12.098Z,
    name: 'Test',
    system: 'Hi02',
    rank: 58,
    pvpkills: 107,
    money: 25610020,
    shiparch: '2702011459',
    base: 'In Space',
    faction: 'Freelancer',
    timePlayed: '127664.000000',
    basesVisited: 7,
    systemsVisited: 20,
    holesVisited: 26,
    missions: 28,
    kills: 457
  },
  {
    lastseen: 2021-10-25T11:34:36.184Z,
    created: 2021-04-24T17:08:12.021Z,
    name: 'Test2',
    system: 'Hi02',
    rank: 44,
    pvpkills: 0,
    money: 7088743,
    shiparch: '2702011459',
    base: 'Hi02_01_Base',
    faction: 'fc_c_grp',
    timePlayed: '10156.000000',
    basesVisited: 6,
    systemsVisited: 10,
    holesVisited: 12,
    missions: 3,
    kills: 283
  } 
]
````
