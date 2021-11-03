
var OfflineAudioContext = window.OfflineAudioContext || window.webkitOfflineAudioContext;

class SimpleReverb extends Effect {
  constructor (context) {
    super(context);
    this.name = "SimpleReverb";
  }

  setup (reverbTime=1) {
    this.effect = this.context.createConvolver();

    this.reverbTime = reverbTime;

    this.attack = 0.0001;
    this.decay = 0.1;
    this.release = reverbTime;

    this.wet = this.context.createGain();
    this.input.connect(this.wet);
    this.wet.connect(this.effect);
    this.effect.connect(this.output);    
  }

  renderTail () {

    const tailContext = new OfflineAudioContext( 2, this.context.sampleRate * this.reverbTime, this.context.sampleRate );
          tailContext.oncomplete = (buffer) => {
            this.effect.buffer = buffer.renderedBuffer;
          }
    
    const tailOsc = new Noise(tailContext, 1);
          tailOsc.init();
          tailOsc.connect(tailContext.destination);
          tailOsc.attack = this.attack;
          tailOsc.decay = this.decay;
          tailOsc.release = this.release;
    
      
      tailOsc.on({frequency: 500, velocity: 1});
      tailContext.startRendering();
    setTimeout(()=>{
      tailOsc.off(); 
    },20)
      
     
  }

  set decayTime(value) {
    let dc = value/3;
    this.reverbTime = value;
    this.attack = 0;
    this.decay = 0;
    this.release = dc;
    return this.renderTail();
  }

}

class AdvancedReverb extends SimpleReverb {
  constructor (context) {
    super(context);
    this.name = "AdvancedReverb";
  }

  setup (reverbTime=1, preDelay = 0.03) {
    this.effect = this.context.createConvolver();

    this.reverbTime = reverbTime;

    this.attack = 0.001;
    this.decay = 0.1;
    this.release = reverbTime;

    this.preDelay = this.context.createDelay(reverbTime);
    this.preDelay.delayTime.setValueAtTime(preDelay, this.context.currentTime);
    
    this.multitap = [];
    
    for(let i = 2; i > 0; i--) {
      this.multitap.push(this.context.createDelay(reverbTime));
    }
    this.multitap.map((t,i)=>{
      if(this.multitap[i+1]) {
        t.connect(this.multitap[i+1])
      }
      t.delayTime.setValueAtTime(0.001+(i*(preDelay/2)), this.context.currentTime);
    })
    
    this.multitapGain = this.context.createGain();
    this.multitap[this.multitap.length-1].connect(this.multitapGain);
    
    this.multitapGain.gain.value = 0.2;
    
    this.multitapGain.connect(this.output);
    
    this.wet = this.context.createGain();
     
    this.input.connect(this.wet);
    this.wet.connect(this.preDelay);
    this.wet.connect(this.multitap[0]);
    this.preDelay.connect(this.effect);
    this.effect.connect(this.output);
   
  }
  renderTail () {

    const tailContext = new OfflineAudioContext( 2, this.context.sampleRate * this.reverbTime, this.context.sampleRate );
          tailContext.oncomplete = (buffer) => {
            this.effect.buffer = buffer.renderedBuffer;
          }
    const tailOsc = new Noise(tailContext, 1);
    const tailLPFilter = new Filter(tailContext, "lowpass", 2000, 0.2);
    const tailHPFilter = new Filter(tailContext, "highpass", 500, 0.1);
    
    tailOsc.init();
    tailOsc.connect(tailHPFilter.input);
    tailHPFilter.connect(tailLPFilter.input);
    tailLPFilter.connect(tailContext.destination);
    tailOsc.attack = this.attack;
    tailOsc.decay = this.decay;
    tailOsc.release = this.release;
    
    tailContext.startRendering()

    tailOsc.on({frequency: 500, velocity: 1});
    setTimeout(()=>{
          tailOsc.off();
    },20)
  }

  set decayTime(value) {
    let dc = value/3;
    this.reverbTime = value;
    this.attack = 0;
    this.decay = 0;
    this.release = dc;
    return this.renderTail();
  }
}


//let Audio = new (window.AudioContext || window.webkitAudioContext)();     

//let filter = new Filter(Audio, "lowpass", 50000, 0.8);
    //filter.setup();

//drySound.connect(compressor);

// let drySound = new Sample(Audio);    
//     drySound.load("https://mwmwmw.github.io/files/Instruments/DrumBeat.mp3").then((s)=>{
      
//     });

// let wetSound = new Sample(Audio);    
//     wetSound.load("https://mwmwmw.github.io/files/Instruments/DrumBeat.mp3").then((s)=>{ 
//       wetSound.connect(filter.input);
//     });

// let combined = new Sample(Audio);    
//     combined.load("https://mwmwmw.github.io/files/Instruments/DrumBeat.mp3").then((s)=>{
//       combined.connect(filter.input);
//       combined.connect(compressor);
//     });




// document.getElementById("dry").addEventListener("mousedown",(e)=>{
//   drySound.play();
// });
// document.getElementById("wet").addEventListener("mousedown",(e)=>{
//   wetSound.play();
// })
// document.getElementById("combined").addEventListener("mousedown",(e)=>{
//   combined.play();
// })
