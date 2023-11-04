# Freelancer-Save-Parser
A package to parse Freelancer Multiplayer saves so they can be used in a node.js application.

## Usage

Use npm to install:

`npm i freelancer-save-parser`

Then in your project:

````javascript
import playerParser from 'freelancer-save-parser';

let players = new playerParser.Parser('C:\\Freelancer HD Edition','C:\\Users\\Raikkonen\\Documents\\My Games\\Freelancer\\Accts\\MultiPlayer').players;
````

## Filter by Created / Last Seen

You can also filter by either when the player was last seen (Date Modified) or when the character was created.

The below example will return characters who have been online in the last 7 days:

````javascript
let players = new playerParser.Parser('C:\\Freelancer HD Edition','C:\\Users\\Raikkonen\\Documents\\My Games\\Freelancer\\Accts\\MultiPlayer').filter(7, 'LastSeen').players;
````

The below example will return characters who have been created in the last 365 days: 

````javascript
let players = new playerParser.Parser('C:\\Freelancer HD Edition','C:\\Users\\Raikkonen\\Documents\\My Games\\Freelancer\\Accts\\MultiPlayer').filter(365, 'Created').players;
````

## Sorting

You can also sort by **Name**, **Rank** or **LastSeen** in Ascending (default) or Descending order.

**1st Parameter:** Name/Rank/LastSeen  
**2nd Parameter (optional)**: Desc

````javascript
let players = new playerParser.Parser('C:\\Freelancer HD Edition','C:\\Users\\Raikkonen\\Documents\\My Games\\Freelancer\\Accts\\MultiPlayer').sort('LastSeen', 'Desc').players;
````

## Example of output

````javascript
[
  {
    lastseen: "2023-07-19T13:59:16.062Z",
    created: "2023-07-19T14:11:40.125Z",
    name: "Test",
    internalSystem: "Iw04",
    system: "Cortez",
    rank: 16,
    pvpkills: 0,
    money: 118180,
    internalShip: "li_elite",
    ship: "Defender",
    internalBase: "Iw04_01_Base",
    internalFaction: "",
    faction: "Freelancer",
    timePlayed: "2898.000000",
    basesVisited: 7,
    systemsVisited: 20,
    holesVisited: 26,
    missions: 28,
    kills: 457
  },
  {
    lastseen: "2023-02-04T11:25:44.784Z",
    created: "2023-02-04T11:25:44.771Z",
    name: "Test2",
    internalSystem: "Ew01",
    system: "Tau-37",
    rank: 1,
    pvpkills: 0,
    money: 2,
    internalShip: "ge_fighter",
    ship: "Starflier",
    internalBase: "",
    base: "In Space",
    internalFaction: "li_n_grp",
    faction: "Liberty Navy",
    timePlayed: "3743.000000",
    basesVisited: 6,
    systemsVisited: 10,
    holesVisited: 12,
    missions: 3,
    kills: 283
  } 
]
````
