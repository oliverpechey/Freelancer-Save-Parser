// Imports
import ini from '@nodecraft/ini';
import fs from 'fs';
import path from 'path';
import hash from 'freelancer-hash';
import { fileURLToPath } from 'url';

/**
 * Decodes the name string in the .fl files.
 * @returns {string} containing the name in the UTF-16 format.
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

class Parser {
    /**
     * Constructor for the class. Initializes FLHash for use when parsing the save files.
     * @param {string} installDirectory The DATA directory for Freelancer. Used for FLHash to get names 
     * @param {string} saveDirectory The location of the player files
     */
    constructor(installDirectory, saveDirectory) {
        this.installDirectory = installDirectory;
        this.saveDirectory = saveDirectory;
        this.hash = new hash.FreelancerHash(installDirectory);
        this.infocards = this.infocardCheck();
        this.ships = this.extractInis('DATA\\SHIPS\\shiparch.ini','\r\nnickname = ','\r\nids_name = ');
        this.universe = this.extractInis('DATA\\UNIVERSE\\universe.ini','\r\nnickname = ','\r\nstrid_name = ');
        this.factions = this.extractInis('DATA\\initialworld.ini','\r\nnickname = ','\r\nids_name = ');

        const engines = this.extractInis('DATA\\EQUIPMENT\\engine_equip.ini','\r\nnickname = ','\r\nids_name = ');
        const equipment = this.extractInis('DATA\\EQUIPMENT\\st_equip.ini','\r\nnickname = ','\r\nids_name = ');
        const weapons = this.extractInis('DATA\\EQUIPMENT\\weapon_equip.ini','\r\nnickname = ','\r\nids_name = ');
        const misc = this.extractInis('DATA\\EQUIPMENT\\misc_equip.ini','\r\nnickname = ','\r\nids_name = ');
        this.equipment = new Map([...engines, ...equipment, ...weapons, ...misc]);
        return this.parsePlayerFiles();
    }

    /**
     * Checks to see if the infocards.txt file exists, if not prompts the user to create it.
     * If it exists, it converts that into a map.
     * @returns {Map<string, string>}
     */
    infocardCheck = () => {
        const infocardPath = `${path.dirname(fileURLToPath(import.meta.url))}\\infocards.txt`;
        if(!fs.existsSync(infocardPath)) {
            throw new Error(`${infocardPath} does not exist. Please run ${process.cwd()}\\FLInfocardIE.exe and export infocards.txt to this location.`);
        }
        else {
            const infocards = new Map();
            let line = fs.readFileSync(infocardPath, 'utf-8');
            line = line.split(/\n|\r/g).filter((infocard) => infocard.length);
            for(let i = 0; i < line.length; i+=3) {
                infocards.set(line[i], line[Number(i) + 2]);
            }
            return infocards;
        }
    }

    /**
     * Extracts nicknames and infocard ids from ini files
     * @param {string} directory Path to the ini file, starting from the root install folder
     * @param {string} propertySearch String before the first string we want to extract
     * @param {string} propertySearch2 String before the second string we want to extract
     * @returns {Map<string,string>} Map of internal nicknames and their corresponding infocard
     */
    extractInis = (directory, propertySearch, propertySearch2) => {
        // Read from file and split on [] which neatly splits into chunks
        const entries = fs.readFileSync(`${this.installDirectory}\\${directory}`,'utf8').split(/\[.*\]/g);
        const map = new Map();
        for(const line of entries) {
            // Grab the string position just after the 1st search string
            const propertyPosition = line.indexOf(propertySearch) + propertySearch.length;
            // Check we actually found something
            if(propertyPosition >= propertySearch.length) {
                // Grab thes tring position just after the 2nd search string
                const propertyPosition2 = line.indexOf(propertySearch2) + propertySearch2.length;
                // Grab the 1st property
                const property = line.substring(propertyPosition, line.indexOf('\r\n', propertyPosition));
                // Check the property was found and that we found something for the 2nd serach string
                if(property && propertyPosition2 >= propertySearch2.length) {
                    // Grab the corresponding infocard using the id we found
                    const property2 = this.infocards.get(line.substring(propertyPosition2, line.indexOf('\r\n', propertyPosition2)));
                    // Check we got an infocard, and set the map
                    if(property2) {
                        map.set(property.toLowerCase(), property2);
                    }
                }
            }
        }
        return map; 
    }

    /**
    * Used to grab all .fl files in a directory recursively.
    * @param {string} directory The directory that you wish to search for .fl files in.
    * @returns {string[]} containing the file paths of all .fl files in the directory.
    */
    traverseDirectory = (directory) => {
        let playerFilePaths = [];
        fs.readdirSync(directory).forEach(file => {
            let fullPath = path.join(directory, file);
            if (fs.lstatSync(fullPath).isDirectory()) {
                playerFilePaths.push(...this.traverseDirectory(fullPath));
            } else if (fullPath.slice(-2) == 'fl') {
                playerFilePaths.push(fullPath);
            }
        });
        return playerFilePaths;
    }

    /**
     * Compares two player's ranks for use in sortPlayerFiles()
     * @param {number} a 
     * @param {number} b 
     * @returns {number} Positive or negative decides which one is sorted first
     */
    compareRank = (a, b) => {
        return parseInt(a.rank) - parseInt(b.rank);
    }

    /**
     * Compares two player's namees for use in sortPlayerFiles()
     * @param {string} a 
     * @param {string} b 
     * @returns {number} Positive or negative decides which one is sorted first
     */
    compareName = (a, b) => {
        return a.name.localeCompare(b.name);
    }

    /**
     * Compares two player's last activity for use in sortPlayerFiles()
     * @param {date} a 
     * @param {date} b 
     * @returns {number} Positive or negative decides which one is sorted first
     */
    compareLastSeen = (a, b) => {
        return a.lastseen - b.lastseen;
    }

    /**
     * Sorts the players in the array in the specified order
     * @param {string} sort Name, Rank, LastSeen - Sort by one of these fields
     * @param {string} direction Optional - Desc - Add this to sort in descending order 
     * @returns {object} The Parser object for method chaining
     */
    sort = (sort, direction) => {
        switch (sort) {
            case 'Name':
                this.players = this.players.sort(this.compareName);
                break;
            case 'Rank':
                this.players = this.players.sort(this.compareRank);
                break;
            case 'LastSeen':
                this.players = this.players.sort(this.compareLastSeen);
                break;
        }
        if (direction == 'Desc')
            this.players = this.players.reverse();
        return this;
    }

    /**
     * Filters out players from the array
     * @param {string} range Amount of days. To be used with next parameter. e.g. Setting Range to 7 and RangeType to 'LastSeen' will filter the results to show only the players who have been seen in the last 7 days.
     * @param {string} rangeType LastSeen, Created - Which field to use in the range
     * @returns {object} The Parser object for method chaining
     */
    filter = (range, rangeType) => {
        // Check parameters were entered
        if (!range || !rangeType) {
            return this;
        }
        // If the filter has changed then we need to reparse since we'd be missing elements otherwise
        if(range !== this.lastRange || rangeType !== this.lastRangeType) {
            this.parsePlayerFiles();
        }
        // Set the current range to be our last ran range for the next time filter() runs
        this.lastRange = range;
        this.lastRangeType = rangeType;
        // Iterate in reverse because we're removing from the array as we go
        for(let i = this.players.length = 1; i >= 0; i--) {
            // Apply the range to the current date to get something to filter against
            let dateAfter = new Date(Date.now() - range * 24 * 60 * 60 * 1000);
            if ((rangeType == 'LastSeen' && this.players[i].lastseen < dateAfter) || (rangeType == 'Created' && this.players[i].created < dateAfter)) {
                this.players.splice(i, 1);
            }
        }
        return this;
    }

    /**
     * Parses the player files and puts them into the players array
     * @returns {object} The Parser object for method chaining
     */
    parsePlayerFiles = () => {
        this.players = [];
        let playerFiles = this.traverseDirectory(this.saveDirectory);

        for (const file of playerFiles) {
            let config = ini.parse(fs.readFileSync(file, 'utf8'), { inlineArrays: true });

            if (Object.keys(config).length != 0) {
                let player = {};
                player.lastseen = fs.statSync(file).mtime;
                player.created = fs.statSync(file).birthtime;

                if (config.Player) {
                    player.name = config.Player.name.hexDecode();
                    player.internalSystem = config.Player.system;
                    player.system = config.Player.system ? this.universe.get(config.Player.system.toLowerCase()) : null;
                    player.rank = parseInt(config.Player.rank);
                    player.pvpkills = parseInt(config.Player.num_kills);
                    player.money = parseInt(config.Player.money);
                    player.internalShip = config.Player.ship_archetype ? this.hash.getNickname(Number(config.Player.ship_archetype)) : null;
                    player.ship = player.internalShip ? this.ships.get(player.internalShip.toLowerCase()) : null;
                    player.internalBase = config.Player.base ? config.Player.base : null;
                    player.base = config.Player.base ? this.universe.get(config.Player.base.toLowerCase()): 'In Space';
                    player.internalFaction = config.Player.rep_group ? config.Player.rep_group : null;
                    player.faction = config.Player.rep_group ? this.factions.get(config.Player.rep_group) : 'Freelancer';

                    if (config.mPlayer) {
                        player.timePlayed = config.mPlayer.total_time_played ? config.mPlayer.total_time_played : 0;
                        player.basesVisited = config.mPlayer.base_visited ? Array.isArray(config.mPlayer.base_visited) ? config.mPlayer.base_visited.length : 1 : 0;
                        player.systemsVisited = config.mPlayer.sys_visited ? Array.isArray(config.mPlayer.sys_visited) ? config.mPlayer.sys_visited.length : 1 : 0;
                        player.holesVisited = config.mPlayer.holes_visited ? Array.isArray(config.mPlayer.holes_visited) ? config.mPlayer.holes_visited.length : 1 : 0;

                        player.missions = 0;
                        if (config.mPlayer.rm_completed) {
                            if (Array.isArray(config.mPlayer.rm_completed)) {
                                for (const m of config.mPlayer.rm_completed)
                                    player.missions += parseInt(m.split(',')[1]);
                            }
                            else
                                player.missions = parseInt(config.mPlayer.rm_completed.split(',')[1]);
                        }

                        player.kills = 0;
                        if (config.mPlayer.ship_type_killed) {
                            if (Array.isArray(config.mPlayer.ship_type_killed)) {
                                for (const k of config.mPlayer.ship_type_killed)
                                    player.kills += parseInt(k.split(',')[1]);
                            }
                            else
                                player.kills = parseInt(config.mPlayer.ship_type_killed.split(',')[1]);
                        }

                        if(config.Player.equip) {
                            player.equipment = [];
                            player.lights = [];

                            for(const equipString of config.Player.equip) {
                                const [hash, hardpoint, quantity] = equipString.split(', ');
                                const internalNickname = this.hash.getNickname(Number(hash));

                                if(hardpoint.toLowerCase().includes('light')) {
                                    player.lights.push({[internalNickname] : quantity});
                                }
                                else {
                                    const nickname = this.equipment.get(internalNickname);
                                    if(internalNickname && !internalNickname.includes('contrail')) {
                                        player.equipment.push({[nickname ? nickname : internalNickname] : quantity});
                                    }
                                }
                            }
                        }
                    }
                    this.players.push(player);
                }
            }
        }
        return this;
    }
};

export default { Parser }