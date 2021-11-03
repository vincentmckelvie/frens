//let footR, footL, handR, handL;
function Blob(BODYRADIUS, RADIUS, POINTS, COL, EFFECT){
  
  this.skeleton = [];
  this.all = [];
  this.perlins = [];
  this.scl = RADIUS;
  let bodyRadius = BODYRADIUS;  // The radius of each body that makes up the skeleton
  let radius = RADIUS;      // The radius of the entire blob
  let totalPoints = POINTS; // How many points make up the blob
  this.rad = RADIUS;
  this.inc = 0;
  this.bodyX=0;
  this.bodyY=0;
  this.bodyRot=0;
  this.mat;
  console.log(EFFECT)
  this.colorHandler = new ColorHandler(COL, EFFECT)
  

  let center = new Matter.Vector.create(window.innerWidth/2, window.innerHeight/2)
  let prevBody;
  let firstBody;
  let lastPos = new Matter.Vector.create(window.innerWidth/2, window.innerHeight/2);

  this.bodyHandR; 
  this.bodyHandL;
  this.bodyFootR;
  this.bodyFootL;

  let i = 0;
  //const stiffness = .08;
  const stiffness = obj.limbElastic;
  const damping = .08;

  var particleOptions = { 
    friction: .2,
    frictionStatic: 0.2,
    restitution: 1,
    frictionAir: .01,
    render: { visible: true } 
  };
  
  this.col = new THREE.Color().setHSL(obj.bodyColor,  Math.floor(Math.random()*2), .3);
  
  this.lineGeometry = new THREE.BufferGeometry();
  this.geometry = new THREE.BufferGeometry();
  this.points = [];
  this.normals = [];
  this.lastPos = new THREE.Vector3();

  this.parent = new THREE.Object3D();
  this.holdingParent = new THREE.Object3D();
  this.particleEmitterParent = new THREE.Object3D();
  webgl.scene.add(this.parent, this.holdingParent);
  this.holdingParent.add(this.particleEmitterParent);
  
  //this.rndSolid = obj.bodyColor;
  //this.colInc=0;
  //this.incSpeed = .2+Math.random()*.3;

  for (i = 0; i < totalPoints; i++) {
    
    let theta = (i/totalPoints)*(Math.PI*2);

    let x = center.x + radius * Math.sin(theta);
    let y = center.y + radius * Math.cos(theta);

    var body = Bodies.circle(x, y, bodyRadius, particleOptions);
    Composite.add(world, body);

    if(i==0){
      firstBody = body;
    }
    if(i>=1){
      var constraint = Constraint.create({
          bodyA: body,
          pointA: { x:0,y:0 },
          bodyB: prevBody,
          pointB: { x: 0, y:0 },
          stiffness: stiffness,
          damping: damping
      });
      Composite.add(world, constraint);
    }
    if(i==totalPoints-1){
      
      var constraint = Constraint.create({
          bodyA: body,
          pointA: { x: 0, y: 0 },
          bodyB: firstBody,
          pointB: { x: 0, y: 0 },
          stiffness: stiffness,
          damping: damping
      });
      Composite.add(world, constraint);
    }
    
    this.skeleton.push(body);
    this.all.push(body);
    
    prevBody = body;

  }

  //let rndStrength = (.5+Math.random()*.5);
  let rndStrength = 5.2;//(.5+Math.random()*.5);
  //let rndStrength = (.7+Math.random()*.2)-.1;
  //let rndStrength = .2;
  for (i = 0; i < totalPoints; i++) {
    var next = (i+(Math.ceil(totalPoints*rndStrength) ))%(totalPoints);
    var nextBod = this.skeleton[next];
    
    var constraint = Constraint.create({
          bodyA: this.skeleton[i],
          pointA: { x: 0, y: 0 },
          bodyB: nextBod,
          pointB: { x: 0, y: 0 },
          stiffness: stiffness,
          damping: damping
    });
    Composite.add(world, constraint);

    if(i<totalPoints-1){
        var x = this.skeleton[i].position.x;
        var y = this.skeleton[i].position.y;
        var x1 = this.skeleton[i+1].position.x;
        var y1 = this.skeleton[i+1].position.y;
        this.points.push(x, y, 0);
        this.points.push(x1, y1, 0);
        this.points.push(center.x, center.y, 0);
        this.normals.push( 0, 0, 1 );
        this.normals.push( 0, 0, 1 );
        this.normals.push( 0, 0, 1 );
    }else{
        var x = this.skeleton[i].position.x;
        var y = this.skeleton[i].position.y;
        var x1 = this.skeleton[0].position.x;
        var y1 = this.skeleton[0].position.y;
        this.points.push(x, y, 0);
        this.points.push(x1, y1, 0);
        this.points.push(center.x, center.y, 0);
        this.normals.push( 0, 0, 1 );
        this.normals.push( 0, 0, 1 );
        this.normals.push( 0, 0, 1 );
    }
     
  }


  //const geometry = new THREE.BufferGeometry();
  
  this.geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( this.points, 3 ) );
  this.geometry.setAttribute( 'normal', new THREE.Float32BufferAttribute( this.normals, 3 ) );

  // const material = new THREE.MeshBasicMaterial( {
  //   side: THREE.DoubleSide,
  //   vertexColors: false,
  //   color:this.col 
  // } );
  
  //const mesh = new THREE.Mesh( geometry, material );
  // scene.add( mesh );

  //this.lineGeometry.setAttribute( 'position', new THREE.Float32BufferAttribute( this.points, 3 ) );
  //console.log(this.lineGeometry)
  //const lineMaterial = new THREE.LineBasicMaterial( { color: new THREE.Color().setHSL(Math.random(), 1, .3), linewidth: 170 } );
  //this.object = new THREE.Line( this.lineGeometry, lineMaterial );
  this.mat = new THREE.MeshStandardMaterial( {
    side: THREE.DoubleSide,
    vertexColors: false,
    emissive:this.col,
    color:0x333333
  } );
  this.object = new THREE.Mesh( this.geometry, this.mat );
  webgl.scene.add(this.object);

  //stifness = stifness*.5;
  this.bodyHandR = Bodies.rectangle(center.x + radius + bodyRadius * (radius/20), center.y, bodyRadius*4, bodyRadius*4, particleOptions);
  this.rightHandIndex = Math.ceil(this.skeleton.length*.25);
  var rightConnect = this.skeleton[this.rightHandIndex];

  var constraint = Constraint.create({
      bodyA: this.bodyHandR,
      pointA: { x: 0, y:0 },
      bodyB: rightConnect,
      pointB: { x: 0, y:0 },
      stiffness: stiffness,
      damping: damping
  });
  Composite.add(world,[this.bodyHandR, constraint]);

  //this.bodyHandL = Bodies.circle(center.x - radius - bodyRadius * (radius/20), center.y, bodyRadius*2, particleOptions); 
  this.bodyHandL = Bodies.rectangle(center.x - radius - bodyRadius * (radius/20), center.y, bodyRadius*3, bodyRadius*3, particleOptions);
  this.leftHandIndex = Math.floor(this.skeleton.length*.75);
  var leftConnect = this.skeleton[this.leftHandIndex];

  var constraint = Constraint.create({
      bodyA: this.bodyHandL,
      pointA: { x: 0, y:0 },
      bodyB: leftConnect,
      pointB: { x: 0, y:0 },
      stiffness: stiffness,
      damping: damping
  });
  Composite.add(world,[this.bodyHandL, constraint]);

  
  //feet
  this.rightFootIndex = Math.floor( 2 );
  var rightFootBod = this.skeleton[this.rightFootIndex];
  this.leftFootIndex = Math.floor(this.skeleton.length - 2);
  var leftFootBod = this.skeleton[this.leftFootIndex];
  //bdfr.position.Set(rightFootBod.position.x, rightFootBod.position.y + bodyRadius * (radius/10));
  //bdfl.position.Set(leftFootBod.position.x, leftFootBod.position.y + bodyRadius * (radius/10));
  //this.bodyFootL = Bodies.circle(leftFootBod.position.x , leftFootBod.position.y + bodyRadius * (radius/10), bodyRadius*2, particleOptions);
  this.bodyFootL = Bodies.rectangle(leftFootBod.position.x, leftFootBod.position.y + bodyRadius * (radius/15), bodyRadius*3, bodyRadius*3, particleOptions); 
  var leftFootConnect = this.skeleton[this.leftFootIndex];

  var constraint = Constraint.create({
      bodyA: this.bodyFootL,
      pointA: { x: 0, y:0 },
      bodyB: leftFootConnect,
      pointB: { x: 0, y:0 },
      stiffness: stiffness,
      damping: damping
  });
  Composite.add(world,[constraint, this.bodyFootL]);

  //this.bodyFootR = Bodies.circle(rightFootBod.position.x, rightFootBod.position.y + bodyRadius * (radius/10), bodyRadius*2, particleOptions); 
  this.bodyFootR = Bodies.rectangle(rightFootBod.position.x, rightFootBod.position.y + bodyRadius * (radius/15), bodyRadius*3, bodyRadius*3, particleOptions);
  var rightFootConnect = this.skeleton[this.rightFootIndex];

  var constraint = Constraint.create({
      bodyA: this.bodyFootR,
      pointA: { x: 0, y:0 },
      bodyB: rightFootConnect,
      pointB: { x: 0, y:0 },
      stiffness: stiffness,
      damping: damping  
  });
  Composite.add(world,[constraint, this.bodyFootR]);

  this.all.push(this.bodyHandL);
  this.all.push(this.bodyHandR);
  this.all.push(this.bodyFootL);
  this.all.push(this.bodyFootR);

  this.bodyHandL.label = this.bodyHandR.label = this.bodyFootL.label = this.bodyFootR.label = "limb"


  
  if(obj.textureBody<1){
    this.mat.emissiveMap = webgl.textures[obj.srcTextureBody];
  }

  this.armRightObject = new THREE.Object3D();
  this.armLeftObject = new THREE.Object3D();
  this.legLeftObject = new THREE.Object3D();
  this.legRightObject = new THREE.Object3D();
  let geo;
  //obj.limbsGeo=2
  switch(obj.limbsGeo){
    case 0:geo = new THREE.IcosahedronGeometry(1, 1);
    break;
    case 1:geo = new THREE.BoxGeometry(1.3,1.3,2,1,1,1);
    break;
    case 2:geo = new THREE.CylinderGeometry( 1.0, 1.0, 1.5, 12 );
    break;
  }
  //const geo = new THREE.IcosahedronGeometry(1, 1);
 
  this.armRightMesh = new THREE.Mesh( geo, this.mat)
  this.armLeftMesh = new THREE.Mesh(  geo, this.mat)
  this.legLeftMesh = new THREE.Mesh(  geo, this.mat)
  this.legRightMesh = new THREE.Mesh( geo, this.mat)
  
  webgl.scene.add(this.armRightObject, this.armLeftObject, this.legLeftObject, this.legRightObject);
  this.armRightObject.add( this.armRightMesh);
  this.armLeftObject.add(  this.armLeftMesh);
  this.legLeftObject.add(  this.legLeftMesh);
  this.legRightObject.add( this.legRightMesh);

  this.armRightMesh.position.z += .25;
  this.armLeftMesh.position.z  += .25;
  this.legRightMesh.position.z += .25;
  this.legLeftMesh.position.z  += .25;
  const rnd1X = -1+Math.random()*2
  const rnd1Y = -1+Math.random()*2
  const rnd2X = -1+Math.random()*2
  const rnd2Y = -1+Math.random()*2
  const rnd3X = -1+Math.random()*2
  const rnd3Y = -1+Math.random()*2
  const rnd4X = -1+Math.random()*2
  const rnd4Y = -1+Math.random()*2
  Body.setVelocity(this.bodyHandR, { x: rnd1X, y: rnd1Y });
  Body.setVelocity(this.bodyHandL, { x: rnd2X, y: rnd2Y });
  Body.setVelocity(this.bodyFootR, { x: rnd3X, y: rnd3Y });
  Body.setVelocity(this.bodyFootL, { x: rnd4X, y: rnd4Y });
  


  this.getClosest = function (x,y){
    var closest = this.all[0];
    var closestDistance = 1000000000;

    var ind = 0;

    for (var i = 0; i<this.all.length; i++) {
      //let sub = b2Math.SubtractVV(this.all[i].position, mousePos)
      let sub = Matter.Vector.sub(this.all[i].position, Matter.Vector.create(x,y));
      //let dist = sub.Length(); 
      let dist = Matter.Vector.magnitude(sub);
      if(dist<closestDistance){
        
        closestDistance = dist;
        closest = this.all[i];
        ind = i;
      }
     
    }
    return {blob:closest, dist:closestDistance, index:ind};
  }



  this.drawBlobGL = function(){
    var center = Matter.Vector.create(0,0)
    for(var i =0; i<this.skeleton.length; i++){
      center = Matter.Vector.add(center, this.skeleton[i].position);
    }
    
    fnlCenter =  Matter.Vector.create(center.x*(1/this.skeleton.length), center.y*(1/this.skeleton.length));
    let pos = this.skeleton[0].position;
    let dx = pos.x - fnlCenter.x;
    let dy = pos.y - fnlCenter.y;
    let angle = -Math.atan2(dx,dy)-Math.PI/2;
      
    this.bodyX = fnlCenter.x;
    this.bodyY = fnlCenter.y;

    this.bodyRot=angle;
    
    let s = 0;
    this.armLeftObject.position.set(  this.skeleton[this.leftHandIndex].position.x,  this.skeleton[this.leftHandIndex].position.y,  -20);
    this.armRightObject.position.set( this.skeleton[this.rightHandIndex].position.x, this.skeleton[this.rightHandIndex].position.y, -20);
    this.legLeftObject.position.set(  this.skeleton[this.leftFootIndex].position.x,  this.skeleton[this.leftFootIndex].position.y,  -100);
    this.legRightObject.position.set( this.skeleton[this.rightFootIndex].position.x, this.skeleton[this.rightFootIndex].position.y, -100);
    
    this.armLeftObject.lookAt( new THREE.Vector3(  this.bodyHandL.position.x,  this.bodyHandL.position.y, -20));
    this.armLeftObject.rotation.z = Math.PI;

    this.armRightObject.lookAt( new THREE.Vector3( this.bodyHandR.position.x,  this.bodyHandR.position.y, -20));
    this.armRightObject.rotation.z = Math.PI;
    this.legLeftObject.lookAt(  new THREE.Vector3(  this.bodyFootL.position.x,  this.bodyFootL.position.y,-100));
    this.legRightObject.lookAt( new THREE.Vector3(  this.bodyFootR.position.x,  this.bodyFootR.position.y,-100));

    s = this.armLeftObject.position.distanceTo(new THREE.Vector3(this.bodyHandL.position.x, this.bodyHandL.position.y, 0));
    this.armLeftObject.scale.set(obj.limbSize,1,s);
    s = this.armRightObject.position.distanceTo(new THREE.Vector3(this.bodyHandR.position.x, this.bodyHandR.position.y, 0));
    this.armRightObject.scale.set(obj.limbSize,1,s);
    s = this.legLeftObject.position.distanceTo(new THREE.Vector3(this.bodyFootL.position.x, this.bodyFootL.position.y, 0));
    this.legLeftObject.scale.set(1,obj.limbSize,s*.5);
    s = this.legRightObject.position.distanceTo(new THREE.Vector3(this.bodyFootR.position.x, this.bodyFootR.position.y, 0));
    this.legRightObject.scale.set(1,obj.limbSize,s*.5);
    
    this.drawBodyGL();

  }

  this.drawBodyGL = function(shouldStroke, shouldFill){

      this.points = [];
      
      var drawLeftHand = false;
      var drawRightHand = false;
      var drawLeftFoot = false;
      var drawRightFoot = false;
      var drawHair = false;
    
      
      //var incMult = 0.092;
      //var perlinNoiseScale = 10;
      for(var i = 0; i<this.skeleton.length; i++){
        
        var hue = (((i/this.skeleton.length)*220)+0)%360;
        var stop = i/this.skeleton.length;
       
        //gradient.addColorStop(""+stop+"", "hsl("+hue+", 190%, 60%)");
         //drawShape(s, context);
        
        let posb = this.skeleton[i].position;
        let dx = posb.x - fnlCenter.x;
        let dy = posb.y - fnlCenter.y;
        let angle = -Math.atan2(dx,dy)-Math.PI/2;
        //this.skeleton[i].m_rotation = angle;
        
        if(i<this.skeleton.length-1){
            var x = this.skeleton[i].position.x;
            var y = this.skeleton[i].position.y;
            var x1 = this.skeleton[i+1].position.x;
            var y1 = this.skeleton[i+1].position.y;
            this.points.push(x, y, 0);
            this.points.push(x1, y1, 0);
            this.points.push(this.bodyX, this.bodyY, 0);
            
        }else{
            var x = this.skeleton[i].position.x;
            var y = this.skeleton[i].position.y;
            var x1 = this.skeleton[0].position.x;
            var y1 = this.skeleton[0].position.y;
            this.points.push(x, y, 0);
            this.points.push(x1, y1, 0);
            this.points.push(this.bodyX, this.bodyY, 0);
            
        }

        // if(i<this.skeleton.length-1){
        //     var x = this.skeleton[i].position.x;
        //     var y = this.skeleton[i].position.y;
        //     var x1 = this.skeleton[i+1].position.x;
        //     var y1 = this.skeleton[i+1].position.y;
        //     this.points.push(x, y, 0);
        //     this.points.push(x1, y1, 0);
        //     //this.points.push(this.bodyX, this.bodyY, 0);
            
        // }else{
        //     var x = this.skeleton[i].position.x;
        //     var y = this.skeleton[i].position.y;
        //     var x1 = this.skeleton[0].position.x;
        //     var y1 = this.skeleton[0].position.y;
        //     this.points.push(x, y, 0);
        //     this.points.push(x1, y1, 0);
        //     //this.points.push(this.bodyX, this.bodyY, 0);
            
        // }

      }
      
      //this.lineGeometry.setAttribute( 'position', new THREE.Float32BufferAttribute( this.points, 3 ) );
      this.geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( this.points, 3 ) );
      this.mat.emissive =  this.colorHandler.getColor();
  
  }
  
}

