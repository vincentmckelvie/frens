
    
let Engine = Matter.Engine,
Composites = Matter.Composites,
Composite = Matter.Composite,
Bodies = Matter.Bodies,
Constraint = Matter.Constraint,
Events = Matter.Events,
Body = Matter.Body,
Common = Matter.Common,
mouseConstraint, mouseBody, mousePos = new Matter.Vector.create(0,0), foods=[],
 audioCtx, gainNode, convolver, biquadFilter, distortion, synthDelay, compressor, soundSource, initAudio = false, oscInc = 0, gainTarget = 0 , gain = 0, chordInc = 0, chordProgress = 0, bpmInc=0, lastNote=0, lastTraceAudio = 0, lastTraceBeat = 0, notes=[], verb;
;

const modelParts = [];
let blob;
let doingGrav = false, info, doingInfo = false, doingAudio = true, doingTrail = true;
let grey = .3;
let webgl;
const isMobile = ( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) );
let mouseDown = false, clickingHand = false;

let loadedEyes = false;
let loadedHands = false; 
let loadedMouth = false;
let loadedNose = false;
let loadedShoes = false;
let loadedHat = false;
let loadedText = false;
let loadedHolding = false;
let wallLeft, wallRight, wallTop, wallBotton;
let eyesModel, handLeft, handRight, mouth, nose, footLeft, footRight, hat, text, holding;

const scl = 130;

var chords = chordsAll[obj.chordSequence];

document.addEventListener("DOMContentLoaded", function(event) {
    initInfoDiv();
    initLoading();
});

function initLoading(){
  const eyeLoader = new THREE.GLTFLoader().setPath( 'models/' );
  eyeLoader.load( 'eyes/'+obj.eyes+'.glb', function ( gltf ) {
    loadedEyes = true;
    eyes = gltf.scene;

    setColor(gltf, obj.textureEyes<1, obj.srcTextureEyes);
    initHelper(gltf);

  });
  const handsLoader = new THREE.GLTFLoader().setPath( 'models/' );
  handsLoader.load( 'hands/'+obj.hands+'.glb', function ( gltf ) {
    loadedHands = true;
    handRight = gltf.scene;
    handLeft = gltf.scene.clone();
    const handsScl = scl*.9;
    handLeft.scale.set(handsScl,handsScl,handsScl);
    setColor(gltf, obj.textureHands<1, obj.srcTextureHands);
    initHelper(gltf);
    handRight.scale.set(handsScl,-handsScl,handsScl);
   
    
  });
  const mouthLoader = new THREE.GLTFLoader().setPath( 'models/' );
  mouthLoader.load( 'mouths/'+obj.mouth+'.glb', function ( gltf ) {
    loadedMouth = true;
    mouth = gltf.scene;
    setColor(gltf, obj.textureMouth<1, obj.srcTextureMouth);
    initHelper(gltf);
    
  });
  const noseLoader = new THREE.GLTFLoader().setPath( 'models/' );
  noseLoader.load( 'noses/'+obj.nose+'.glb', function ( gltf ) {
    loadedNose = true;
    nose = gltf.scene;
    setColor(gltf, obj.textureNose<1, obj.srcTextureNose);
    initHelper(gltf);
  });
  const hatLoader = new THREE.GLTFLoader().setPath( 'models/' );
  hatLoader.load( 'hats/'+obj.hat+'.glb', function ( gltf ) {
    loadedHat = true;
    hat = gltf.scene;
    setColor(gltf, obj.textureHat<1, obj.srcTextureHat);
    initHelper(gltf);
    const hatScl = scl*1.5; 
    hat.scale.set(hatScl,hatScl,hatScl);
    
  });
  const shoesLoader = new THREE.GLTFLoader().setPath( 'models/' );
  shoesLoader.load( 'shoes/'+obj.feet+'.glb', function ( gltf ) {
    loadedShoes = true;
    footRight = gltf.scene;
    setColor(gltf, obj.textureShoes<1, obj.srcTextureShoes);
    footLeft = gltf.scene.clone();

    const shoeScl = scl*.9; 
    footLeft.scale.set(shoeScl,shoeScl,shoeScl);
    initHelper(gltf);
    footRight.scale.set(shoeScl,-shoeScl,shoeScl);
  
  });
  const holdingLoader = new THREE.GLTFLoader().setPath( 'models/' );
  holdingLoader.load( 'holding/'+obj.holding+'.glb', function ( gltf ) {
    loadedHolding = true;
    holding = gltf.scene;
    setColor(gltf);
    initHelper(gltf);
    const holdingScl = scl*1.5; 
    holding.scale.set(-holdingScl,holdingScl,holdingScl);
    
  });
  const textLoader = new THREE.GLTFLoader().setPath( 'models/' );
  textLoader.load( 'text/'+obj.text+'.glb', function ( gltf ) {
    loadedText = true;
    text = gltf.scene;
    setColor(gltf);
    initHelper(gltf);
    const txtScl = scl*.6; 
    text.scale.set(txtScl,-txtScl,txtScl);
  });
}

