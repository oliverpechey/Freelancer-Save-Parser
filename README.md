# Freelancer-Save-Parser
A package to parse Freelancer Multiplayer saves so they can be used in a node.js application.

## Usage

Use npm to install:

`npm i freelancer-save-parser`

Then in your project:

````javascript
import playerParser from 'freelancer-save-parser';

let players = playerParser.loadPlayerFiles('C:\\Users\\Raikkonen\\Documents\\My Games\\Freelancer\\Accts\\MultiPlayer');
````

The variable will then contain an array of players like below:

````javascript
[
  {
    name: 'NewPlayerRaikko',
    system: 'Li01',
    rank: 1,
    lastseen: 2021-10-16T19:18:40.109Z,
    pvpkills: 0,
    money: 2000,
    shiparch: '2151746432',
    base: 'In Space',
    faction: 'li_n_grp',
    mission: 0,
    kills: 0,
    timePlayed: '38.000000',
    basesVisited: 1,
    systemsVisited: 1,
    holesVisited: 0
  },
  {
    name: 'AnotherNewPlayer',
    system: 'Li01',
    rank: 1,
    lastseen: 2021-10-16T20:31:38.974Z,
    pvpkills: 0,
    money: 2000,
    shiparch: '2151746432',
    base: 'In Space',
    faction: 'li_n_grp',
    mission: 0,
    kills: 0,
    timePlayed: '4926.000000',
    basesVisited: 1,
    systemsVisited: 1,
    holesVisited: 0
  }
]
````
