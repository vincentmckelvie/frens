function CigEffect(){
  this.part = new ParticleEmitter("sphere");
  this.update = function(){
    this.part.update();
    if(clickingHand){
     
      //this.emit = function(
      //SCENE, 
      //POS, 
      //ROT, 
      //SCL, 
      //RNDPOS, 
      //RNDROT, 
      //RNDSCL, 
      //VELPOS, 
      //VELROT, 
      //VELSCL, 
      //COL){
      const vec = new THREE.Vector3();
      blob.particleEmitterParent.getWorldPosition(vec);
      this.part.emit(
        webgl.scene, 
        vec, 
        new THREE.Vector3(), 
        new THREE.Vector3(.4,.4,.4), 
        0,
        0,
        2,
        new THREE.Vector3(0,-1,0), 
        new THREE.Vector3(0,0,0), 
        new THREE.Vector3(.1,.1,.1),
        new THREE.Color().setHSL(0,0,.5),
        150
      );
      const rot = getLimbRot(blob.rightHandIndex, blob.bodyHandR, 0) ;
      const xVel = Math.cos(rot-Math.PI/2)*4;
      const yVel = Math.sin(rot-Math.PI/2)*4;
      Body.setVelocity(blob.bodyHandR, { x: -xVel, y: -yVel });
      handlePlayNote();
    }
  }

}

function KnifeEffect(){
  this.part = new ParticleEmitter("sphere");
  this.inc = 0;
  this.update = function(){
    this.part.update();
    if(clickingHand){
      this.inc +=.01;
      if(this.inc>3.14)this.inc = 3.14;

      const scl = Math.sin(this.inc)*20;
     
      //this.emit = function(
      //SCENE, 
      //POS, 
      //ROT, 
      //SCL, 
      //RNDPOS, 
      //RNDROT, 
      //RNDSCL, 
      //VELPOS, 
      //VELROT, 
      //VELSCL, 
      //COL,
      //LIFE){
      const vec = new THREE.Vector3();
      blob.particleEmitterParent.getWorldPosition(vec);
      vec.z = 100 
      this.part.emit(
        webgl.scene, 
        vec, 
        new THREE.Vector3(), 
        new THREE.Vector3(scl,scl,scl), 
        0,
        0,
        2,
        new THREE.Vector3(0,Math.random()*.1,0), 
        new THREE.Vector3(0,0,0), 
        new THREE.Vector3(-.1,-.1,-.1),
        new THREE.Color().setHSL(0,1,.2),
        300
      );
      const rot = getLimbRot(blob.rightHandIndex, blob.bodyHandR, 0) ;
      const xVel = Math.cos(rot-Math.PI/2)*6;
      const yVel = Math.sin(rot-Math.PI/2)*6;
      Body.setVelocity(blob.bodyHandR, { x: -xVel, y: -yVel });
      handlePlayNote();

    }else{
      this.inc = 0;
    }
  }

}


function PaintEffect(){
  this.part = new ParticleEmitter("box");
  this.inc = 0;
  this.update = function(){
    this.part.update();
    if(clickingHand){
      this.inc +=.01;
      
      //this.emit = function(
      //SCENE, 
      //POS, 
      //ROT, 
      //SCL, 
      //RNDPOS, 
      //RNDROT, 
      //RNDSCL, 
      //VELPOS, 
      //VELROT, 
      //VELSCL, 
      //COL,
      //LIFE){
      const vec = new THREE.Vector3();
      blob.particleEmitterParent.getWorldPosition(vec);
      vec.z = 100
      this.part.emit(
        webgl.scene, 
        vec, 
        new THREE.Vector3(), 
        new THREE.Vector3(20,20,20), 
        100,
        Math.PI*2,
        20,
        new THREE.Vector3(0,0,0), 
        new THREE.Vector3((-.5+Math.random())*.1,(-.5+Math.random())*.1,(-.5+Math.random())*.1), 
        new THREE.Vector3(0,0,0),
        new THREE.Color().setHSL(this.inc%1,1,.2),
        1000
      );
      const rot = getLimbRot(blob.rightHandIndex, blob.bodyHandR, 0) ;
      const xVel = Math.cos(rot-Math.PI/4)*6;
      const yVel = Math.sin(rot-Math.PI/4)*6;
      Body.setVelocity(blob.bodyHandR, { x: -xVel, y: -yVel });
      handlePlayNote();
    }else{
      this.inc = 0;
    }
  }

}



function PencilEffect(){
  this.part = new ParticleEmitter("sphere");

  this.update = function(){
    this.part.update();
    if(clickingHand){
      
      //this.emit = function(
      //SCENE, 
      //POS, 
      //ROT, 
      //SCL, 
      //RNDPOS, 
      //RNDROT, 
      //RNDSCL, 
      //VELPOS, 
      //VELROT, 
      //VELSCL, 
      //COL,
      //LIFE){
      const vec = new THREE.Vector3();
      blob.particleEmitterParent.getWorldPosition(vec);
      vec.z = 100
      this.part.emit(
        webgl.scene, 
        vec, 
        new THREE.Vector3(), 
        new THREE.Vector3(2,2,2), 
        0,
        0,
        0,
        new THREE.Vector3(0,0,0), 
        new THREE.Vector3(0,0,0), 
        new THREE.Vector3(0,0,0),
        new THREE.Color().setHSL(0,0,.4),
        1000
      );
      const rot = getLimbRot(blob.rightHandIndex, blob.bodyHandR, 0) ;
      const xVel = Math.cos(rot-Math.PI/2)*4;
      const yVel = Math.sin(rot-Math.PI/2)*4;
      Body.setVelocity(blob.bodyHandR, { x: -xVel, y: -yVel });
      handlePlayNote();
    }
  }

}



