"use strict";
function byId(e){return document.getElementById(e);}

window.addEventListener('load', onDocLoaded, false);

function onDocLoaded()
{
    byId('fileInput').addEventListener('change', onChosenFileChange, false);
}

function onChosenFileChange(evt)
{
    var fileType = this.files[0].type;

	if(fileType.indexOf('video') != -1)
		loadFileObject(this.files[0], onVideoLoaded);
	else
		console.log('Error with Video');
}

function loadFileObject(fileObj, loadedCallback)
{
    var reader = new FileReader();
    reader.onload = loadedCallback;
    reader.readAsDataURL( fileObj );
}

function onVideoLoaded(evt)
{
    byId('video').src = evt.target.result;
    byId('video').play();
}