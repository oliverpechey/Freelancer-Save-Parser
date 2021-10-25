// Imports
import ini from '@nodecraft/ini';
import fs from 'fs';
import path from 'path';

/*
Internal Function - Decodes the name string in the .fl files.
Returns: String containing the name in the UTF-16 format.
*/
String.prototype.hexDecode = function () {
    // Filter out line breaks
    let hexes = this.match(/.{1,4}/g) || [];
    // For each character, convert from hex back into decimal and get the char code in UTF-16
    let name = '';
    for (let i = 0; i < hexes.length; i++) {
        name += String.fromCharCode(parseInt(hexes[i], 16));
    }
    return name;
}

/*
Internal Function - Used to grab all .fl files in a directory recursively.
Returns: Array containing the file paths of all .fl files in the directory.
Params: Directory - The directory that you wish to search for .fl files in.
*/
const TraverseDirectory = (Directory) => {
    let PlayerFilePaths = [];
    fs.readdirSync(Directory).forEach(file => {
        let fullPath = path.join(Directory, file);
        if (fs.lstatSync(fullPath).isDirectory()) {
            PlayerFilePaths.push(...TraverseDirectory(fullPath));
        } else if (fullPath.slice(-2) == 'fl') {
            PlayerFilePaths.push(fullPath);
        }
    });
    return PlayerFilePaths;
}

/* 
Internal Function - Compares two player's ranks for use in SortPlayerFiles()
Params: Two player objects
*/
const CompareRank = (a, b) => {
    return parseInt(a.rank) - parseInt(b.rank);
}

/* 
Internal Function - Compares two player's ranks for use in SortPlayerFiles()
Params: Two player objects
*/
const CompareName = (a, b) => {
    return a.name.localeCompare(b.name);
}

/* 
Internal Function - Compares two player's ranks for use in SortPlayerFiles()
Params: Two player objects
*/
const CompareLastSeen = (a, b) => {
    return a.lastseen - b.lastseen;
}

class Parser {
    // An array to store all the parsed player objects in
    players = [];

    /*
    Sorts the player files according to the specified field.
    Params: 
        Sort (string) - Name, Rank, LastSeen - Sort by one of these fields
        Direction (string - optional) - Desc - Add this to sort in descending order
    */
    SortPlayerFiles(Sort, Direction) {
        switch (Sort) {
            case 'Name':
                this.players = this.players.sort(CompareName);
                break;
            case 'Rank':
                this.players = this.players.sort(CompareRank);
                break;
            case 'LastSeen':
                this.players = this.players.sort(CompareLastSeen);
                break;
        }
        if (Direction == 'Desc')
            this.players = this.players.reverse();
        return this;
    }

    /* 
    Main function that parses the player files
    Params:
        SaveLocation (string) - The location of the player files
        Range (integer, optional) - Amount of days. To be used with next parameter. 
            e.g. Setting Range to 7 and RangeType to 'LastSeen' will filter the results to show only the players who have been seen in the last 7 days.
        RangeType (string) - LastSeen, Created - Which field to use in the range
    */
    ParsePlayerFiles(SaveLocation, Range, RangeType = 'LastSeen') {
        this.players = [];
        let playerFiles = TraverseDirectory(SaveLocation);

        for (const pf of playerFiles) {
            let config = ini.parse(fs.readFileSync(pf, 'utf8'), { inlineArrays: true });

            if (Object.keys(config).length != 0) {
                let p = {};
                p.lastseen = fs.statSync(pf).mtime;
                p.created = fs.statSync(pf).birthtime;

                if (typeof Range !== 'undefined') {
                    let DateAfter = new Date(Date.now() - Range * 24 * 60 * 60 * 1000);
                    if (RangeType == 'LastSeen' && p.lastseen < DateAfter)
                        continue;
                    else if (RangeType == 'Created' && p.created < DateAfter)
                        continue;
                }

                p.name = config.Player.name.hexDecode();
                p.system = config.Player.system;
                p.rank = parseInt(config.Player.rank);
                p.pvpkills = parseInt(config.Player.num_kills);
                p.money = parseInt(config.Player.money);
                p.shiparch = config.Player.ship_archetype;
                p.base = config.Player.base ? config.Player.base : 'In Space';
                p.faction = config.Player.rep_group ? config.Player.rep_group : 'Freelancer';

                if (config.mPlayer) {
                    p.timePlayed = config.mPlayer.total_time_played ? config.mPlayer.total_time_played : 0;
                    p.basesVisited = config.mPlayer.base_visited ? Array.isArray(config.mPlayer.base_visited) ? config.mPlayer.base_visited.length : 1 : 0;
                    p.systemsVisited = config.mPlayer.sys_visited ? Array.isArray(config.mPlayer.sys_visited) ? config.mPlayer.sys_visited.length : 1 : 0;
                    p.holesVisited = config.mPlayer.holes_visited ? Array.isArray(config.mPlayer.holes_visited) ? config.mPlayer.holes_visited.length : 1 : 0;

                    p.missions = 0;
                    if (config.mPlayer.rm_completed) {
                        if (Array.isArray(config.mPlayer.rm_completed)) {
                            for (const m of config.mPlayer.rm_completed)
                                p.missions += parseInt(m.split(',')[1]);
                        }
                        else
                            p.missions = parseInt(config.mPlayer.rm_completed.split(',')[1]);
                    }

                    p.kills = 0;
                    if (config.mPlayer.ship_type_killed) {
                        if (Array.isArray(config.mPlayer.ship_type_killed)) {
                            for (const k of config.mPlayer.ship_type_killed)
                                p.kills += parseInt(k.split(',')[1]);
                        }
                        else
                            p.kills = parseInt(config.mPlayer.ship_type_killed.split(',')[1]);
                    }
                }
                this.players.push(p);
            }
        }
        return this;
    }
};

export default { Parser }
