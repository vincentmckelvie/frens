
function doInitAudio(){
  if(!initAudio){
   
    // create web audio api context
    
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();

    const initialVol = .1;
    distortion = audioCtx.createWaveShaper();
    biquadFilter = audioCtx.createBiquadFilter();
    //convolver = audioCtx.createConvolver();
    //synthDelay = audioCtx.createDelay(1);
    
    gainNode = audioCtx.createGain();
    gainNode.gain.value = initialVol;
    //gainNode.gain.minValue = initialVol;
    //gainNode.gain.maxValue = initialVol;
    
    gainNode.connect(audioCtx.destination);
  
    distortion.curve = makeDistortionCurve(obj.rndDistortionCurveAmt);
    distortion.oversample = '4x';
    biquadFilter.type = filters[obj.rndFilter];
    biquadFilter.frequency.setValueAtTime(obj.rndBiquadFreq, audioCtx.currentTime);
    biquadFilter.gain.setValueAtTime(obj.rndBiquadGain, audioCtx.currentTime);

    verb = new AdvancedReverb(audioCtx); 
    //verb.setup(2,0.01);
    verb.setup(2,.01);
    verb.renderTail();
    verb.wet.gain.value = 1;
   
   
    compressor = audioCtx.createDynamicsCompressor();
    compressor.threshold.setValueAtTime(-24, audioCtx.currentTime);
    compressor.knee.setValueAtTime(40, audioCtx.currentTime);
    compressor.ratio.setValueAtTime(12, audioCtx.currentTime);
    compressor.attack.setValueAtTime(0, audioCtx.currentTime);
    compressor.release.setValueAtTime(0.25, audioCtx.currentTime);
    
    compressor.connect(gainNode);
    biquadFilter.connect(compressor);
    distortion.connect(biquadFilter);
    verb.connect(distortion);

    // for(var i = 0; i<chords.length; i++){
    //     for(var k = 0; k<chords[i].length; k++){
    //         notes.push(new Note(chords[i][k], i));
    //     }
    // }
    for(var i = 0; i<chords.length; i++){
        notes.push(new Note(chords[i], i));
    }
    
    initAudio = true;

  }
}


// function handleAudioVisual(){
    
//     // gainTarget-=.01;
//     // if(gainTarget<0)gainTarget=0;
//     // gain += (gainTarget-gain)*.1;

//     //gainNode.gain.value = gain;
//     //ctx.beginPath();
//     for (i = 0; i < engine.pairs.collisionStart.length; i++) {
//         var pair = engine.pairs.collisionStart[i];

//         if (!pair.isActive)
//             continue;

//         var collision = pair.collision;
//         for (j = 0; j < pair.activeContacts.length; j++) {
//             var contact = pair.activeContacts[j],
//                 vertex = contact.vertex;

//             if(
//               (pair.bodyA.label == "Circle Body" && pair.bodyB.label == "Rectangle Body") 
//               ||  
//               (pair.bodyA.label == "Rectangle Body" && pair.bodyB.label == "Circle Body")
//               ||
//               (pair.bodyA.label == "limb" && pair.bodyB.label == "Rectangle Body") 
//               ||
//               (pair.bodyA.label == "Rectangle Body" && pair.bodyB.label == "limb") 
              
//             ){
//                 gainTarget+=0.04;
//                 if(gainTarget>.3)gainTarget=.3;
//                 if(lastNote != chordInc){
//                     var currChord = chordInc%chords.length;
//                     var arr = getCurrentChords( currChord );
                  
//                     for(var i = 0; i<arr.length; i++ ){
//                         arr[i].play();
//                     }
                    
                  
//                     lastNote = chordInc;
//                 }
//                 //ctx.rect(vertex.x - 10, vertex.y - 10,20, 20);
//             }
//         }
//     }
    // ctx.fillStyle = 'rgba(255,255,255,1)';
    // ctx.fill();
    // ctx.closePath();
