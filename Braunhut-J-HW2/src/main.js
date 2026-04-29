/*
	main.js is primarily responsible for hooking up the UI to the rest of the application 
	and setting up the main event loop
*/

// We will write the functions in this file in the traditional ES5 way
// In this instance, we feel the code is more readable if written this way
// If you want to re-write these as ES6 arrow functions, to be consistent with the other files, go ahead!

import * as canvas from './canvas.js';
import * as audio from './audio.js';
import * as utils from './utils.js';

const drawParams = {
    showGradient : true,
    showBars     : true,
    showCircles  : true,
    showNoise    : false,
    showInvert   : false,
    showEmboss   : false,
};

const shelfParams = {
  highshelf      : false,
  lowshelf       : false
};

const dataParams = {
  frequencyData  : false,
  timeDomainData : false
};


// 1 - here we are faking an enumeration
const DEFAULTS = Object.freeze({
	sound1  :  "media/Space Colony Ark Act 1.mp3"
});

const init = () => {
    audio.setupWebaudio(DEFAULTS.sound1);
	  console.log("init called");
	  console.log(`Testing utils.getRandomColor() import: ${utils.getRandomColor()}`);
	  let canvasElement = document.querySelector("canvas"); // hookup <canvas> element
	  setupUI(canvasElement);
    canvas.setupCanvas(canvasElement,audio.analyserNode);
    loop();
}

let setupUI = (canvasElement) => {
  // A - hookup fullscreen button
  const playButton = document.querySelector("#btn-play");
  const fsButton = document.querySelector("#fs-button");
	
  // add .onclick event to button
  fsButton.onclick = e => {
    console.log("init called");
    utils.goFullscreen(canvasElement);
  };
	
  // add .onclick event to button
  playButton.onclick = e =>{
    console.log(`audioCtx.state before = ${audio.audioCtx.state}`);

    //Used strict equality to get the states working in the program.
    //check if context is in suspended state (autoplay)
    if (audio.audioCtx.state === "suspended") {
      audio.audioCtx.resume().then(() => {
        console.log(`audioCtx.state after = ${audio.audioCtx.state}`);
        if (e.target.dataset.playing === "no") {
          // if the track is currently paused, play it
          audio.playCurrentSound();
          e.target.dataset.playing = "yes";
        }
      }).catch(error => {
        console.error("Failed to resume the audio context:", error);
      });
    } else {
      if (e.target.dataset.playing === "no") {
        // if the track is currently paused, play it
        audio.playCurrentSound();
        e.target.dataset.playing = "yes";
      } else {
        audio.pauseCurrentSound();
        e.target.dataset.playing = "no";
      }
    }
  };

  // hookup vovlume slider & label
  let volumeSlider = document.querySelector("#slider-volume");
  let volumeLabel = document.querySelector("#volumeLabel");

  // add .oninput event to slider
  volumeSlider.oninput = e => {
    // set the gain
    audio.setVolume(e.target.value);
    // update value of lable to match with slider
    volumeLabel.innerHTML = Math.round((e.target.value/2 * 100));
  };

  volumeSlider.dispatchEvent(new Event("input"));

    // Added logic for treble and base logic
    let sliderTreble = document.querySelector("#slider-treble");

    sliderTreble.oninput = e => {
    //  audio.toggleHighshelf();
      audio.highShelfSlider(e.target.value);
    };
  
    sliderTreble.dispatchEvent(new Event("input"));
  
    let sliderBass = document.querySelector("#slider-bass");
  
    sliderBass.oninput = e => {
      audio.lowShelfSlider(e.target.value);
    };
    sliderBass.dispatchEvent(new Event("input"));

  // hookup track <select>
  let trackSelect = document.querySelector("#select-track");
  // add .onchange event to <select>
  trackSelect.onchange = e =>{
    audio.loadSoundFile(e.target.value);
    // pause the current track if it is playing
    if (playButton.dataset.playing == "yes"){
        playButton.dispatchEvent(new MouseEvent("click"));
    }
  };

  document.querySelector("#cb-gradient").onclick = function(e){
    drawParams.showGradient = e.target.checked;
  };

  document.querySelector("#cb-bars").onclick = function(e){
    drawParams.showBars = e.target.checked;
  };

  document.querySelector("#cb-circles").onclick = function(e){
    drawParams.showCircles = e.target.checked;
  };

  document.querySelector("#cb-noise").onclick = function(e){
    drawParams.showNoise = e.target.checked;
  };

  document.querySelector("#cb-invert").onclick = function(e){
    drawParams.showInvert = e.target.checked;
  };

  document.querySelector("#cb-emboss").onclick = function(e){
    drawParams.showEmboss = e.target.checked;
  };

    // I. set the initial state of the high shelf checkbox
    document.querySelector('#cb-highshelf').checked = audio.highshelf; // `highshelf` is a boolean we will declare in a second
  
    // II. change the value of `highshelf` every time the high shelf checkbox changes state
    document.querySelector('#cb-highshelf').onchange = e => {
      shelfParams.highshelf = e.target.checked;
      audio.toggleHighshelf(); // turn on or turn off the filter, depending on the value of `highshelf`!
    };
  
    document.querySelector('#cb-lowshelf').onchange = e => {
      shelfParams.lowshelf = e.target.checked;
      audio.toggleLowshelf(); // turn on or turn off the filter, depending on the value of `highshelf`!
    };
  
    document.querySelector('#cb-frequency').onchange = e =>{
      dataParams.frequencyData = e.target.checked;
    };
  
    document.querySelector('#cb-time-domain').onchange = e =>{
      dataParams.timeDomainData = e.target.checked;
    };
    
    // III. 
    audio.toggleHighshelf(); // when the app starts up, turn on or turn off the filter, depending on the value of `highshelf`!


}; // end setupUI

const loop = () => {
    /* NOTE: This is temporary testing code that we will delete in Part II */
        // 1) create a byte array (values of 0-255) to hold the audio data
        // normally, we do this once when the program starts up, NOT every frame
        let audioData = new Uint8Array(audio.analyserNode.fftSize/2);
        
        // 2) populate the array of audio data *by reference* (i.e. by its address)
        if(dataParams.frequencyData){
          audio.analyserNode.getByteFrequencyData(audioData);
        }
        if(dataParams.timeDomainData){
          audio.analyserNode.getByteTimeDomainData(audioData);
        }
        
        // 3) log out the array and the average loudness (amplitude) of all of the frequency bins
          setTimeout(loop, 1000/60);
            canvas.draw(drawParams);
    };

export {init};