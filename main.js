// Imports
import ini from '@nodecraft/ini';
import fs from 'fs';
import path from 'path';

// Decodes the name string in the .fl files
String.prototype.hexDecode = function () {
    let hexes = this.match(/.{1,4}/g) || [];
    let back = "";
    for (let i = 0; i < hexes.length; i++) {
        back += String.fromCharCode(parseInt(hexes[i], 16));
    }
    return back;
}

// Used to grab all .fl files in a directory recursively
const traverseDir = (dir) => {
    let playerFiles = [];
    fs.readdirSync(dir).forEach(file => {
        let fullPath = path.join(dir, file);
        if (fs.lstatSync(fullPath).isDirectory()) {
            playerFiles.push(...traverseDir(fullPath));
        } else if (fullPath.slice(-2) == 'fl') {
            playerFiles.push(fullPath);
        }
    });
    return playerFiles;
}

// Load player stats into a map
const loadPlayerFiles = (SaveLocation) => {
    let players = [];
    let playerFiles = traverseDir(SaveLocation);
    for (const pf of playerFiles) {
        let config = ini.parse(fs.readFileSync(pf, 'utf8'), { inlineArrays: true });
        if (Object.keys(config).length != 0) {
            let p = {};
            p.name = config.Player.name.hexDecode();
            p.system = config.Player.system;
            p.rank = parseInt(config.Player.rank);
            p.lastseen = fs.statSync(pf).mtime;
            p.pvpkills = parseInt(config.Player.num_kills);
            p.money = parseInt(config.Player.money);
            p.shiparch = config.Player.ship_archetype;

            if (!config.Player.base)
                p.base = 'In Space';
            else
                p.base = config.Player.base;

            if (!config.Player.rep_group)
                p.faction = "Freelancer";
            else
                p.faction = config.Player.rep_group;

            if (config.mPlayer) {

                if (config.mPlayer.rm_completed) {
                    if (Array.isArray(config.mPlayer.rm_completed)) {
                        for (m of config.mPlayer.rm_completed)
                            p.missions += parseInt(m.split(',')[1]);
                    }
                    else
                        p.missions = parseInt(config.mPlayer.rm_completed.split(',')[1]);
                }
                else p.mission = 0;

                if (config.mPlayer.ship_type_killed) {
                    if (Array.isArray(config.mPlayer.ship_type_killed)) {
                        for (const k of config.mPlayer.ship_type_killed)
                            p.kills += parseInt(k.split(',')[1]);
                    }
                    else
                        p.kills = parseInt(config.mPlayer.ship_type_killed.split(',')[1]);
                }
                else p.kills = 0;

                p.timePlayed = config.mPlayer.total_time_played ? config.mPlayer.total_time_played : 0;
                p.basesVisited = config.mPlayer.base_visited ? Array.isArray(config.mPlayer.base_visited) ? config.mPlayer.base_visited.length : 1 : 0;
                p.systemsVisited = config.mPlayer.sys_visited ? Array.isArray(config.mPlayer.sys_visited) ? config.mPlayer.sys_visited.length : 1 : 0;
                p.holesVisited = config.mPlayer.holes_visited ? Array.isArray(config.mPlayer.holes_visited) ? config.mPlayer.holes_visited.length : 1 : 0;
            }
            players.push(p);
        }
    }
    return players;
}

export default { loadPlayerFiles }
