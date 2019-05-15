ig.module(
	'game.entities.ability'
)
.requires(
	'impact.entity'
)
.defines(function(){
	EntityAbility = ig.Entity.extend({
		cooldown: 0,
		castTime: 0
	})
});