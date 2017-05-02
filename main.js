"use strict"
function byId(e){return document.getElementById(e);}

var red, green, blue, alpha;

function onDocLoaded()
{
    byId('fileInput').addEventListener('change', onChosenFileChange, false);
	red = byId('r');
	green = byId('g');
	blue = byId('b');
	alpha = byId('alpha');
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
	video.addEventListener('loadeddata',function(){canvas.width = video.videoWidth; canvas.height = video.videoHeight;});
	
	var canvasDelta = [canvas.offsetLeft, canvas.offsetTop];
	
	var audioCtx = new AudioContext();
    var analyser = audioCtx.createAnalyser();
    var source = audioCtx.createMediaElementSource(video);
	source.connect(analyser);
    analyser.connect(audioCtx.destination);
    analyser.fftSize = 32;
	video.pause();
	video.play();
	
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
		cxt.globalAlpha = alpha.value/100;
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
		cxt.fillStyle = 'rgb(' + red.value + ',' + green.value + ',' + blue.value + ')';
		var delta = lineLength/16;
		for(var i = 0; i < 16; i++) {
			cxt.fillRect(delta*i,0,delta*.8,-frequencyData[i]*lineLength/500);
		}
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