function initHelper(gltf){
  var s = scl;
  gltf.scene.scale.set(s,s,s);
  if(loadedEyes && loadedNose && loadedShoes && loadedHands && loadedMouth && loadedHat && loadedText && loadedHolding){
    init();
  }
}

function setColor(gltf){
  gltf.scene.traverse( function ( child ) {
    if ( child.isMesh ) {
      child.material.vertexColors = true;
      child.material.side = THREE.DoubleSide;
    }
  } );
}

function init(){
  //console.log(hand);
  engine = Engine.create();
  world = engine.world;
  engine.world.gravity.x = 0;// obj.gravityX*.2;
  engine.world.gravity.y = 0;//obj.gravityY*.2;
  wallTop = Bodies.rectangle(window.innerWidth/2, 0, window.innerWidth*10, 50, { isStatic: true });
  wallBottom = Bodies.rectangle(window.innerWidth/2, window.innerHeight, window.innerWidth*10, 50, { isStatic: true });  
  wallRight = Bodies.rectangle(window.innerWidth, window.innerHeight/2, 50, window.innerHeight*10, { isStatic: true });
  wallLeft = Bodies.rectangle(0, window.innerHeight/2, 50, window.innerHeight*10, { isStatic: true });
  Composite.add(world, [
    wallTop,
    wallBottom,
    wallRight,
    wallLeft 
  ]);
  
  var amt = Math.ceil(obj.blobScl / 4.0);
  var rad = obj.blobScl/amt*3.2;

  webgl = new Webgl();
  webgl.initThree();

  blob = new Blob(rad, obj.blobScl, amt, obj.bodyColor, obj.rndEffectBody);
  //console.log(models.eyes)
  modelParts.push(new BodyPart(eyes,  null, new THREE.Vector3(0,-40,0), 0, obj.eyesColor,  obj.rndEffectEye,   "face", obj.textureEyes <1, obj.srcTextureEyes));
  modelParts.push(new BodyPart(mouth, null, new THREE.Vector3(0,40,0),  0, obj.mouthColor, obj.rndEffectMouth, "face", obj.textureMouth<1, obj.srcTextureMouth));
  modelParts.push(new BodyPart(nose,  null, new THREE.Vector3(0,0,0),   0, obj.noseColor,  obj.rndEffectNose,  "face", obj.textureNose <1, obj.srcTextureNose));
  modelParts.push(new BodyPart(hat,   null, new THREE.Vector3(0,-70,0), 0, obj.hatColor,   obj.rndEffectHat,   "face", obj.textureHat  <1, obj.srcTextureHat));
  modelParts.push(new BodyPart(text,  null, new THREE.Vector3(0,0,0),   0, obj.textColor,  obj.rndEffectText,  "text", obj.textureText <1, obj.srcTextureText));
  modelParts.push(new BodyPart(handRight, blob.bodyHandR, new THREE.Vector3(0,0,0), blob.rightHandIndex, obj.gearColor,    obj.rndEffectGear,    "gear"   , obj.textureGear   <1, obj.srcTextureGear));
  modelParts.push(new BodyPart(handLeft,  blob.bodyHandL, new THREE.Vector3(0,0,0), blob.leftHandIndex,  obj.gearColor,    obj.rndEffectGear,    "gear"   , obj.textureGear   <1, obj.srcTextureGear));
  modelParts.push(new BodyPart(footRight, blob.bodyFootR, new THREE.Vector3(0,0,0), blob.rightFootIndex, obj.gearColor,    obj.rndEffectGear,    "gear"   , obj.textureGear   <1, obj.srcTextureGear));
  modelParts.push(new BodyPart(footLeft,  blob.bodyFootL, new THREE.Vector3(0,0,0), blob.leftFootIndex,  obj.gearColor,    obj.rndEffectGear,    "gear"   , obj.textureGear   <1, obj.srcTextureGear));
  modelParts.push(new BodyPart(holding,   blob.bodyHandR, new THREE.Vector3(0,0,0), blob.rightHandIndex, obj.holdingColor, obj.rndEffectHolding, "holding", obj.textureHolding<1, obj.srcTextureHolding));
  
  //modelParts.push(new BodyPart(models.footLeft, blob.bodyFootL))
  //mouse = Mouse.create(webgl.renderer.domElement),
  if(!isMobile){
    document.addEventListener("keydown",function(e){
      if(e.key=="G" || e.key=="g"){
        if(!doingGrav){
          doingGrav = true;
          engine.world.gravity.x=0;
          engine.world.gravity.y=.4;
          
        }else{
          engine.world.gravity.x=0;
          engine.world.gravity.y=0;
          doingGrav = false; 
        }
      }
      if(e.key=="i" || e.key=="I"){
        if(!doingInfo){
            doingInfo = true;
            info.style.display="block";
        }else{
            doingInfo = false;
            info.style.display="none";
        }
      }
      if(e.key=="a" || e.key=="A"){
        if(!doingAudio){
            doingAudio = true;
        }else{
            doingAudio = false;
        }
      }
      if(e.key=="b" || e.key=="B"){
        if(!doingTrail){
            doingTrail = true;
            if(webgl){
              webgl.bgMat.opacity = .07;
            }
        }else{
            doingTrail = false;
            if(webgl){
              webgl.bgMat.opacity = 1;
            }
        }
      }
    });
    document.addEventListener("mousedown",function(e){
      var x = e.pageX;
      var y = e.pageY;
      mousePos.x = x;
      mousePos.y = y;
      mouseDown = true;
      handleInteraction(x,y);
      doInitAudio();
      //console.log("before check granted");
      
    });
    document.addEventListener("mousemove",function(e){
      var x = e.pageX;
      var y = e.pageY;
      mousePos.x = x;
      mousePos.y = y;
      
    });
    document.addEventListener("mouseup",function(e){
      killInteraction();
      mouseDown = false;
    });
  
  }else{

    document.getElementById("mobile-button").addEventListener("click", function(){
      document.getElementById("mobile-button").style.display="none";
      doInitAudio();
      if (typeof DeviceOrientationEvent.requestPermission === "function") {
        DeviceOrientationEvent.requestPermission()
          .then(permissionState => {
            if (permissionState === "granted") {
              window.addEventListener('deviceorientation', function(event) {
                updateGravity(event);
              });

            }
          })
          .catch(console.error);
      } else {
        // handle regular non iOS 13+ devices
      }
    })

    document.addEventListener("touchstart",function(e){
      //event.preventDefault();
      var touch = event.touches[0];
      var x = touch.pageX;
      var y = touch.pageY;
      mousePos.x = x;
      mousePos.y = y;
      mouseDown = true;
      handleInteraction(x,y);
      
    });

    document.addEventListener("touchmove",function(e){
      //event.preventDefault();
      var touch = event.touches[0];
      var x = touch.pageX;
      var y = touch.pageY;
      mousePos.x = x;
      mousePos.y = y;
    });
     document.addEventListener("touchend",function(e){
      killInteraction();
      mouseDown = false;
    });
    document.addEventListener("touchcancel",function(e){
      killInteraction();
      mouseDown = false;
    });
  }
  window.addEventListener( 'resize', function(e){
    if(webgl)
      webgl.resize();
      Body.setPosition(wallTop, { x: window.innerWidth/2, y: 0 });
      Body.setPosition(wallBottom, { x: window.innerWidth/2, y: window.innerHeight });
      Body.setPosition(wallRight, { x: window.innerWidth, y: window.innerHeight/2 });
      Body.setPosition(wallLeft, { x: 0, y: window.innerHeight/2 });
  } );
 
  animate();

}


