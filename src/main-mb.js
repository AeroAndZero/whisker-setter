let currentWhisker = 1; //Image no. of current whisker
let whiskers = []; //Stroke every whisker image
let openFileButton = document.getElementById("openFileBtn"); //Gets the Open file button
let currentImage; //Stores Currently opened image
let refreshCanvasSize = true; //For refreshing canvas
let brushStrokes = []; //Storing total stroke
let tempStroke = []; //Storing current stroke
let undoStack = []; //Stack for doing undo
// 0 for mouse Point, 1 for brush stroke

//Open file
function openFile(){
	openFileButton.click();
}

openFileButton.addEventListener("change", async function() {
	loadImage(this.files[0].path, img => {
		currentImage = img;
		resizeCanvas(currentImage.width,currentImage.height);
		background(0);
		brushStrokes = [];
		tempStroke = [];
		image(currentImage,0,0);
	})
});

function setWhisker(whiskerNumber){
	currentWhisker = whiskerNumber;
	document.getElementsByClassName('CurrentWhisker')[0].innerHTML = "Current Whisker : " + currentWhisker;
}

//Loading images
function setup(){
	p5canvas = createCanvas(720,400);
	background(0);

	for(var i = 1; i <= 21; i++){
		let StringName = "";
		if(i < 10){
			StringName = "0" + i.toString();
		}else{
			StringName = i.toString();
		}
		newWhisker = loadImage(StringName + ".png");
		whiskers.push(newWhisker);
	}
}

//Draw Function p5.js
function draw(){

	fill(255,0,0);
	  
	if(tempStroke.length > 0){
		for (let i = 0; i < tempStroke.length; i++) {
			drawPlusPointer(tempStroke[i][0],tempStroke[i][1]);
		}
	}

	//Bezier curve : bezier(x1, y1, x2, y2, x3, y3, x4, y4)
	noFill();
	stroke(0,255,0);
	for (let i = 0; i < brushStrokes.length; i++) {
		let stroke = brushStrokes[i];
		if(stroke.length % 3 != 1){
			continue;
		}
		for (let j = 0; j < stroke.length - 3; j+=3) {
			bezier(stroke[j][0], stroke[j][1], stroke[j+1][0], stroke[j+1][1], stroke[j+2][0], stroke[j+2][1], stroke[j+3][0], stroke[j+3][1])
		}
		
	}

}

function drawPlusPointer(x,y){
	rect(x-7, y, 15, 1);
	rect(x, y-7, 1, 15);
}

function createStroke(){
	let point = [mouseX,mouseY];
	if(0 < mouseX && mouseX < width && 0 < mouseY && mouseY < height){
		console.log(mouseX,mouseY);
		tempStroke.push(point);
		undoStack.push(0);
	}
}

function spreadStroke(stroke){
	let adder = stroke.length % 3;
	if (adder == 0){adder = 1;}
	let roundNumber = adder + stroke.length;
	let difference = roundNumber - stroke.length;
	
	let newAvgPoints = [];
	for(let i = 0; i < difference;i++){
		let avg = [(stroke[i][0] + stroke[i+1][0]) / 2,(stroke[i][1] + stroke[i+1][1]) / 2];
		newAvgPoints.push(avg);
	}

	let newStroke = [];
	for(let i = 0; i  < stroke.length; i++){
		newStroke.push(stroke[i]);

		if(i < newAvgPoints.length){
			newStroke.push(newAvgPoints[i]);
		}
	}
	
	console.log(stroke);
	console.log(newStroke);
	return newStroke;
}

function saveStroke(){
	if(tempStroke.length > 0){
		//Gotta make stroke's length is % 3 == 1
		//To do that we can do ans = x % 3 then add ans to x
		//Example :
		// 8 % 3 = 2
		// 8 + 2 = 10
		// So that 10 % 3 == 1

		if(tempStroke.length % 3 != 1){
			tempStroke = spreadStroke(tempStroke);
		}
		
		brushStrokes.push(tempStroke);
		tempStroke = [];
		undoStack.push(1);
	}
}

//Refresh canvas function
function refresh(){
	clear();
	background(0);
	if(currentImage != null){
		image(currentImage,0,0);
	}
}

function undo(){
	switch(undoStack[undoStack.length-1]){
		case 0:
			tempStroke.pop();
			undoStack.pop();
			break;
		case 1:
			brushStrokes.pop();
			undoStack.pop();
			while(undoStack[undoStack.length-1] != 1 && undoStack.length > 0){
				undoStack.pop();
			}
			break;
	}
}

//Keyboard Functionality
function keyPressed(){
	if(keyCode == ENTER){
		saveStroke();
		refresh();
	}
	if (keyIsDown(CONTROL) && keyCode == 90){
		undo();
		refresh();
	}
}

//Mouse Press Function
function mousePressed(){
	createStroke();
}