function BodyPart(MODEL, PART, OFFSET, INDEX, COL, RND, TYPE, TEX, TEXSRC){
  
  this.part = PART;
  this.model = MODEL;
  this.offset = OFFSET;
  this.index = INDEX;
  this.type = TYPE;

  this.colHandler = new ColorHandler(COL,RND);
  this.mesh;
 
  this.prevX = 0; 
  this.prevY = 0;
  this.textInc = 0;
  this.rndTextTime = 100+Math.random()*200;
  this.showingText  = false;
  this.holdingEffect;
  this.scaleTarg = 0;
  this.sclez = 0;
  

 

  const self = this;
  //console.log(this.col)
  this.model.traverse( function ( child ) {
    if ( child.isMesh ) {
      self.mesh = child
      if(TEX){
        self.mesh.material.emissiveMap = webgl.textures[2+TEXSRC];
      }
    }
  });
  
  if(this.part == null){
    if(this.type=="face"){
      blob.parent.add(this.model);
      this.model.position.set(this.offset.x,this.offset.y,0);
      this.model.rotation.set(0,0,Math.PI)
    }else{
      webgl.scene.add(this.model);
    }
  }
  else{
    if(this.type=="gear"){
      webgl.scene.add(this.model);
    }else{

      switch(obj.holding){
        case 0:
          blob.particleEmitterParent.position.set(-80,0,100);
          this.holdingEffect = new CigEffect();
        break;
        case 1:
          blob.particleEmitterParent.position.set(-20,100,100);
          this.holdingEffect = new KnifeEffect();
        break;
        case 2:
          blob.particleEmitterParent.position.set(-100,100,100);
          this.holdingEffect = new PaintEffect();
        break;
        case 3:
          blob.particleEmitterParent.position.set(-30,100,100);
          this.holdingEffect = new PencilEffect();
        break;
        case 4:
          blob.particleEmitterParent.position.set(-40,20,100);
          this.holdingEffect = new BasketBallEffect();
        break;
        case 5:
          blob.particleEmitterParent.position.set(-140,20,100);
          this.holdingEffect = new GunEffect();
        break;
        case 6:
          blob.particleEmitterParent.position.set(-20,0,100);
          this.holdingEffect = new PhoneEffect();
        break;

      }
      blob.holdingParent.add(this.model);
      
      //this.model.position.set(this.offset.x, this.offset.y, 0);
    }
  }

  this.update = function(){
    
    if(this.part == null){
      if(this.type == "face"){
        const dx = blob.bodyX;
        const dy = blob.bodyY;
        const angle = blob.bodyRot;

        this.model.rotation.y = (this.prevX - dx)*.1;
        this.model.rotation.x = -(this.prevY - dy)*.1;

        this.prevX = dx; 
        this.prevY = dy; 
      }else{
        
        const dx = blob.bodyX;
        const dy = blob.bodyY;
        this.model.position.set(dx + 180,dy-180,0);
        
        if(mouseDown){
          this.scaleTarg = 1;
        }else{
          this.scaleTarg = 0;
        }
        this.sclez += ( this.scaleTarg - this.sclez  )*.07;
        
        this.mesh.scale.set(this.scaleTarg, this.scaleTarg, this.scaleTarg)

      }
      this.scaleTarg = 0;
      this.sclez = 0;
     
    }else{
      if(this.type=="gear"){
        this.model.position.set(this.part.position.x,this.part.position.y,0);
        this.model.rotation.set(0,0,getLimbRot(this.index, this.part)+Math.PI);
      }else{
        this.holdingEffect.update();
        blob.holdingParent.rotation.set(0,0,getLimbRot(this.index, this.part)+Math.PI);
        blob.holdingParent.position.set(this.part.position.x,this.part.position.y,0)
      }
    }
   
    this.mesh.material.emissive = this.colHandler.getColor();
          
  }
 

}


