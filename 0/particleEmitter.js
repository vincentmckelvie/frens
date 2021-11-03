function ParticleEmitter(MESH){
    
	this.arrFull = false;
	this.index = 0;
	this.arr=[];
	this.max = 100;
    this.mesh = MESH;
    
	this.update = function(){
		for(var i = 0; i < this.arr.length; i++){
			this.arr[i].update();	
		}
	}

	this.emit = function(SCENE, POS, ROT, SCL, RNDPOS, RNDROT, RNDSCL, VELPOS, VELROT, VELSCL, COL, LIFE){
        
        if(this.arrFull){
            this.arr[this.index].killSelf();	
        }
        
       
        //this.arr[this.index] = new Particle(SCENE, POS, ROT, SCL, RNDPOS, RNDROT, RNDSCL, VELPOS, VELROT, VELSCL);
        this.arr[this.index] = new Particle(this.mesh, SCENE, POS, ROT, SCL, RNDPOS, RNDROT, RNDSCL, VELPOS, VELROT, VELSCL, COL, LIFE);
        this.index++;

        if(this.index == this.max){
            this.index=0;
            this.arrFull = true;	
        }
	}
    
    this.killAllParts = function(){
        for(var i = 0; i < this.arr.length; i++){
			this.arr[i].killSelf();	
		}
        this.index=0;
        this.arrFull = false	
    }
}



function Particle(MESH, SCENE, POS, ROT, SCL, RNDPOS, RNDROT, RNDSCL, VELPOS, VELROT, VELSCL, COL, LIFE){
	
    
    // switch(TYPE){
    //     case "champagne":
    //         this.mesh = new 
    //     break;
    //     case "smoke":
    //         this.mesh = new SmokeMesh();    
    //     break;
    // }
    
    this.mesh;
    let geometry;
    let material;

    switch(MESH){
        case "box":
            geometry = new THREE.BoxGeometry( 1, 1, 1 );
            material = new THREE.MeshBasicMaterial( {color:COL} );
            
            this.mesh = new THREE.Mesh( geometry, material );
        break;
        case "sphere":
            geometry = new THREE.SphereGeometry( 2, 12, 12 );
            material = new THREE.MeshBasicMaterial( {color:COL} );
            //material.color = new THREE.Color( 1, 0, 0 );
            this.mesh = new THREE.Mesh( geometry, material );
        break;
    }
    
    this.scene = SCENE;		
	this.scene.add(this.mesh);

    this.pos = new THREE.Vector3();
    this.pos.x = POS.x+(-RNDPOS*.5)+(Math.random()*RNDPOS);
    this.pos.y = POS.y+(-RNDPOS*.5)+(Math.random()*RNDPOS);
    this.pos.z = POS.z+(-RNDPOS*.5)+(Math.random()*RNDPOS);
    
    this.mesh.position.x = this.pos.x;
    this.mesh.position.y = this.pos.y;
    this.mesh.position.z = this.pos.z;
    
    this.rot = new THREE.Vector3();
    this.rot.x = ROT.x + (-RNDROT*.5)+(Math.random()*RNDROT);
    this.rot.y = ROT.y + (-RNDROT*.5)+(Math.random()*RNDROT);
    this.rot.z = ROT.z + (-RNDROT*.5)+(Math.random()*RNDROT);
    
    this.mesh.rotation.x = this.rot.x;
    this.mesh.rotation.y = this.rot.y;
    this.mesh.rotation.z = this.rot.z;
    
    this.scl = new THREE.Vector3();
    var rnd = (-RNDSCL*.5)+(Math.random()*RNDSCL);
    this.scl.x = SCL.x+rnd;
    this.scl.y = SCL.y+rnd;
    this.scl.z = SCL.z+rnd;
    
    this.mesh.scale.x = this.scl.x;
    this.mesh.scale.y = this.scl.y;
    this.mesh.scale.z = this.scl.z;
    
    this.velPos = new THREE.Vector3(VELPOS.x, VELPOS.y, VELPOS.z);
    this.velRot = new THREE.Vector3(VELROT.x, VELROT.y, VELROT.z);
    this.velScl = new THREE.Vector3(VELSCL.x, VELSCL.y, VELSCL.z);
    
	// var col = new THREE.Color();
	// col.setHSL(0, 0.0, .4+Math.random()*0.5);
 //    this.mesh.material.color = col;
    
    this.speed = Math.random()*4;
	this.killed = false;
    this.life = LIFE;
    this.inc = 0;
    this.update = function(){
        this.inc++;
        if(this.inc>this.life){
            this.killSelf();
        }
        
        if(!this.killed){
            this.mesh.position.x += this.velPos.x;
            this.mesh.position.y += this.velPos.y;
            this.mesh.position.z += this.velPos.z;
            
            this.mesh.rotation.x += this.velRot.x;
            this.mesh.rotation.y += this.velRot.y;
            this.mesh.rotation.z += this.velRot.z;
            
            this.scl.x += this.velScl.x;
            this.scl.y += this.velScl.y;
            this.scl.z += this.velScl.z;
            
            if(this.scl.x<0.01){
                this.scl.x = 0.01;
            }
            if(this.scl.y<0.01){
                this.scl.y = 0.01;
            }
            if(this.scl.z<0.01){
                this.scl.z = 0.01;
            }
        
            this.mesh.scale.x = this.scl.x;
            this.mesh.scale.y = this.scl.y;
            this.mesh.scale.z = this.scl.z;
        }
        
	}

	this.killSelf = function(){
        if(!this.killed){
            this.scene.remove(this.mesh);
            //this.mesh.dispose();
            
    		this.mesh.material.dispose();
            this.mesh.geometry.dispose();
            this.killed = true;
        }
        
	}
}