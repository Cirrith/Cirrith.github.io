"use strict"
function byId(e){return document.getElementById(e);}

function onDocLoaded()
{
    byId('fileInput').addEventListener('change', onChosenFileChange, false);
}

function onChosenFileChange(evt)
{
    var fileType = this.files[0].type;

	if (fileType.indexOf('video') != -1) {
		var reader = new FileReader();
		reader.onload = onVideoLoaded;
		reader.readAsDataURL(this.files[0]);
	} else {
		console.log('Error with Video');
	}
}

function onVideoLoaded(evt) {	
	var canvas = byId('canvas');
	var cxt = canvas.getContext('2d');
	var video = document.createElement('video');
	video.src = evt.target.result;
	
	var canvasDelta = [canvas.offsetLeft, canvas.offsetTop];
	console.log(canvasDelta);
	
	var audioCtx = new AudioContext();
    var analyser = audioCtx.createAnalyser();
    var source = audioCtx.createMediaElementSource(video);
	source.connect(analyser);
    analyser.connect(audioCtx.destination);
    analyser.fftSize = 32;
	video.pause();
	video.play();
	
	canvas.width = 1280;
	canvas.height = 720;
	video.control = true;
	
	var frequencyData = new Uint8Array(analyser.frequencyBinCount);
	
	var first = true;
	var point1 = [0,0];
	var point2 = [500,0];
	
	function renderFrame() {
		// Clear Screen and Draw Image
		analyser.getByteFrequencyData(frequencyData);
		cxt.clearRect(0,0,canvas.width,canvas.height);
		cxt.drawImage(video,0,0);
		
		// Draw Line
		cxt.lineWidth = 1;
		cxt.strokeStyle = "red";
		cxt.beginPath();
		cxt.moveTo(point1[0],point1[1]);
		cxt.lineTo(point2[0],point2[1]);
		cxt.stroke();
		
		cxt.save();
		var slope = 0;
		if(point1[0] <= point2[0]) {
			slope = (point2[1]-point1[1])/(point2[0]-point1[0]);
			cxt.translate(point1[0],point1[1]);
		} else {
			slope = (point1[1]-point2[1])/(point1[0]-point2[0]);
			cxt.translate(point2[0],point2[1]);
		}
		var angle = Math.atan(slope);
		var lineLength = Math.sqrt(Math.pow(point1[0]-point2[0],2) + Math.pow(point1[1]-point2[1],2));
		cxt.rotate(angle);
		
		cxt.fillStyle = "white";
		var delta = lineLength/16;
		for(var i = 0; i < 16; i++) {
			cxt.fillRect(delta*i,0,delta*.8,-frequencyData[i]*lineLength/500);
		}
		console.log(frequencyData);
		requestAnimationFrame(renderFrame);
		cxt.restore();
	}
	
	function canvasClick(evt) {
		var x = evt.pageX-canvasDelta[0];
		var y = evt.pageY-canvasDelta[1];
		console.log("X: " + x + " Y: " + y);
		if(first) {
			console.log("First");
			point1 = [x,y];
			first = false;
		} else {
			console.log("Second");
			point2 = [x,y];
			first = true;
		}
			
	}
	
	canvas.addEventListener('click',canvasClick);
	renderFrame();
	
}

window.addEventListener('load', onDocLoaded, false);