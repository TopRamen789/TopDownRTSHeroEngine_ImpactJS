/* global ig, EntityBlob, EntityMaster, EntityFireball */
ig.module(
	'game.entities.units.basicunit'
)
.requires(
	'impact.entity'
)
.defines(function(){
	BasicUnit = ig.Entity.extend({
		size: {x: 1, y: 1},

		type: ig.Entity.TYPE.NONE,
		checkAgainst: ig.Entity.TYPE.NONE,
		collides: ig.Entity.COLLIDES.NEVER,
		
		isSelected: false,

		map: null,
		start: {
			f: 0,
			g: 0,
			h: 0,
			x: this.pos.x,
			y: this.pos.y
		},
		goal: null,
		openList: [],
		closedList: [],
		currentNode: null,

		sfsxWhat: null,

		init: function(x, y, settings) {
			this.parent(x, y, settings);
		},
		update: function() {
			if(this.goal != null)
				this.pathfind();
			if(this.pos.x === this.goal.x && this.pos.y === this.goal.y)\
				this.goal = null;
			this.parent();
		},
		draw: function() {
			this.parent();
			if(this.isSelected) {
				ig.system.context.strokeStyle = "#0f0";
				ig.system.context.lineWidth = 1.0;
				ig.system.context.strokeRect(
					ig.system.getDrawPos(this.pos.x - ig.game.screen.x) - 0.5,
					ig.system.getDrawPos(this.pos.y - ig.game.screen.y) - 0.5,
					this.size.x * ig.system.scale,
					this.size.y * ig.system.scale
				);
			}
		},
		select: function() {
			if(!this.isSelected) {
				this.isSelected = true;
				if(this.sfsxWhat != null)
					this.sfsxWhat.play();
			}
		},
		deselect: function() {
			this.isSelected = false;
		},
		moveCommand: function(mouseCoordinates) {
			this.goal = {
				f: 0,
				g: 0,
				h: 0,
				x: mouseCoordinates.x,
				y: mouseCoordinates.y
			};
		},
		pathfind: function() {
			// let's just work on getting aStar up and running for now on one entity.

			// build map
			this.map = this.buildPathingMap();
			
			// Ok, we've got the map, we'll need to create a wrapper around it for aStar so I can add other values like f,g,h
			// and maybe some other values like whether or not the block is occupied.
			while(this.openList.length > 0) {

				// get node with current shortest path.
				this.currentNode = this.getNodeWithCurrentShortestPath();

				// check to see if we arrived at the goal.
				let results = this.checkGoal();
				if(results != null)
					return results;

				// mark current node as checked
				this.markNodeAsChecked();

				// find best path in neighbors.
				this.findBestPathInNeighbors();
			}
			return [];
		},
		buildPathingMap: function() {
			// ig.game.collisionMap is a good start, but I need to account for other entities as well.
			// so, perhaps I get the collision map and fill the data with spaces that entities are currently occupying
			// then also fill the data with where entities will be when they've hit their final destination.
			// hmm.. this seems tricky.

			let collisionMap = ig.game.collisionMap;
			return {};
		},
		getNodeWithCurrentShortestPath: function() {
			let lowestIndex = 0;
			for(let i = 0; i < this.openList.length; i++) {
				if(this.openList[i].f < this.openList[lowestIndex].f) {
					lowestIndex = i;
				}
			}

			return this.openList[lowestIndex];
		},
		checkGoal: function() {
			if(this.currentNode.x === this.goal.x && this.currentNode.y === this.goal.y) {
				let result = [];
				while(this.currentNode.parent) {
					results.push(this.currentNode);
					this.currentNode = this.currentNode.parent;
				}
				return results;
			}
		},
		markNodeAsChecked: function() {
			let valueToRemove = this.openList.indexOf(this.currentNode);
			this.openList.splice(valueToRemove, 1); // er, don't I need to assign this.openList to this for the change to take effect?
			this.closedList.push(this.currentNode);
		},
		findBestPathInNeighbors: function() {
			let neighbors = this.findNeighbors();
			for(let i = 0; i < neighbors.length; i++) {
				let neighbor = neighbors[i];
				if(this.closedList.indexOf(neighbor) > -1) // || neighbor.blocked
					continue;

				let gScore = this.currentNode.g + 1;
				// or higher based on other conditions we set, if we're moving up a ramp or we're moving through a swamp or something.
				let gScoreIsBest = false;

				if(this.openList.indexOf(neighbor) < 0) {
					gScoreIsBest = true;
					neighbor.h = this.calculateHeuristic(neighbor, this.goal);
					this.openList.push(neighbor);
				} else if (gScore < neighbor.g) {
					gScoreIsBest = true;
				}

				if(gScoreIsBest) {
					neighbor.parent = this.currentNode;
					neighbor.g = gScore;
					neighbor.f = neighbor.g + neighbor.h;
				}
			}
		},
		findNeighbors: function() {
			let result = [];
			let x = this.currentNode.x;
			let y = this.currentNode.y;

			if(this.map[x-1] && this.map[x-1][y]) {
				result.push(this.map[x-1][y]);
			}
			if(this.map[x+1] && this.map[x+1][y]) {
				result.push(this.map[x+1][y]);
			}
			if(this.map[x][y-1]) {
				result.push(this.map[x][y-1]);
			}
			if(this.map[x][y+1]) {
				result.push(this.map[x][y+1]);
			}

			return result;
		},
		calculateHeuristic: function(a, b) {
			return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
		}
	});
});