function updateGravity(event) {
 
    var gravity = engine.world.gravity;

    if (orientation === 0) {
        gravity.x = Common.clamp(event.gamma, -90, 90) / 90;
        gravity.y = Common.clamp(event.beta, -90, 90) / 90;
    } else if (orientation === 180) {
        gravity.x = Common.clamp(event.gamma, -90, 90) / 90;
        gravity.y = Common.clamp(-event.beta, -90, 90) / 90;
    } else if (orientation === 90) {
        gravity.x = Common.clamp(event.beta, -90, 90) / 90;
        gravity.y = Common.clamp(-event.gamma, -90, 90) / 90;
    } else if (orientation === -90) {
        gravity.x = Common.clamp(-event.beta, -90, 90) / 90;
        gravity.y = Common.clamp(event.gamma, -90, 90) / 90;
    }
  
};


function handleInteraction(x,y){
  
  if(blob){
    let both = blob.getClosest(x,y); 
    let b = both.blob;
    let dist = both.dist;
    let i = both.index;
    //console.log(both.index);
    if(dist<100){
      var po = { 
        friction: .2,
        frictionStatic: 0.2,
        restitution: .4,
        frictionAir: .03,
        collisionFilter: { group: -1 }  
      };
      mouseBody = Bodies.circle(x, y, 20, po);
      Composite.add(world, mouseBody);
      mouseConstraint = Constraint.create({
          bodyA: b,
          pointA: { x: 0, y:0 },
          bodyB: mouseBody,
          pointB: { x: 0, y:0 },
          stiffness: .08,
          damping: 0.1
      });
      
      Composite.add(world, mouseConstraint);
      if(b == blob.bodyHandR){
        clickingHand = true;
      }
      
    }else{
      clickingHand = true;
    }
  }
}

