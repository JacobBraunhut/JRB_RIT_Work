/*
	The purpose of this file is to take in the analyser node and a <canvas> element: 
	  - the module will create a drawing context that points at the <canvas> 
	  - it will store the reference to the analyser node
	  - in draw(), it will loop through the data in the analyser node
	  - and then draw something representative on the canvas
	  - maybe a better name for this file/module would be *visualizer.js* ?
*/

import * as utils from './utils.js';

let ctx,canvasWidth,canvasHeight,gradient,analyserNode,audioData;
const triangles = [];
const spriteSheet = new Image();
spriteSheet.src = 'media/ShadowRun.png';
const vinylImage = new Image();
vinylImage.src = 'media/vinylrecord.png';
const background = new Image();
background.src = 'media/ShadowHedgehogBackground.jpg';

class Sprite {
    constructor(spriteSheet, frames, x, y, scale) {
        this.spriteSheet = spriteSheet;
        this.frames = frames;
        this.currentFrame = 0;
        this.x = x;
        this.y = y;
        this.frameRate = 50; 
        this.lastFrameTime = 0;
    }

	constru

    update(deltaTime) {
        this.lastFrameTime += deltaTime;
        if (this.lastFrameTime >= this.frameRate) {
            this.currentFrame = (this.currentFrame + 1) % this.frames.length;
            this.lastFrameTime = 0;
        }
    }

    draw(ctx, scale = 1) {
        const frame = this.frames[this.currentFrame];
        ctx.drawImage(
            this.spriteSheet,
            frame.x,
            frame.y,
            frame.width,
            frame.height,
            this.x,
            this.y,
            frame.width * scale,
            frame.height * scale
        );
    }
}

class VinylRecord {
    constructor(image, x, y, scale = 1) {
        this.image = image; 
        this.x = x;
        this.y = y;
        this.rotation = 0; 
		this.scale = scale;
    }

    update() {
        this.rotation += 0.05;
    }

    draw(ctx, scale = 1) {
        ctx.save();
        ctx.rotate(this.rotation);
		ctx.scale(this.scale, this.scale); 
        ctx.drawImage(
            this.image,
            -this.image.width / 2,
            -this.image.height / 2,
        );
        ctx.restore();
    }
}


const shadowFrames = [
    { x: 0, y: 0, width: 33, height: 39 },  // Frame 1
    { x: 33, y: 0, width: 28, height: 39 }, // Frame 2
    { x: 61, y: 0, width: 35, height: 39 }, // Frame 3
    { x: 96, y: 0, width: 33, height: 39 },  // Frame 4
	{ x: 129, y: 0, width: 50, height: 39 },  // Frame 5
    { x: 179, y: 0, width: 43, height: 39 }, // Frame 6
    { x: 222, y: 0, width: 49, height: 39 }, // Frame 7
    { x: 271, y: 0, width: 48, height: 39 },  // Frame 8
	{ x: 319, y: 0, width: 51, height: 39 },  // Frame 9
    { x: 370, y: 0, width: 47, height: 39 }, // Frame 10
    { x: 417, y: 0, width: 49, height: 39 }, // Frame 11
    { x: 468, y: 0, width: 49, height: 39 },  // Frame 12
	{ x: 517, y: 0, width: 50, height: 39 },  // Frame 13
    { x: 567, y: 0, width: 49, height: 39 }, // Frame 14
    { x: 616, y: 0, width: 49, height: 39 }, // Frame 15
    { x: 665, y: 0, width: 46, height: 39 },  // Frame 16
    { x: 0, y: 45, width: 33, height: 39 }, // Frame 17
    { x: 33, y: 45, width: 28, height: 39 }, // Frame 18
    { x: 61, y: 45, width: 41, height: 39 },  // Frame 19
	{ x: 102, y: 45, width: 43, height: 40 },  // Frame 20
    { x: 143, y: 45, width: 47, height: 39 }, // Frame 21
    { x: 190, y: 45, width: 46, height: 40 }, // Frame 22
    { x: 236, y: 45, width: 45, height: 39 },  // Frame 23
	{ x: 281, y: 45, width: 42, height: 41 }, // Frame 24
    { x: 323, y: 45, width: 45, height: 39 },  // Frame 25
	{ x: 368, y: 45, width: 45, height: 41 },  // Frame 26
    { x: 413, y: 45, width: 45, height: 39 }, // Frame 27
    { x: 458, y: 45, width: 46, height: 41 }, // Frame 28
    { x: 504, y: 45, width: 46, height: 39 },  // Frame 29
	{ x: 550, y: 45, width: 41, height: 39 } // Frame 30
];

