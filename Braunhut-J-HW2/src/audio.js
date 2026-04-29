// 1 - our WebAudio context, **we will export and make this public at the bottom of the file**
let audioCtx;

// **These are "private" properties - these will NOT be visible outside of this module (i.e. file)**
// 2 - WebAudio nodes that are part of our WebAudio audio routing graph
let element, sourceNode, analyserNode, gainNode, highshelfBiquadFilter, lowShelfBiquadFilter;

// 3 - here we are faking an enumeration
const DEFAULTS = Object.freeze({
    gain       :      .5,
    numSamples :      256
});

let highshelf = false;
let lowshelf = false;

// 4 - create a new array of 8-bit integers (0-255)
// this is a typed array to hold the audio frequency data
let audioData = new Uint8Array(DEFAULTS.numSamples/2);

// **Next are "public" methods - we are going to export all of these at the bottom of this file**
let setupWebaudio = (filePath) => {

// 1 - The || is because WebAudio has not been standardized across browsers yet
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AudioContext();

// 2 - this creates an <audio> element
    element = new Audio();

// 3 - have it point at a sound file
    loadSoundFile(filePath);

// 4 - create an a source node that points at the <audio> element
    sourceNode = audioCtx.createMediaElementSource(element);

// 5 - create an analyser node
    analyserNode = audioCtx.createAnalyser();// note the UK spelling of "Analyser"

/*
// 6
We will request DEFAULTS.numSamples number of samples or "bins" spaced equally 
across the sound spectrum.

If DEFAULTS.numSamples (fftSize) is 256, then the first bin is 0 Hz, the second is 172 Hz, 
the third is 344Hz, and so on. Each bin contains a number between 0-255 representing 
the amplitude of that frequency.
*/ 

// fft stands for Fast Fourier Transform
    analyserNode.fftSize = DEFAULTS.numSamples;

// 7 - create a gain (volume) node
    gainNode = audioCtx.createGain();
    gainNode.gain.value = DEFAULTS.gain;

    // https://developer.mozilla.org/en-US/docs/Web/API/BiquadFilterNode
    highshelfBiquadFilter = audioCtx.createBiquadFilter();
    highshelfBiquadFilter.type = "highshelf";

    lowShelfBiquadFilter = audioCtx.createBiquadFilter();
    lowShelfBiquadFilter.type = "lowshelf";

// 8 - connect the nodes - we now have an audio graph
    sourceNode.connect(highshelfBiquadFilter);
    highshelfBiquadFilter.connect(lowShelfBiquadFilter);
    lowShelfBiquadFilter.connect(analyserNode);
    analyserNode.connect(gainNode);
    gainNode.connect(audioCtx.destination);
};

let toggleHighshelf = () => {
    if(highshelf){
        highshelfBiquadFilter.frequency.setValueAtTime(1000, audioCtx.currentTime); // we created the `biquadFilter` (i.e. "treble") node last time
        highshelfBiquadFilter.gain.setValueAtTime(25, audioCtx.currentTime);
    }else{
        highshelfBiquadFilter.gain.setValueAtTime(0, audioCtx.currentTime);
    }
  };

let highShelfSlider = (value) =>{
    value = Number(value);// make sure that it's a Number rather than a String
    highshelfBiquadFilter.gain.value = value;
};
  
  let toggleLowshelf = () => {
    if(lowshelf){
      lowShelfBiquadFilter.frequency.setValueAtTime(1000, audioCtx.currentTime);
      lowShelfBiquadFilter.gain.setValueAtTime(15, audioCtx.currentTime);
    }else{
      lowShelfBiquadFilter.gain.setValueAtTime(0, audioCtx.currentTime);
    }
  };

let lowShelfSlider = (value) =>{
    value = Number(value);// make sure that it's a Number rather than a String
    lowShelfBiquadFilter.gain.value = value;
};

let loadSoundFile = (filePath) => {
    element.src = filePath;
};

let playCurrentSound = () =>{
    element.play();
};

let pauseCurrentSound = () =>{
    element.pause();
};

let setVolume = (value) => {
    value = Number(value);// make sure that it's a Number rather than a String
    gainNode.gain.value = value;
};

// Added lowShelfSlider and highShelfSlider not sure what the toggle functtions do.
export {audioCtx,setupWebaudio,playCurrentSound,pauseCurrentSound,loadSoundFile,setVolume,analyserNode, toggleHighshelf, toggleLowshelf, lowShelfSlider, highShelfSlider};