function BasketBallEffect(){
  //this.part = new ParticleEmitter("sphere");
  this.meshArr = [];
  this.bodyArr = [];
  this.ot = false;
  this.update = function(){
    
    if(clickingHand){
      if(!this.ot){
        const vec = new THREE.Vector3();
        blob.particleEmitterParent.getWorldPosition(vec);
        vec.z = 100;
        this.ot = true;
        // const geometry = new THREE.SphereGeometry( 20, 12, 12 );
        // const col = new THREE.Color().setHSL(Math.random(), 1, .3);
        // const material = new THREE.MeshStandardMaterial( {color:col, emissive:col} );
        const mesh = holding.clone();
        this.meshArr.push(mesh);
        webgl.scene.add(mesh);
        const po = { 
          friction: .2,
          frictionStatic: 0.2,
          restitution: .4,
          frictionAir: .03,
        };
        const body = Bodies.circle(vec.x, vec.y, 40, { isStatic: false });
        body.label = "food";
        Composite.add(world, body);
        Body.setVelocity(body, { x: (-1+Math.random()*2)*10, y: (-1+Math.random()*2)*10 });

        
        Body.setVelocity(blob.bodyHandR, { x: (-1+Math.random()*2)*10, y: (-1+Math.random()*2)*10 });
        this.bodyArr.push(body);
        handlePlayNote();
        
      }
      
      // foods.push(body);
      
    }else{
      this.ot = false;
    }

    for(let i = 0; i<this.meshArr.length; i++){
      //this.bodyArr[i].velocity.y +=.4;
      this.meshArr[i].position.set(this.bodyArr[i].position.x, this.bodyArr[i].position.y, 10);
      this.meshArr[i].rotation.set(0,0, this.bodyArr[i].angle);
    }

  }

}



function GunEffect(){
  //this.part = new ParticleEmitter("sphere");
  this.meshArr = [];
  this.bodyArr = [];
  this.ot = false;
  this.update = function(){
    
    if(clickingHand){
      if(!this.ot){
        const vec = new THREE.Vector3();
        blob.particleEmitterParent.getWorldPosition(vec);
        vec.z = 100;
        this.ot = true;
        const geometry = new THREE.SphereGeometry( 5, 12, 12 );
        const col = new THREE.Color().setHSL(0, 0, .3);
        const material = new THREE.MeshStandardMaterial( {color:col, emissive:col} );
        const mesh = new THREE.Mesh( geometry, material );
        this.meshArr.push(mesh);
        webgl.scene.add(mesh);
        const po = { 
          friction: .2,
          frictionStatic: 0.2,
          restitution: .4,
          frictionAir: .03,
        };
        const body = Bodies.circle(vec.x, vec.y, 5, { isStatic: false });
        body.label = "food";
        Composite.add(world, body);
        const rot = getLimbRot(blob.rightHandIndex, blob.bodyHandR, 0) ;
        const xVel = Math.cos(rot)*20;
        const yVel = Math.sin(rot)*20;
        Body.setVelocity(body, { x: xVel, y: yVel });
       
        Body.setVelocity(blob.bodyHandR, { x: -xVel, y: -yVel });
        this.bodyArr.push(body);
        handlePlayNote();
        
      }
      
      // foods.push(body);
      
    }else{
      this.ot = false;
    }

    for(let i = 0; i<this.meshArr.length; i++){
      //this.bodyArr[i].velocity.y +=.4;
      this.meshArr[i].position.set(this.bodyArr[i].position.x, this.bodyArr[i].position.y, 10);
    }

  }

}


function PhoneEffect(){
  //this.part = new ParticleEmitter("sphere");
  this.meshArr = [];
  this.bodyArr = [];
  this.ot = false;
  this.update = function(){
    
    if(clickingHand){
      if(!this.ot){
        const vec = new THREE.Vector3();
        blob.particleEmitterParent.getWorldPosition(vec);
        vec.z = 100;
        this.ot = true;
        // const geometry = new THREE.SphereGeometry( 5, 12, 12 );
        // const col = new THREE.Color().setHSL(0, 0, .3);
        // const material = new THREE.MeshStandardMaterial( {color:col, emissive:col} );
        const mesh = holding.clone();
        this.meshArr.push(mesh);
        webgl.scene.add(mesh);
        const po = { 
          friction: .2,
          frictionStatic: 0.2,
          restitution: .4,
          frictionAir: .03,
        };
        const body = Bodies.rectangle(vec.x, vec.y, 20,50, { isStatic: false });
        body.label = "food";
        Composite.add(world, body);
        const rot = getLimbRot(blob.rightHandIndex, blob.bodyHandR, 0) ;
        const xVel = Math.cos(rot)*20;
        const yVel = Math.sin(rot)*20;
        Body.setVelocity(body, { x: xVel, y: yVel });
        Body.setVelocity(blob.bodyHandR, { x: -xVel, y: -yVel });
        this.bodyArr.push(body);
        handlePlayNote();
      }
      
      // foods.push(body);
      
    }else{
      this.ot = false;
    }

    for(let i = 0; i<this.meshArr.length; i++){
      //this.bodyArr[i].velocity.y +=.4;
      this.meshArr[i].position.set(this.bodyArr[i].position.x, this.bodyArr[i].position.y, 10);
      this.meshArr[i].rotation.set(0, 0,this.bodyArr[i].angle);
    }

  }

}



