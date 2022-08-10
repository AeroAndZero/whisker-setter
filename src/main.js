//Initializing
let p5canvas;
let currentWhisker = 1; //Image no. of current whisker
let whiskers = []; //Stores every whisker image
let currentImage; //Stores Currently opened image
let openFileButton = document.getElementById("openFileBtn"); //Gets the Open file button
let toggleBGButton = document.getElementById("toggleBGButton"); //Gets the toggle Background button
toggleBGButton.style.backgroundColor = "#206a5d";

//Preference
let refreshCanvasSize = true; //For refreshing canvas
let isBgVisible = true;
let exportMode = false;

//Session memory
let brushStrokes = []; //Storing total stroke
let tempStroke = []; //Storing current stroke
let undoStack = []; //Stack for doing undo
// 0 for mouse Point, 1 for brush stroke
let whiskerLineup = [];

//Open file
function openFile(){
	openFileButton.click();
}

//Reset is much needed
function resetSession(){
	brushStrokes = [];
	tempStroke = [];
	whiskerLineup = [];
	undoStack = [];
}

openFileButton.addEventListener("change", async function() {
	loadImage(this.files[0].path, img => {
		currentImage = img;
		resizeCanvas(currentImage.width,currentImage.height);
		background(0);
		resetSession();
		image(currentImage,0,0);
	})
});

function setWhisker(whiskerNumber){
	currentWhisker = whiskerNumber;
	document.getElementsByClassName('CurrentWhisker')[0].innerHTML = "Current Whisker : " + currentWhisker;
}

function drawBezier(stroke){
    if(stroke.length == 4 && !exportMode){
        bezier(stroke[0][0], stroke[0][1], stroke[1][0], stroke[1][1], stroke[2][0], stroke[2][1], stroke[3][0], stroke[3][1])
    }
}

