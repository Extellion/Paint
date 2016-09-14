function menuSide () {
	"use strict";
	var isDraw = false;
	var canvas = document.getElementById("can");

	document.addEventListener("mousedown", function (){
		isDraw = true;
	});

	document.addEventListener("mouseup", function (){
		isDraw = false;
	});
}

document.addEventListener("DOMContentLoaded", function(){
	menuSide();
});