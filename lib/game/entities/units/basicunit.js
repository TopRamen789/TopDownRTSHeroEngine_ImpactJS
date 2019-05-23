/* global ig, BasicUnit, EntityBlob, EntityMaster, EntityFireball */
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
		start: null,
		goal: null,
		openList: [],
		closedList: [],
		currentNode: null,
		path: [],

		speed: 0,

		sfsxWhat: null,
		relativePosition: null,

		init: function(x, y, settings) {
			this.parent(x, y, settings);
			this.start = {
				f: 0,
				g: 0,
				h: 0,
				parent: null,
				x: Math.floor(this.pos.x/ig.game.collisionMap.tilesize),
				y: Math.floor(this.pos.y/ig.game.collisionMap.tilesize)
			};
		},
		update: function() {
			this.relativePosition = {
				x: Math.floor(this.pos.x/ig.game.collisionMap.tilesize),
				y: Math.floor(this.pos.y/ig.game.collisionMap.tilesize)
			};
			this.start = {
				f: 0,
				g: 0,
				h: 0,
				parent: null,
				x: this.relativePosition.x,
				y: this.relativePosition.y
			};
			if(this.goal != null) {
				this.path = this.pathfind();
				if(this.pos.x === this.goal.x && this.pos.y === this.goal.y)
					this.goal = null;
			}
			this.travelPath();
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
				parent: null,
				x: Math.floor(mouseCoordinates.x/ig.game.collisionMap.tilesize),
				y: Math.floor(mouseCoordinates.y/ig.game.collisionMap.tilesize)
			};
		},
		travelPath() {
			let len = this.path.length - 1;

			//Check path
			if(len == -1) {
				return;
			}

			//get X Velocity
			if(this.path[len].x > this.relativePosition.x) {
				this.vel.x = (this.speed);
			}
			if(this.path[len].x < this.relativePosition.x) {
				this.vel.x = -(this.speed);
			}
			if(this.path[len].x == this.relativePosition.x) {
				this.vel.x = 0;
			}

			//get Y vel
			if(this.path[len].y > this.relativePosition.y) {
				this.vel.y = (this.speed);
			}
			if(this.path[len].y < this.relativePosition.y) {
				this.vel.y = -(this.speed);
			}

			// this needs fixing, the Y speed never stops, so, the path[len].y never == this.relativePosition.y
			if(this.path[len].y == this.relativePosition.y) {
				this.vel.y = 0;
			}

			if(this.relativePosition.x == this.path[len].x &&
				this.relativePosition.y == this.path[len].y) {
				this.path.splice(len, 1);
			}
		},
		pathfind: function() {
			// let's just work on getting aStar up and running for now on one entity.

			// build map
			this.map = this.buildPathingMap();
			this.openList.push(this.start);
			
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

			// in SuperPowers looks like I was starting to do what I mentioned above, I got all of the 2d bodies
			// and marked spots as blocked if a square was occupied by a 2d body.

			let collisionMap = ig.game.collisionMap;
			let grid = [];

			// Ok, we want to use the tileSize of the collision map and split up the grid into that
			// then we also want to apply a mod operation to the x and y coordinates of each object we're using.
			for(let val = 0; val < collisionMap.data.length; val++) {
				grid[val] = [];
				for(let subVal = 0; subVal < collisionMap.data[val].length; subVal++) {
					grid[val][subVal] = {};
					grid[val][subVal].f = 0;
					grid[val][subVal].g = 0;
					grid[val][subVal].h = 0;
					grid[val][subVal].x = subVal;
					grid[val][subVal].y = val;
					grid[val][subVal].parent = null;
				}
			}

			return grid;
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
				let results = [];
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

			// Ok, impact's collision map is full of 0's and 1's.
			// where 1 is NOT traversible and 0 IS.
			// either, on the initialization of the collision map, I need to NOT each 1 and 0
			// so that this method works
			// or make this method figure out each 1 and 0 on it's own.
			if(this.map[y-1] && this.map[y-1][x]) {
				result.push(this.map[y-1][x]);
			}
			if(this.map[y+1] && this.map[y+1][x]) {
				result.push(this.map[y+1][x]);
			}
			if(this.map[y][x-1]) {
				result.push(this.map[y][x-1]);
			}
			if(this.map[y][x+1]) {
				result.push(this.map[y][x+1]);
			}

			return result;
		},
		calculateHeuristic: function(a, b) {
			return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
		}
	});
});