//Preloads Images
function preload(){
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

function bezierEquation(stroke,t){
	// t should be between 0 and 1
	// p1 = [x1,y1]
	let p1 = stroke[0]
	let p2 = stroke[1]
	let p3 = stroke[2]
	let p4 = stroke[3]

	newX = Math.pow((1-t),3) * p1[0] + 3 * Math.pow((1-t),2) * t * p2[0] + 3 * (1-t) * Math.pow(t,2) * p3[0] + Math.pow(t,3) * p4[0];
	newY = Math.pow((1-t),3) * p1[1] + 3 * Math.pow((1-t),2) * t * p2[1] + 3 * (1-t) * Math.pow(t,2) * p3[1] + Math.pow(t,3) * p4[1];
	return [newX,newY];
}

//First Implementation of fitImage
function fitImage(stroke1,stroke2,Image){
	//--------------- Settings
	let fractionIndex = 400;

	//Selecting whisker
	whiskerImage = whiskers[Image-1].get(0,0,whiskers[Image-1].width,whiskers[Image-1].height);

	//This is where all the maths should go.
	for(let j = 0; j < whiskerImage.width; j += whiskerImage.width/fractionIndex){
		let newPoint = bezierEquation(stroke1,j/whiskerImage.width);
		let nextNewPoint = bezierEquation(stroke1,(j + whiskerImage.width/fractionIndex)/whiskerImage.width);

		let yPoint = bezierEquation(stroke2,j/whiskerImage.width);

		//results
		newX = newPoint[0];
		newY = newPoint[1];
		
		let diffWidth = abs(nextNewPoint[0]-newPoint[0]);

		/* Using rotate() from p5.js approach */
		push()
		translate(newX,newY)

		let fullDistance = dist(newX,newY,yPoint[0],yPoint[1]);
			
			//Finding angle
		let angle = Math.atan2(yPoint[0] - newX,yPoint[1] - newY) * -1;
			
			//Finally Rotating
			//p5.js Image syntax : image(img, dx, dy, dWidth, dHeight, sx, sy, [sWidth], [sHeight])
		rotate(angle)
		image(whiskerImage,0,0,diffWidth,fullDistance,j,0,whiskerImage.width/fractionIndex,whiskerImage.height);

		pop()
	}
}

//Second Implementation of fitImage function
function fitImage2(stroke1,stroke2,Image){
	//Selecting whisker
	whiskerImage = whiskers[Image-1].get(0,0,whiskers[Image-1].width,whiskers[Image-1].height);

	//------ Settings
	let avgDistance = dist(Math.min(stroke1[0][0],stroke2[0][0]), Math.min(stroke1[0][1],stroke2[0][1]), Math.max(stroke1[3][0],stroke2[3][0]), Math.max(stroke1[3][1],stroke2[3][1]))
						//(dist(stroke1[0][0],stroke1[0][1],stroke1[3][0],stroke1[3][1]) + 
						//dist(stroke2[0][0],stroke2[0][1],stroke2[3][0],stroke2[3][1])) / 2;
	let bzrDensity = 1/(avgDistance*0.8);
	
	//This function loops according to bzDensity variable
	for(let j = 0; j <= 1; j += bzrDensity){
		let newPoint = bezierEquation(stroke1,j);
		let yPoint = bezierEquation(stroke2,j);

		//Lets get the corresponding Image column. 'j' acts as the percentage here.
		let sX = j * whiskerImage.width;

		/* Using rotate() from p5.js */
		push()
		translate(newPoint[0],newPoint[1])
		let fullDistance = dist(newPoint[0],newPoint[1],yPoint[0],yPoint[1]);
			
			//Finding angle
		let angle = Math.atan2(yPoint[0] - newPoint[0],yPoint[1] - newPoint[1]) * -1;
			
			//Finally Rotating
			//p5.js Image syntax : image(img, dx, dy, dWidth, dHeight, sx, sy, [sWidth], [sHeight])
		rotate(angle)
		image(whiskerImage,0,0,2,fullDistance,sX,0,1,whiskerImage.height);

		pop()
	}
	
}

//Loading images
//--------------------------- Setup Function p5.js
function setup(){
	p5canvas = createCanvas(960,540);
}

//--------------------------- Draw Function p5.js
function draw(){
	
	//Custom function to make a bezier curve
	function renderBezier(stroke){
		if(!exportMode){
			for(let t = 0;t <= 1; t+=0.05){
				let result = bezierEquation(stroke,t);
				newX = result[0];
				newY = result[1];
				circle(newX,newY,1);
			}
		}
	}

    refresh();
	fill(255,0,0);
	
	//temp Stroke making
	if(tempStroke.length > 0 && !exportMode){
		
		for (let i = 0; i < tempStroke.length; i++) {
			circle(tempStroke[i][0],tempStroke[i][1],10);

            //Adjusting tempStroke points
            if(dist(mouseX,mouseY,tempStroke[i][0],tempStroke[i][1]) < 10 && mouseIsPressed){
                tempStroke[i][0] = mouseX;
                tempStroke[i][1] = mouseY;
            }
		}
	}

    noFill();
    stroke(0,255,0);
    //Bezier curve : bezier(x1, y1, x2, y2, x3, y3, x4, y4)
	//Bezier curve equation :
	// newX = (1-t)^3 * x1 + 3(1-t)^2*t*x2 + 3(1-t)*t^2*x3 + t^3*x4

    //Drawing current bezier
    if(tempStroke.length == 4){
        renderBezier(tempStroke);
    }

	for (let i = 0; i < brushStrokes.length; i++){
		let currentStroke = brushStrokes[i];
		if(currentStroke.length == 4){
			if(whiskerLineup[Math.floor(i/2)] != null){
				stroke(255,0,0);
			}else{
				stroke(0,255,0);
			}
			drawBezier(currentStroke);
        }
	}
	stroke(0,255,0);

	if(brushStrokes.length >= 2){
		for (let i = 0; i < brushStrokes.length - 1; i+=2){
			
			if(whiskerLineup[Math.floor(i/2)] != null){
				fitImage2(brushStrokes[i],brushStrokes[i+1],whiskerLineup[Math.floor(i/2)]);
			}else{
				fitImage2(brushStrokes[i],brushStrokes[i+1],currentWhisker);
			}
		}
	}


	//Export Mode
	if(exportMode){
		console.log("Exporting Image...");
		saveCanvas(p5canvas,'myDesign','jpg');
		exportMode = false;
		isBgVisible = true;
	}
}

//Creates a temp stroke
function createStroke(){
	let point = [mouseX,mouseY];
	if(0 < mouseX && mouseX < width && 0 < mouseY && mouseY < height && tempStroke.length < 4){
		console.log(mouseX,mouseY);
		tempStroke.push(point);
		undoStack.push(0);
	}
}

//Saves a stroke
function setStroke(){
	if(tempStroke.length == 4){
		brushStrokes.push(tempStroke);
		tempStroke = [];
		undoStack.push(1);
	}
}

//Saves the current whisker to an array
function saveWhisker(){
	whiskerLineup.push(currentWhisker);
}

function deleteLastWhisker(){
	whiskerLineup.pop();
}

//Refresh canvas function
function refresh(){
	clear();
	background(255);
	if(currentImage != null && isBgVisible){
		image(currentImage,0,0);
	}
}

//Toggling Background
function toggleBG(){
	isBgVisible = !isBgVisible
	if(isBgVisible){
		toggleBGButton.innerHTML = "Hide Background"
		toggleBGButton.style.backgroundColor = "#206a5d";
	}else{
		toggleBGButton.innerHTML = "Show Background"
		toggleBGButton.style.backgroundColor = "#fb3640";
	}
}

//Setting up for exporting
function exportImage(){
	exportMode = true;
	isBgVisible = false;
}

function undo(){
	// 0 == Remove last Point
	// 1 == Remove last entire curve
	switch(undoStack[undoStack.length-1]){
		//Removing Last Point For the Temp Curve
		case 0:
			tempStroke.pop();
			undoStack.pop();
			break;
		
		//Removing the Entire Brush Stroke
		case 1:
			tempStroke = brushStrokes[brushStrokes.length - 1];
			brushStrokes.pop();
			undoStack.pop();
			break;
	}

	//deleting Whisker Lineups
	if(brushStrokes.length / 2 < whiskerLineup.length){
		console.log("Something is wrong I can feel it!!");
		whiskerLineup.pop();
	}
}

//Keyboard Functionality
function keyPressed(){
	if(keyCode == ENTER){
		setStroke();
		refresh();
	}
	if (keyIsDown(CONTROL) && keyCode == 90){
		undo();
		refresh();
	}
	if(keyCode == 72){
		toggleBG();
	}
}

//Mouse Press Function
function mouseReleased(){
	if(!(keyIsDown(SHIFT))){
		createStroke();
	}
}
