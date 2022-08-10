let currentWhisker = 1; //Image no. of current whisker
let whiskers = []; //Stores every whisker image
let openFileButton = document.getElementById("openFileBtn"); //Gets the Open file button
let currentImage; //Stores Currently opened image
let refreshCanvasSize = true; //For refreshing canvas
let brushStrokes = []; //Storing total stroke
let tempStroke = []; //Storing current stroke
let undoStack = []; //Stack for doing undo
// 0 for mouse Point, 1 for brush stroke

//--------------- Settings
let fractionIndex = 400;

//For testing purpose
let wtf;

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
	wtf = whiskers[currentWhisker-1].get(0,0,whiskers[currentWhisker-1].width,whiskers[currentWhisker-1].height);
	//fractionIndex = whiskers[currentWhisker-1].width;
	document.getElementsByClassName('CurrentWhisker')[0].innerHTML = "Current Whisker : " + currentWhisker;
}

function drawBezier(stroke){
    if(stroke.length == 4){
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

//Gets 't' from x,y position
function bezierEquation_getT(stroke,x){
	//Equation to solve cubic polynomial : https://math.vanderbilt.edu/schectex/courses/cubic/
	// t should be between 0 and 1
	// p1 = [x1,y1]
	let p1 = stroke[0]
	let p2 = stroke[1]
	let p3 = stroke[2]
	let p4 = stroke[3]

	//assuming
	let a = 3*p2[0] - 3*p1[0]
	let b = 3*p1[0] - 6*p2[0] + 3*p3[0]
	let c = 3*p2[0] - p1[0] - 3*p3[0] + p4[0]
	let d = p1[0] - x

	//Assuming for Delta
	let p = -b/(3*a)
	let q = p*p*p + (b*c - 3*a*d)/(6*a*a)
	let r = c/(3*a)

	let t = Math.pow(q + Math.pow(q*q + (r-p*p)*(r-p*p)*(r-p*p),1/2),1/3)
			+ Math.pow(q - Math.pow(q*q + (r-p*p)*(r-p*p)*(r-p*p),1/2),1/3)
			+ p

	//console.log("P : " + p + ",Q : " + q + ",R : " + r)
	return t
}

function fitImage(stroke1,stroke2,Image){
	//Selecting whisker
	whiskerImage = whiskers[Image-1].get(0,0,whiskers[Image-1].width,whiskers[Image-1].height);

	//This is where all the maths should go.
	for(let j = 0; j < whiskerImage.width; j += whiskerImage.width/fractionIndex){
		let newPoint = bezierEquation(stroke1,j/whiskerImage.width);
		let nextNewPoint = bezierEquation(stroke1,(j + whiskerImage.width/fractionIndex)/whiskerImage.width);

		let newT = bezierEquation_getT(stroke2,j);
		let yPoint = bezierEquation(stroke2,j/whiskerImage.width);

		//results
		newX = newPoint[0];
		newY = newPoint[1];
		
		let diffWidth = abs(nextNewPoint[0]-newPoint[0]);
		let diffHeight = abs(yPoint[1]-newPoint[1]);
		
		//Image placing straight approach
		//image(img, dx, dy, dWidth, dHeight, sx, sy, [sWidth], [sHeight])
		// Below function call is for center align
		//image(whiskerImage,newX,newY-(whiskerImage.height/2),diffWidth,diffHeight,j,0,whiskerImage.width/fractionIndex,whiskerImage.height);

		//Below function call is for Top Align
		//image(whiskerImage,newX,newY,diffWidth,diffHeight,j,0,whiskerImage.width/fractionIndex,whiskerImage.height);

		//Line between two curves -- For Debugging
		// we need to go from (newX,newY) to (yPoint[0],yPoint[1])
		//line(newX,newY,yPoint[0],yPoint[1])

		/* Directional Pixel Placing approach
		dirX = newX - yPoint[0] //Direction X
		dirY = newY - yPoint[1]	//Direction Y
		dirM = Math.pow(dirX*dirX + dirY*dirY,1/2) //Magnitude
		dirX = Math.round(dirX/dirM) //Normalized Direction X
		dirY = Math.round(dirY/dirM) //Normalized Direction Y
		let fullDistance = dist(newX,newY,yPoint[0],yPoint[1])
		
		let ix = newX;
		let iy = newY;
		for(let currentDistance = dist(ix,iy,yPoint[0],yPoint[1]); currentDistance >= 0.99 * fullDistance; 
								currentDistance = dist(ix,iy,yPoint[0],yPoint[1]), ix += dirX, iy += dirY){
			
			let pixelColor = whiskerImage.get(j, Math.round(currentDistance/fullDistance));
			set(ix,iy,pixelColor);
		}
		*/

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
		/* Debugging
		stroke(255,0,0)
		line(0,0,0,fullDistance) */
		pop()
	}
}

//Loading images
//--------------------------- Setup Function p5.js
function setup(){
	p5canvas = createCanvas(720,400);
	wtf = whiskers[currentWhisker-1].get(0,0,whiskers[currentWhisker-1].width,whiskers[currentWhisker-1].height);
}

//--------------------------- Draw Function p5.js
function draw(){
	
	//Custom function to make a bezier curve
	function renderBezier(stroke){
		for(let t = 0;t <= 1; t+=0.05){
			let result = bezierEquation(stroke,t);
			newX = result[0];
			newY = result[1];
			circle(newX,newY,1);
		}
	}

    refresh();
	fill(255,0,0);
	//Testing img ?
	
	//temp Stroke making
	if(tempStroke.length > 0){
		
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

	for (let i = 0; i < brushStrokes.length; i++) {
		let stroke = brushStrokes[i];
		if(stroke.length == 4){
			drawBezier(stroke);
        }
	}

	if(brushStrokes.length >= 2){
		for (let i = 0; i < brushStrokes.length - 1; i+=2) {
			fitImage(brushStrokes[i],brushStrokes[i+1],currentWhisker);
		}
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
function saveStroke(){
	if(tempStroke.length > 0){
		
		brushStrokes.push(tempStroke);
		tempStroke = [];
		undoStack.push(1);
	}
}

//Refresh canvas function
function refresh(){
	clear();
	background(255);
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
function mouseReleased(){
	createStroke();
}
