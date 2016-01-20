var InputHandler = function() {
  for (var i = 0; i < 1024; i++){
    this.keyState[i] = false;
  }


  window.addEventListener( 'mousemove', InputHandler.onMouseMove, false);
  window.addEventListener( 'keydown', InputHandler.onKeyDown, false);
  window.addEventListener( 'keyup', InputHandler.onKeyUp, false);
};

  //var keyState = [1024];
	var mouseX = 0;
	var mouseY = 0;


  InputHandler.prototype.onMouseMove = function(event) {
		mouseX = event.clientX;
		mouseY = event.clientY;
	};

	InputHandler.prototype.onKeyDown = function(event) {
		InputHandler.keyState[event.key] = true;
	};

	InputHandler.prototype.onKeyUp = function(event) {
		InputHandler.keyState[event.key] = false;
	};

  InputHandler.prototype.isKeyPressed = function(key) {
    //console.log(key);
    return InputHandler.keyState[key] === true;
  };
