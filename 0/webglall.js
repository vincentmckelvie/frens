  //bloom
    //webglall.js:136 sobel
    //webglall.js:142 pixelate
    //webglall.js:159 dither
    //webglall.js:175 shift

const fxChains = [
[0,1,3,4,5,6],
[0,1,4],
[2,4,],
[6,],
[2,29,3,6,],
[0,5,6,],
[2,29,4,5,6,],
[1,3,39,],
[4,6,],
[3,4,],
[4,5,],
[4,],
[0,3,6,],
[3,4,],
[3,],
[3,39,],
[1,3,39,6,],
[2,3,],
[2,29,5,6,],
[0,],
[2,29],
[3,],
[0,2,3,4,],
[0,9,3,39,6,],
[2,29,6,],
[0,4,5,],
[0,2,29,3,],
[2,29,5,],
[2,6,],
[2,3,39,6,],
[3,6,],
[2,3,],
[0,9,3,],
[0,2,29,4,],
[2,5,6,],
[0,9,],
[],
[]
]
function Webgl(){

    this.container;
    this.camera, this.scene, this.renderer;
    this.delta;
    this.effectPixelate;
    //this.scale = obj.pixelation;
    this.scale= .35

    
    //this.world, this.mass, this.body, this.shape, this.timeStep=1/60;
    this.world, this.timeStep=1/5, this.lastCallTime;
    this.cameraDiv = 2;
    this.bg;
    
    this.title; 
    this.tex, this.mesh;

    this.renderScene, this.renderCamera, this.renderTexture, this.renderRenderer, this.renderPlane;
    
    this.effectSobel;
    this.glitchPass;
    this.dotScreen;
    this.rgbshift;
    this.filmPass;
    this.filmTime = 0;
    this.bgMat;
    // this.grad0;
    // this.grad1;
    this.textures = [];
    //inited in main.js
    this.alpha = 0.07;
    this.effectstr = "[";
    this.bloomPass;
    this.effectDither;
    this.effectCopy;

    this.initThree = function() {
        
        /*
        
        game scene
        
        */
        
        this.scene = new THREE.Scene();
        

        this.camera = new THREE.OrthographicCamera( 0, window.innerWidth, 0, window.innerHeight , 0.01, 1000 );
        this.camera.position.z = 500;
        this.scene.add( this.camera );
        
        const geometry = new THREE.PlaneGeometry( window.innerWidth*4, window.innerHeight*4, 1 );
        
        //const material = new THREE.MeshBasicMaterial( {color: obj.backgroundColor,side:THREE.DoubleSide, transparent:true, opacity:.07} );
        this.bgMat = new THREE.MeshBasicMaterial( {color: new THREE.Color().setHSL((obj.bodyColor+.5)%1.0,  obj.bgSat, .3),side:THREE.DoubleSide, transparent:true, opacity:this.alpha} );
        //this.bgMat = new THREE.MeshBasicMaterial( {color: new THREE.Color().setHSL(.3,  1, .3),side:THREE.DoubleSide, transparent:false, opacity:this.alpha} );
        
        this.bg = new THREE.Mesh( geometry, this.bgMat );
        this.scene.add( this.bg );
        this.bg.position.z= -200

        // renderer
        this.renderer = new THREE.WebGLRenderer({antialias: false, preserveDrawingBuffer:true});
        this.renderer.setSize( window.innerWidth, window.innerHeight );

        this.renderer.autoClear = false;
        this.renderer.autoClearColor = false;
       
        // postprocessing renderer
        //this.renderer.autoClear = true;
        
        var renderModel = new THREE.RenderPass( this.scene, this.camera );
       
        this.effectCopy = new THREE.ShaderPass( THREE.CopyShader );
        this.effectCopy.renderToScreen = true;

        const parameters = { minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter, format: THREE.RGBFormat };
        let renderTarget = new THREE.WebGLRenderTarget( window.innerWidth, window.innerHeight, parameters );
        this.composer = new THREE.EffectComposer( this.renderer, renderTarget );
        this.composer.setSize( window.innerWidth, window.innerHeight );
        //console.log(obj.fxChain)

        if(this.shouldPixelate()){
            renderTarget = new THREE.WebGLRenderTarget( window.innerWidth*this.scale, window.innerHeight*this.scale, parameters );
            this.composer.setSize( window.innerWidth*this.scale, window.innerHeight*this.scale );
        }
        
        //this.composer.setSize( window.innerWidth, window.innerHeight );
        this.composer.addPass( renderModel );
    
        
        for(let t = 0; t<fxChains[obj.fxChain].length; t++){
            switch (fxChains[obj.fxChain][t]){
            case 0:
                this.initBloom0();
                break;
            case 1:
                this.initSobel1();
                break;
            case 2:
                this.initPixelate2();
                break;
            case 3:
                this.initDither3();
                break;
            case 4:
                this.initShift4();
                break;
            case 5:
                this.initFilm5();
                break;
            case 6:
                this.initGlitch6();
                break;
            }

        }
        this.effectstr+="]"
       
        this.container = document.createElement( 'div' );
       
        //this.container.style.pointerEvents = "none";
        document.body.appendChild( this.container );
        this.renderer.domElement.id = "webgl"
        this.renderer.domElement.style.position = "absolute";
        this.renderer.domElement.style.top = "0px";
        this.renderer.domElement.style.left = "0px";
        
        this.container.style.top = "0px";
        this.container.style.left = "0px";
        this.container.style.width = "100%";
        this.container.style.height = "100%";
        
        //this.container.appendChild(this.renderRenderer.domElement);
        this.container.appendChild(this.renderer.domElement);
        
        const grad0  = new THREE.TextureLoader().load( 'grad0.jpg' );
        grad0.wrapS = grad0.wrapT = THREE.RepeatWrapping;
        grad0.repeat.set( 1, 1 );
        
        const grad1  = new THREE.TextureLoader().load( 'grad1.jpg' );
        grad1.wrapS = grad1.wrapT = THREE.RepeatWrapping;
        grad1.repeat.set( 1, 1 );

        const grad2  = new THREE.TextureLoader().load( 'grad0.jpg' );
        grad2.wrapS = grad2.wrapT = THREE.RepeatWrapping;
        grad2.repeat.set( .5, .5 );
        
        const grad3  = new THREE.TextureLoader().load( 'grad1.jpg' );
        grad3.wrapS = grad3.wrapT = THREE.RepeatWrapping;
        grad3.repeat.set( .5, .5 );
        this.textures.push(grad0);
        this.textures.push(grad1);
        this.textures.push(grad2);
        this.textures.push(grad3);

        // if(this.shouldChangeGrey()){
        //     grey =.3
        //     console.log("GRAAAYY");
        // }

        var self = this;
        //this.title = new TitleHandler(titleTex);
        const dirLight = new THREE.DirectionalLight( obj.dirLightColor, .3 );

        //const dirLight = new THREE.PointLight( 0xffffff*Math.random(), 1.8, 800 );
        dirLight.position.set(0, window.innerHeight, -100 );
        this.scene.add( dirLight );
        const light = new THREE.AmbientLight( obj.ambientLightColor ); // soft white light
        this.scene.add( light );
        
        this.animate();

    }
    // this.shouldChangeGrey = function(){
    //     if(isEqual(obj.fxChain, [0,2,3,4,]) ){
    //         return true;
    //     }
    //     return false;
    // }
    this.shouldPixelate = function(){
        for(let t = 0; t<fxChains[obj.fxChain].length; t++){
            if (fxChains[obj.fxChain][t]==2 )
                return true;
        }
        return false;
    }
    this.getCopy = function(copyNum){
        for(let t = 0; t<fxChains[obj.fxChain].length; t++){
            if (fxChains[obj.fxChain][t]==copyNum)
                return true;
        }
        return false;
    }

    this.getResize = function(){
        for(let t = 0; t<fxChains[obj.fxChain].length; t++){
            if (fxChains[obj.fxChain][t]==3 || fxChains[obj.fxChain][t]==0 || fxChains[obj.fxChain][t]==1)
                return true;
        }
        return false;
    }

    this.initBloom0 = function(){
        if(!isMobile){
            //console.log("bloom")
            this.effectstr+="0,"
            const params = {
                exposure: .1,
                bloomStrength: .05,
                bloomThreshold: .3,
                bloomRadius: .9
            };
            this.bloomPass = new THREE.UnrealBloomPass( new THREE.Vector2( window.innerWidth, window.innerHeight ), 1.5, 0.4, 0.85 );
            this.bloomPass.threshold = params.bloomThreshold;
            this.bloomPass.strength = params.bloomStrength;
            this.bloomPass.radius = params.bloomRadius;
            this.composer.addPass( this.bloomPass );
            const copy = this.getCopy(9)
            if(copy){
                this.composer.addPass( this.effectCopy );
                this.effectstr+="9,"
                //console.log("bloom copy")
            }
        }
    }
    this.initSobel1 = function(){
        //console.log("sobel")
        this.effectstr+="1,"
        this.effectSobel = new THREE.ShaderPass( THREE.SobelOperatorShader );
        //console.log(this.shouldPixelate())
        if(this.shouldPixelate()){
            this.effectSobel.uniforms[ 'resolution' ].value.x = window.innerWidth * this.scale;
            this.effectSobel.uniforms[ 'resolution' ].value.y = window.innerHeight * this.scale;
        }else{
            this.effectSobel.uniforms[ 'resolution' ].value.x = window.innerWidth;
            this.effectSobel.uniforms[ 'resolution' ].value.y = window.innerHeight;
        }
        this.composer.addPass( this.effectSobel );
    }
    this.initPixelate2 = function(){
        this.effectstr+="2,"
        this.effectPixelate = new THREE.ShaderPass( THREE.PixelateShader );
        this.effectPixelate.uniforms[ 'size' ].value.x = window.innerWidth*this.scale;
        this.effectPixelate.uniforms[ 'size' ].value.y = window.innerHeight*this.scale;
        this.effectPixelate.uniforms[ 'pixelSize' ].value = window.innerWidth*this.scale;
        this.effectPixelate.uniforms[ 'pixelSize' ].value = window.innerHeight*this.scale;
        this.composer.addPass( this.effectPixelate );
        //console.log("pixelate")
        const copy = this.getCopy(29)
        if(copy){
            this.effectstr+="29,"
            this.composer.addPass( this.effectCopy );
            //console.log("pixelate copy")
        }
        const resize = this.getResize();
        if(resize)    
            this.composer.addPass(this.effectCopy)    
    }
    this.initDither3 = function(){
        this.effectstr+="3,"
       // console.log("dither")
        this.effectDither = new THREE.ShaderPass( THREE.DitherShader );
        this.composer.addPass( this.effectDither );
        const copy = this.getCopy(39)
        if(copy){
            this.effectstr+="39,"
            //console.log("dither copy")
            this.composer.addPass( this.effectCopy );
        }
    }
    this.initShift4 = function(){
        this.effectstr+="4,"
        //console.log("shift")
        this.rgbshift = new THREE.ShaderPass( THREE.RGBShiftShader );
        this.rgbshift.uniforms[ 'amount' ].value = 0.0045;
        this.composer.addPass( this.rgbshift );
    }
    this.initFilm5 = function(){
        //console.log("film")
        this.effectstr+="5,"
        this.filmPass = new THREE.ShaderPass( THREE.FilmShader );
        this.filmPass.uniforms[ 'nIntensity' ].value = .9;
        this.filmPass.uniforms[ 'sIntensity' ].value = .9;
        this.filmPass.uniforms[ 'grayscale' ].value = 0;
        this.composer.addPass( this.filmPass );
    }
    this.initGlitch6 = function(){
        //console.log("glitch")
        this.effectstr+="6,"
        this.glitchPass = new THREE.GlitchPass();
        this.composer.addPass( this.glitchPass );
        this.glitchPass.goWild = true;
    }

  
    this.resize = function( ) {
    
        this.camera.left = 0;
        this.camera.right = window.innerWidth; 
        this.camera.top = 0;
        this.camera.bottom = window.innerHeight;
        
        this.camera.updateProjectionMatrix();
        if( this.effectPixelate){
            this.effectPixelate.uniforms[ 'size' ].value.x = window.innerWidth*this.scale;
            this.effectPixelate.uniforms[ 'size' ].value.y = window.innerHeight*this.scale;
        }
        if(this.effectSobel){
            this.effectSobel.uniforms[ 'resolution' ].value.x = window.innerWidth * this.scale;
            this.effectSobel.uniforms[ 'resolution' ].value.y = window.innerHeight * this.scale;
            if(this.effectPixelate){
                this.composer.setSize( window.innerWidth*this.scale, window.innerHeight*this.scale );
            }else{
                this.composer.setSize( window.innerWidth, window.innerHeight );
            }
        }
        if(this.effectPixelate){
            this.composer.setSize( window.innerWidth*this.scale, window.innerHeight*this.scale );
        }else{
            this.composer.setSize( window.innerWidth*this.scale, window.innerHeight*this.scale );
        }
        this.renderer.setSize( window.innerWidth, window.innerHeight );

       
    }

    this.animate = function() {
        
        //requestAnimationFrame( webglAnimate );
       
        this.render();

    }

    this.render = function() {
        for(let i = 0; i<this.textures.length; i++){
            let offSpeed;
            if(obj.offsetSpeed>0){
                if(obj.offsetSpeed <.01) offSpeed=.01;
                else offSpeed = obj.offsetSpeed;
            }else{
                if(obj.offsetSpeed >-.01) offSpeed=-.01;
                else offSpeed = obj.offsetSpeed;
            }
            this.textures[i].offset.y += offSpeed;
        }
        if(this.filmPass){
            this.filmTime+=10;
            this.filmPass.uniforms[ 'time' ].value = this.filmTime;
        }
        this.composer.render();
        //this.asciieffect.render( this.scene, this.camera );

    }

    this.getTarg = function(){
        return ( game.guy.body.position.y + ( ( window.innerHeight * 0.5 ) - ( globals.scl * 2.0 ) ) )
    }
       
}

function webglAnimate(){
    webgl.animate();
}

function isEqual(a,b)
{
  if(a.length!=b.length){
    return false;
  }else
  {
    for(var i=0;i<a.length;i++){
        if(a[i]!=b[i]){
            return false;
        }
    }
    return true;
  }
}