function killInteraction(){
  mouseDown = false;
  clickingHand = false;
  if(mouseConstraint){
    Matter.World.remove(world, mouseConstraint);
    Matter.World.remove(world, mouseBody);
    mouseBody = null;
    mouseConstraint = null;
  }
}


function animate() {

  if(mouseBody){
      mouseBody.position.x = mousePos.x;
      mouseBody.position.y = mousePos.y;
  }
  
  if(audioCtx){
    //handleAudioVisual();
  }

  if(blob){
    blob.drawBlobGL();
    blob.parent.position.set(blob.bodyX, blob.bodyY, 20);
    blob.parent.rotation.set(0,0,blob.bodyRot+Math.PI/2)
    for(var i = 0; i <modelParts.length; i ++){
      modelParts[i].update();
    }

  }
 
  handleBPM();
  webgl.animate();
  Engine.update(engine, 0);
  requestAnimationFrame( animate );
}
function initInfoDiv(){
    if(isMobile){
      const mobileButton = document.createElement( 'button' );
      mobileButton.id = "mobile-button";
      mobileButton.style.position="fixed"; 
      mobileButton.style.width="200%"; 
      mobileButton.style.height="200%"; 
      mobileButton.style.marginLeft="-100%";
      mobileButton.style.marginTop="-100%"; 
      mobileButton.style.display = "block"; 
      mobileButton.style.zIndex = "3";
      mobileButton.style.opacity = "0";

      mobileButton.style.borderRadius = "0px"; 
      document.body.appendChild( mobileButton );
    }
    info = document.createElement( 'div' );
    info.style.position="absolute"; 
    info.style.width="100%"; 
    info.style.height="auto"; 
    info.style.background="rgba(0,0,0,.4)";
    info.style.display="none"; 
    info.style.color="white";
    info.style.zIndex="2";
    info.style.fontSize= "9px";
    info.style.padding= "5px";
    //info.style.pointerEvents= "none";
    info.style.fontFamily= "'Helvetica', 'Arial', sans-serif";

    info.innerHTML = JSON.stringify(obj, null, " ");
    info.innerHTML += "</br>"; 
    info.innerHTML += "</br> 'g' to toggle gravity";
    info.innerHTML += "</br> 'a' to toggle audio"; 
    info.innerHTML += "</br> 'b' to toggle feedback"; 
    info.innerHTML += "</br> bubble punks by <a style='color:white;' href='https://twitter.com/strugggggs'/>vince</a>"; 
     
    document.body.appendChild( info );
}
    