let lastTime = 0;

const shadowSprite = new Sprite(spriteSheet, shadowFrames, 200, 200);
const canvasCenterX = canvasWidth / 2; // Center X of the canvas
const canvasCenterY = canvasHeight / 2; // Center Y of the canvas
const vinylRecordScale = 0.2; // Set the scale (0.5 for half size)
const vinyl = new VinylRecord(vinylImage, canvasCenterX, canvasCenterY, vinylRecordScale);

const setupCanvas = (canvasElement,analyserNodeRef) => {
	// create drawing context
	ctx = canvasElement.getContext("2d");
	canvasWidth = canvasElement.width;
	canvasHeight = canvasElement.height;
	// create a gradient that runs top to bottom
	gradient = utils.getLinearGradient(ctx,0,0,0,canvasHeight,[{percent: 1/6 ,color:"blue"},{percent: 2/6 ,color:"green"},{percent: 3/6 ,color:"yellow"},{percent: 4/6, color:"red"},{percent: 5/6 ,color:"orange"},{percent: 6/6 ,color:"magenta"}]);
	// keep a reference to the analyser node
	analyserNode = analyserNodeRef;
	// this is the array where the analyser data will be stored
	audioData = new Uint8Array(analyserNode.fftSize/2);
}

const draw = (params={}, visualizationType = 'frequency') =>{
	const currentTime = performance.now();
    const deltaTime = currentTime - lastTime;
    lastTime = currentTime;
  // 1 - populate the audioData array with the frequency data from the analyserNode
	// notice these arrays are passed "by reference" 
	if (visualizationType === 'frequency') {
        analyserNode.getByteFrequencyData(audioData);
    } 
	else if (visualizationType === 'waveform') {
        analyserNode.getByteTimeDomainData(audioData);
    }
	
	// 2 - draw background
	ctx.save();
    ctx.fillStyle = "black";
    ctx.globalAlpha = .1;
    ctx.fillRect(0,0,canvasWidth,canvasHeight);
    ctx.restore();
		
	// 3 - draw gradient
    if(params.showGradient){
        ctx.save();
        ctx.fillStyle = gradient;
        ctx.globalAlpha = .3;
        ctx.fillRect(0,0,canvasWidth,canvasHeight);
        ctx.restore();
    }

	ctx.drawImage(background, 0, 0, canvasWidth, canvasHeight);

	
	// 4 - draw bars
	if(params.showBars){
		let barSpacing = 4;
		let margin = 5;
		let screenWidthForBars = canvasWidth - (audioData.length * barSpacing) - margin * 2;
		let barWidth = screenWidthForBars / audioData.length;
		let barHeight = 200;
		let topSpacing = 100;

		ctx.save();
		ctx.fillStyle = 'rgba(255,255,255,0.50)';
		ctx.strokeStyle = 'rgba(0,0,0,0.50)';
		for(let i = 0; i < audioData.length; i++)
		{
			ctx.fillRect(margin + i * (barWidth + barSpacing), topSpacing + 256-audioData[i],barWidth,barHeight);
			ctx.strokeRect(margin + i * (barWidth + barSpacing), topSpacing + 256-audioData[i],barWidth,barHeight);
		}
		ctx.restore();
	}
	
	// 5 - draw circles
	if (params.showCircles){
		let maxRadius = canvasHeight/4;
		ctx.save();
		ctx.globalAlpha = 0.5;
		for(let i = 0; i < audioData.length; i++){
			//redish circles
			let percent = audioData[i] / 255;

			let circleRadius = percent * maxRadius;
			ctx.beginPath();
			ctx.fillStyle= utils.makeColor(255, 111, 111, .34 - percent/3.0);
			ctx.arc(canvasWidth/2, canvasHeight/2, circleRadius, 0, 2 * Math.PI, false);
			ctx.fill();
			ctx.closePath();

			//blueish circles
			ctx.beginPath();
			ctx.fillStyle= utils.makeColor(0, 0, 255, .10 - percent/10.0);
			ctx.arc(canvasWidth/2, canvasHeight/2, circleRadius * 1.5, 0, 2 * Math.PI, false);
			ctx.fill();
			ctx.closePath();

			//yellowish circles
			ctx.save();
			ctx.beginPath();
			ctx.fillStyle= utils.makeColor(200, 200, 0, .5 - percent/5.0);
			ctx.arc(canvasWidth/2, canvasHeight/2, circleRadius * .50, 0, 2 * Math.PI, false);
			ctx.fill();
			ctx.closePath();
			ctx.restore();
		}
		ctx.restore();
	}

	vinyl.update(); 
	vinyl.draw(ctx); 

	const scaleFactor = 4; 

	shadowSprite.update(deltaTime); 
    shadowSprite.draw(ctx, scaleFactor);

	// Remove a specific color from the sprite
	const targetColor = { r: 0, g: 112, b: 112 }; // Color to remove (e.g., green)

	// Grab the pixels from the canvas
	let spriteImageData = ctx.getImageData(shadowSprite.x, shadowSprite.y, shadowSprite.frames[shadowSprite.currentFrame].width * scaleFactor, shadowSprite.frames[shadowSprite.currentFrame].height * scaleFactor);
	let spriteData = spriteImageData.data;

	for (let i = 0; i < spriteData.length; i += 4) {
		const r = spriteData[i];
		const g = spriteData[i + 1];
		const b = spriteData[i + 2];

		// Check if the current pixel matches the target color
		if (r === targetColor.r && g === targetColor.g && b === targetColor.b) {
			spriteData[i + 3] = 0; // Make this pixel transparent
		}
	}

	updateTriangles();
    triangles.forEach(triangle => {
        drawTriangle(ctx, triangle);
    });


// Put the modified image data back to the canvas
ctx.putImageData(spriteImageData, shadowSprite.x, shadowSprite.y);
	
	// 6 - bitmap manipulation
	// TODO: right now. we are looping though every pixel of the canvas (320,000 of them!), 
	// regardless of whether or not we are applying a pixel effect
	// At some point, refactor this code so that we are looping though the image data only if
	// it is necessary

	// A) grab all of the pixels on the canvas and put them in the `data` array
	// `imageData.data` is a `Uint8ClampedArray()` typed array that has 1.28 million elements!
	// the variable `data` below is a reference to that array 
	let imageData = ctx.getImageData(0, 0, canvasWidth, canvasHeight);
	let data = imageData.data;
	let length = data.length;
	let width = imageData.width; //not using here
	// B) Iterate through each pixel, stepping 4 elements at a time (which is the RGBA for 1 pixel)
	for (let i = 0; i < length; i +=4) {
		// C) randomly change every 20th pixel to red
		if (params.showNoise && Math.random() < .05){
			// data[i] is the red channel
			// data[i+1] is the green channel
			// data[i+2] is the blue channel
			// data[i+3] is the alpha channel
			data[i] = data[i+1] = data[i+2] = 0;// zero out the red and green and blue channels
			data[i] = 255;// make the red channel not red.
			data[i+1] = 255;// make the red channel not green.
			data[i+2] = 255;// make the red channel not blue.
		}//	} // end if
		if(params.showInvert){
			let red = data[i], green = data[i+1], blue = data[i+2];
			data[i] = 255 - red;
			data[i+1] = 255 - green;
			data[i+2] = 255 - blue;
			//data[i+3] is ALPHA
		}
	}// } // end for

	if(params.showEmboss){
		for (let i = 0; i < length; i++){
			if(i%4 == 3) continue;
			data[i] = 127 + 2*data[i] - data[i+4] - data[i + width * 4];
		}
	}
	
	// D) copy image data back to canvas
	ctx.putImageData(imageData, 0, 0);
}