function getLimbRot(index, other){
  let pos = blob.skeleton[index].position;
  let pos2 = other.position;
  let dx = pos.x - pos2.x;
  let dy = pos.y - pos2.y;
  let angleF = -Math.atan2(dx,dy)-Math.PI/2;
  return angleF;    
}

function ColorHandler(COL,RND){
  
  this.rndEffect = RND;//Math.floor(Math.random()*6);
  this.colInc = 0;
  this.rndSolid = COL;
  this.incSpeed = .2+Math.random()*.3;
  this.col = new THREE.Color();

  this.getColor = function(){
    switch(this.rndEffect){
      case 0:
          this.strobeBW();
      break;
      case 1:
          this.strobeColor();
      break;
      case 2:
          this.hueShift();
      break;
      case 3:
          this.bwShift();
      break;
      case 4:
          this.solidColor();
      break;
      default:
          this.solidGrey();
      break;
    }
    return this.col;
  }
 
  this.solidColor = function(){
      const hue = this.rndSolid;
      this.col.setHSL(this.rndSolid, 1,.3)
  }
  this.solidGrey = function(){
      this.col.setHSL(0, 0,grey)
  }
  this.bwShift = function(){
      this.colInc+= this.incSpeed*.081;
      const brt = .2+((Math.sin(this.colInc)*.5)*.4);
      this.col.setHSL(0.0, 0.0, brt);
  }
  this.hueShift = function(){
      this.colInc += Math.abs(this.incSpeed*.08);
      this.colInc = this.colInc%1;
      this.col.setHSL(this.colInc, 1, .3)
  }
  this.strobeColor = function(){
      this.colInc+=.1;
      this.colInc = this.colInc%1;
      this.col.setHSL(this.colInc, 1, .3);
  }
  this.strobeBW = function(){
      this.colInc+=.1;
      this.colInc = this.colInc%2.0;
      var strobe = Math.floor(this.colInc);
      this.col.setHSL(0,0,strobe);
  }

}
