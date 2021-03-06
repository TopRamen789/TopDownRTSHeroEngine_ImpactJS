/* global ig, BasicStructure, EntityBasicSwing */
ig.module(
	'game.entities.structures.structure'
)
.requires(
	'impact.entity',
	'impact.debug.debug',
	'game.entities.UI.button'
)
.defines(function(){
	BasicStructure = ig.Entity.extend({
		size: {x: 100, y: 100},
		
		type: ig.Entity.TYPE.B,
		checkAgainst: ig.Entity.TYPE.NONE,
		collides: ig.Entity.COLLIDES.FIXED,

		animSheet: new ig.AnimationSheet('media/manaFountain.png', 100, 100),
		buildUnitSheet: new ig.AnimationSheet('media/blob.png', 64, 28),

		buildTime: new ig.Timer(10),
		name: "BasicStructure",

		//health: 5,
		ownedBy: null,
		isSelected: false,

		init: function(x, y, settings) {
			this.parent(x, y, settings);

			//this is how you have to initialize timers if you want multiple timers to work at the same time.
			this.manaCooldownTime = new ig.Timer(2);

			this.addAnim('idle', 1, [0]);
		},
		update: function() {
			if(this.ownedBy) {
				if(this.manaCooldownTime.delta() >= 0) {
					this.ownedBy.giveMana(10);
					this.manaCooldownTime.reset();
				}
			}
			this.parent();
		},
		draw: function() {
			this.parent();
			if(this.isSelected) {
				this.drawSelection();
			}
		},
		drawSelection: function() {
			ig.system.context.strokeStyle = "#0f0";
			ig.system.context.lineWidth = 1.0;
			ig.system.context.strokeRect(
				ig.system.getDrawPos(this.pos.x - ig.game.screen.x) - 0.5,
				ig.system.getDrawPos(this.pos.y - ig.game.screen.y) - 0.5,
				this.size.x * ig.system.scale,
				this.size.y * ig.system.scale
			);
		},
		receieveDamage(amount, from) {
			// this.health -= amount;
			// this entity shouldn't receive damage.
		},
		select: function() {
			this.isSelected = true;
		},
		deselect: function() {
			this.isSelected = false;
		},
		kill: function() {
			this.parent();
		},
	});
});