//}

function handlePlayNote(){
    if(initAudio){
        if(lastNote != chordInc){
            var currChord = chordInc%chords.length;
            //var arr = getCurrentChords( currChord );
            const note = notes[currChord]
            note.play();
            //for(var i = 0; i<arr.length; i++ ){
                //arr[i].play();
            //}
            
          
            lastNote = chordInc;
        }
    }
}



function getCurrentChords(chordNumber){
    var arr = [];
    for(var i = 0; i<notes.length; i++){
        if(notes[i].chordNumber==chordNumber){
            arr.push(notes[i]);
        }
    }
    return arr;
}


function getCurrentChords(chordNumber){
    var arr = [];
    for(var i = 0; i<notes.length; i++){
        if(notes[i].chordNumber==chordNumber){
            arr.push(notes[i]);
        }
    }
    return arr;
}


function makeDistortionCurve(amount) {
  var k = typeof amount === 'number' ? amount : 50,
    n_samples = 44100,
    curve = new Float32Array(n_samples),
    deg = Math.PI / 180,
    i = 0,
    x;
  for ( ; i < n_samples; ++i ) {
    x = i * 2 / n_samples - 1;
    curve[i] = ( 3 + k ) * x * 20 * deg / ( Math.PI + k * Math.abs(x) );
  }
  return curve;
};



function handleBPM(){
    bpmInc++;
    //obj.bpm = 200;
    if( Math.floor( bpmInc % Math.floor(obj.bpm/4) ) == 0 ){
        lastTraceAudio ++;
        //console.log("4th = "+lastTraceAudio)
        chordInc++;
    } 

    if(bpmInc>obj.bpm){
        if(chordInc==chords[chordProgress].length-1){
          chordProgress++;
          chordProgress=chordProgress%chords.length;
        }
        lastTraceBeat++;
        //console.log("beat = "+lastTraceBeat) 
        bpmInc = 0;
    }
    for(var i = 0; i<notes.length; i++){
        notes[i].update();
    }
}



function Note(FREQ, CHORDNUMBER){
    this.osc = audioCtx.createOscillator();
    this.osc.connect(verb.input);
    
    this.freq = FREQ;
    this.real = new Float32Array(2);
    this.imag = new Float32Array(2);

    this.real[0] = 0;
    this.imag[0] = 0;
    this.real[1] = 1;
    this.imag[1] = -1;
    this.wave = audioCtx.createPeriodicWave(this.real, this.imag, {disableNormalization: true});
    //this.osc.setPeriodicWave(this.wave);
    //this.osc.frequency.setValueAtTime(/*freqs[chordInc%freqs.length]*/this.freq, audioCtx.currentTime); // value in hertz
    this.chordNumber = CHORDNUMBER;
    this.osc.type = waves[obj.rndWave];
    ////200;//obj.oscDetune;
    this.osc.start();
    this.inc = 0;
    this.mult = 0;
    this.playNote = false;
    this.multTarg = 0;
    this.update = function(){
        if(this.playNote){
            this.inc++;
            if(this.inc> obj.bpm / (4) ){
                this.inc = 0;
                this.playNote = false;
                this.multTarg = 0;
            }
        }
        this.mult += (this.multTarg-this.mult)*.7;
        //this.osc.detune.value = 0;//1*this.mult;
        if(doingAudio)
            this.osc.frequency.setValueAtTime(/*freqs[chordInc%freqs.length]*/(this.freq)*this.mult, audioCtx.currentTime);
        //this.osc.frequency.setValueAtTime(/*freqs[chordInc%freqs.length]*/this.freq, audioCtx.currentTime);
        
    }
    this.play = function(){
        //this.inc = 1;
        this.playNote = true;
        this.multTarg = 1.0;
        //  console.log(freqs[chordInc]);
        
        
        //this.osc.stop(audioCtx.currentTime + .5);
    }
}

