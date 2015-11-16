var harvester = require('harvester');
var builder = require('builder');
var upgrader = require('upgrader');
var guard = require('guard');
var actions = require('actions');

Energy.prototype.findClosestCarrier = function() {
    return this.pos.findClosestByRange(FIND_MY_CREEPS, { filter: function(i) {
        return (i.getActiveBodyparts(CARRY) > 0) && (i.energy < i.carryCapacity);
    }});
};



function creepSpawningMode(creepRole) {
    console.log("need a " + creepRole);
	actions.setStrategy('energyAccumulation');
    var last = Math.ceil(Math.random()*1000);
    if (Game.spawns.Spawn1.room.energyCapacityAvailable < 550) {
    	if (creepRole == 'harvester') {
    	    Game.spawns.Spawn1.createCreep([WORK, MOVE, CARRY], creepRole + last, {role: creepRole});
    	}
    	if (creepRole == 'builder') {
    	    var r = Game.spawns.Spawn1.createCreep([WORK, MOVE, CARRY], creepRole + last, {role: creepRole});
    	}
    	if (creepRole == 'upgrader') {
    	    Game.spawns.Spawn1.createCreep([WORK, MOVE, CARRY], creepRole + last, {role: creepRole});
    	}
    	if (creepRole == 'guard') {
    	    Game.spawns.Spawn1.createCreep([ATTACK, MOVE, TOUGH], creepRole + last, {role: creepRole});
    	}
    } else
    if (Game.spawns.Spawn1.room.energyCapacityAvailable == 550) {
    	if (creepRole == 'harvester') {
    	    Game.spawns.Spawn1.createCreep([WORK, WORK, WORK, MOVE, MOVE, CARRY, CARRY, CARRY], creepRole + last, {role: creepRole});
    	}
    	if (creepRole == 'builder') {
    	    Game.spawns.Spawn1.createCreep([WORK, WORK, WORK, MOVE, CARRY, CARRY, CARRY, CARRY], creepRole + last, {role: creepRole});
    	}
    	if (creepRole == 'upgrader') {
    	    Game.spawns.Spawn1.createCreep([WORK, WORK, WORK, MOVE, MOVE, CARRY, CARRY, CARRY], creepRole + last, {role: creepRole});
    	}
    	if (creepRole == 'guard') {
    	    Game.spawns.Spawn1.createCreep([ATTACK, ATTACK, ATTACK, ATTACK, MOVE, MOVE, MOVE, MOVE, TOUGH, TOUGH, TOUGH], creepRole + last, {role: creepRole});
    	}
    } else
    if (Game.spawns.Spawn1.room.energyCapacityAvailable > 550) {
    	if (creepRole == 'harvester') {
    	    Game.spawns.Spawn1.createCreep([WORK, WORK, WORK, MOVE, MOVE, CARRY, CARRY, CARRY], creepRole + last, {role: creepRole});
    	}
    	if (creepRole == 'builder') {
    	    Game.spawns.Spawn1.createCreep([WORK, WORK, WORK, MOVE, CARRY, CARRY, CARRY, CARRY], creepRole + last, {role: creepRole});
    	}
    	if (creepRole == 'upgrader') {
    	    Game.spawns.Spawn1.createCreep([WORK, WORK, WORK, WORK, WORK, MOVE, MOVE, CARRY, CARRY, CARRY], creepRole + last, {role: creepRole});
    	}
    	if (creepRole == 'guard') {
    	    Game.spawns.Spawn1.createCreep([ATTACK, ATTACK, ATTACK, ATTACK, MOVE, MOVE, MOVE, MOVE, TOUGH, TOUGH, TOUGH], creepRole + last, {role: creepRole});
    	}
    }
}

function normalMode() {
	actions.setStrategy('normal');
}

function swithBackFromSpawningIfCan() {
    var allCreated = true;
    for (var key in actions.creepCount) {
        if (actions.creepCount[key] > actions.getCreepsCount(key)) {
            allCreated = false;
            creepSpawningMode(key);
            break;
        }
    }
    if (allCreated) {
        normalMode();
    }
}


function swithSpawning() {
    var globalCount = 0;
    var globalCountExpected = 0;
    var log = '';
    for (var key in actions.creepCount) {
        globalCountExpected += actions.creepCount[key];
        globalCount += actions.getCreepsCount(key);
        log += key + ' creep loss ' + (actions.getCreepsCount(key) / actions.creepCount[key]) + '\n';
        if (key == 'harvester' && actions.getCreepsCount(key) / actions.creepCount[key] <= 0.8) {
            console.log(key, 'creep loss ', actions.getCreepsCount(key) / actions.creepCount[key]);
            actions.setStrategy('energyAccumulation');
        } else if (actions.getCreepsCount(key) / actions.creepCount[key] <= 0.5) {
            console.log(key, 'creep loss ', actions.getCreepsCount(key) / actions.creepCount[key]);
            actions.setStrategy('energyAccumulation');
        }
    }
    log += 'Have ' + globalCount + ' creeps while needed ' + globalCountExpected +
           ' loss ' + (globalCount / globalCountExpected);
    // console.log(log);
    if (globalCount / globalCountExpected < 0.5) {
        actions.setStrategy('energyAccumulation');
    }
}

module.exports.loop = function () {
    if (actions.getStrategy() == 'normal') {
        swithSpawning();
    } else
    if (actions.getStrategy() == 'energyAccumulation') {
        swithBackFromSpawningIfCan();
    }

	for(var name in Game.creeps) {
		var creep = Game.creeps[name];

		if(creep.memory.role == 'harvester') {
			harvester(creep);
		}

		if(creep.memory.role == 'builder') {
		    builder(creep);
		}

		if(creep.memory.role == 'upgrader') {
		    upgrader(creep);
		}

		if(creep.memory.role == 'guard') {
		    guard(creep);
		}
	}
	
	actions.findInSafeRooms(FIND_DROPPED_ENERGY).forEach(function(energy) {
        var creep = energy.findClosestCarrier();
        if (creep) creep.moveTo(energy);
    });
}
