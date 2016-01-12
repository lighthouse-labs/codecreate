var settings = {
  // This is how rapidly YOUR ship can fire. A lower number means more bullets!
  fire_speed: 40,

  //This is how rapidly the enemies fire. Lower number means more bullets!
  enemy_fire_speed: function () {
	
		return 2000;

		// If you want your game to pick a random speed for aliens to fire, remove 
		// the two slashes (//) on the line below and put them on the line above, at the beginning of the line.	

		 //return Math.random() * 200;
  },

  //This shows the lanterns in the background of the game
  show_lights: false,

  //How fast the ship goes. Higher numbers here mean higher speeds. 
  //Be careful! (Default: 200)
  ship_speed: 200,

  // This is how fast your bullets go (default: 400)
  bullet_speed: 400,

  // size of your spaceship
  spaceship_width: 30,
  spaceship_height: 30,
  
  // size of your enemy
  enemy_width: 30,
  enemy_height: 30,

	//These are the positions of the enemies. They are coordinates in the format [x, y], where the 0,0 is the top left corner, and the y axis descends from the top of the screen.
	//It is possible to add more enemies. Look at where the enemies are currently placed, and add more coordinate pairs.
	positions: [[185, 170], [350, 170], [185, 275], [260, 400], [550, 180], [750, 475], [950, 235], [1150, 80], [1175, 375], [1175, 475], [1370, 250], [1375, 425], [1500, 95]],
};