// Function to create a new triangle
const createTriangle = (x, y, size, angle) => {
    return { x, y, size, angle };
};

// Add a few triangles to the array
for (let i = 0; i < 5; i++) {
    triangles.push(createTriangle(800 + i * 100, Math.random() * 30, 30, 15)); // Starting positions
}

// Function to draw a triangle
const drawTriangle = (ctx, triangle) => {
    ctx.beginPath();
    ctx.moveTo(triangle.x, triangle.y); // Tip of the triangle
    ctx.lineTo(triangle.x - triangle.size * Math.cos(triangle.angle * Math.PI / 180), 
               triangle.y + triangle.size * Math.sin(triangle.angle * Math.PI / 180));
    ctx.lineTo(triangle.x - triangle.size * Math.cos((triangle.angle + 60) * Math.PI / 180), 
               triangle.y + triangle.size * Math.sin((triangle.angle + 60) * Math.PI / 180));
    ctx.closePath();
    ctx.fillStyle = 'rgba(255, 0, 0, 0.7)'; // Triangle color
    ctx.fill();
};

const updateTriangles = () => {
    triangles.forEach(triangle => {
        triangle.x -= 2; // Move left by 2 pixels
        // If the triangle moves off-screen, reset its position
        if (triangle.x < -triangle.size) {
            triangle.x = canvasWidth + triangle.size; // Reset to right side
        }
    });
};


spriteSheet.onload = () => {
    console.log('Sprite sheet loaded');
};

export {setupCanvas,draw};