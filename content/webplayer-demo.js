/***************************
* TEST WEBGL COMPATIBILITY *
***************************/

function isWebGLCompliant() { 
      
	var webglCanvas = document.createElement("canvas");
    var webglContext = null;

    try {
		webglContext = webglCanvas.getContext("webgl");
    } catch (x) {
        webglContext = null;
    }

    if (webglContext == null) {
		try {
			webglContext = webglCanvas.getContext("experimental-webgl");
        } catch (x) {
			webglContext = null;
        }
    }
    
    if (webglContext) {
		return true;
    } else {
		return false;
    }
}
 
var webGLStatus = isWebGLCompliant();
console.log( 'WebGL status: ' + webGLStatus );


/****************************
* IF TRUE, EXECUTE THREE.JS *
****************************/


	/*****************
	* BASIS THREE.JS *
	*****************/
	export var renderer;
	var canvas = document.getElementById('demo-canvas-4D');
	var orbitcontroller = document.getElementById('demo-orbit-controller');
	var container = canvas.parentNode;
	var context;
	let reticle;
	let stats;
	let isInit = false;

	// XR Compatibility
	var isVR = false;
	var isAR = false;

	// THREE.js Modules
	import { Vector3,
			Scene,
			Mesh,
			SpotLight,
			BoxHelper,
			WebGLRenderer,
			PerspectiveCamera,
			PCFSoftShadowMap,
			MeshBasicMaterial,
			MeshStandardMaterial,
			MeshPhongMaterial,
			PlaneBufferGeometry,
			RingBufferGeometry,
			BufferGeometry,

			 } from '../lib/threejs/three.module.js'

	import * as THREE from '../lib/threejs/three.module.js'

	// THREE.js PlugIn
	import { OrbitControls } from '../lib/threejs/OrbitControls-scroll.js'
	import { WEBGL } from '../lib/threejs/WebGL.module.js'
	import { VRButton } from '../lib/threejs/VRButton.js'
	import { ARButton } from '../lib/threejs/ARButton.js'
	import Stats from '../lib/threejs/stats.module.js'

	// WEB4DV: Import
	import WEB4DS from '../lib/web4dv/web4dvImporter.js'

	//Controller Gestures
	import { ControllerGestures } from '../content/ControllerGestures.js'

// if ( webGLStatus ) {
	// THREE.js WebGL compatibility
	if (WEBGL.isWebGL2Available())
	{
		context = canvas.getContext('webgl2');
		renderer = new WebGLRenderer({ canvas: canvas, context: context, antialias: true });
	}
	else if(WEBGL.isWebGLAvailable())
	{
		context = canvas.getContext('webgl');
		renderer = new WebGLRenderer({antialias: true});
	}
	else
	{
		var warning = WEBGL.getWebGLErrorMessage();
		container.appendChild( warning );
	}

	// Stats
	stats = new Stats();
	// container.appendChild( stats.dom );

	// THREE.js XR PlugIn
	var sequencePosition = [0,0,0];
	
	let buttonVR = VRButton.createButton(renderer, function(){
		// IF VR AVAILABLE: WE HIDE DEFAULT PLAY
		if ( buttonVR.classList.contains('vravailable') ) {
			buttonDestroyLoad.style.display = 'none';
			sequencePosition = [0,0,-4];
			camera.lookAt(0,1.1,-4);
		} else {
			buttonDestroyLoad.style.display = 'inline-block';
			buildOrbitController();
			sequencePosition = [0,0,0];
		}
		// buildSequences();
	});


	let options = {
					requiredFeatures: ['hit-test'],
					optionalFeatures: ['dom-overlay'],
					domOverlay : { root: document.getElementById('overlay')},
				}

	

	//document.body.appendChild( ARButton.createButton(renderer, options));

	let buttonAR = ARButton.createButton(renderer, options);

	
	if ( typeof buttonVR != 'undefined' ) {
		buttonVR.classList.add('button4D', 'large')
		document.getElementById("webplayer-button-container").appendChild(buttonVR);
	}
	if ( typeof buttonAR != 'undefined' ) {
		buttonAR.classList.add('button4D', 'large')
		document.getElementById("webplayer-button-container").appendChild(buttonAR);
	}
	renderer.xr.enabled = true;
			

	// Set Scene
	var scene = new Scene();

	// Set Plane
	var material = new MeshPhongMaterial({
		color: 0x808080,
		dithering: true
	});
	var geometry = new PlaneBufferGeometry( 100, 100 );
	var plane = new Mesh( geometry, material );
			plane.position.set( 0, 0, 0 );
			plane.rotation.x = - Math.PI * 0.5;
			plane.receiveShadow = true;
		scene.add( plane );

	// Set Camera
	var camera = new PerspectiveCamera(50, container.offsetWidth / container.offsetHeight, 0.1, 100);
	camera.position.set(0, 5, 5);
	camera.far = 10000;
	camera.near = 0.01;

	var controls;
	var controlsUpdate = false;
	function buildOrbitController() {
		controls = new OrbitControls(camera, orbitcontroller);
			controls.minPolarAngle  = (10 * (Math.PI / 180));
			controls.maxPolarAngle  = (100 * (Math.PI / 180));
			controls.minDistance  = 2;
			controls.maxDistance  = 10;
		//	controls.enableKeys = true;
		//	controls.enablePan = false;
			controls.autoRotate = true;
		//	controls.autoRotateSpeed = 2;
			controls.enableDamping = true;
			controls.target = new Vector3(0, 1.5, 0);
		
		controlsUpdate = true;
	}

	scene.add(camera);

	if ( typeof buttonVR == 'undefined' ) {
		buildOrbitController();
	}

	// Set Lights
	var spotLightTopShadow = new SpotLight( 0x292E42 );
			spotLightTopShadow.position.set(-1.5, 3.05, -1.62);
			spotLightTopShadow.angle = (63 * (Math.PI / 180));
			spotLightTopShadow.penumbra = 0.25;
			spotLightTopShadow.decay = 2;
			spotLightTopShadow.distance = 200;
			spotLightTopShadow.intensity = 0.6;
			spotLightTopShadow.castShadow = true;
			spotLightTopShadow.shadow.mapSize.width = 512;
			spotLightTopShadow.shadow.mapSize.height = 512;
			spotLightTopShadow.shadow.camera.near = 0.1;
			spotLightTopShadow.shadow.camera.far = 200;
		scene.add( spotLightTopShadow );

	// Set Relight
	var lightIntensity = 1 ;
	var targetY = 2 ;
	var spotLightRelightBlue = new SpotLight( 0x45ADFF );
			spotLightRelightBlue.position.set(-2, 1.27, 2.1);
			spotLightRelightBlue.angle = (56 * (Math.PI / 180));
			spotLightRelightBlue.penumbra = 0.25;
			spotLightRelightBlue.decay = 2;
			spotLightRelightBlue.distance = 200;
			spotLightRelightBlue.intensity = lightIntensity;
			spotLightRelightBlue.castShadow = true;
			spotLightRelightBlue.shadow.mapSize.width = 512;
			spotLightRelightBlue.shadow.mapSize.height = 512;
			spotLightRelightBlue.shadow.camera.near = 0.1;
			spotLightRelightBlue.shadow.camera.far = 200;
		scene.add( spotLightRelightBlue );
			spotLightRelightBlue.target.position.y = targetY;
		scene.add( spotLightRelightBlue.target )

	var spotLightRelightRed = new SpotLight( 0xFF7E5A );
			spotLightRelightRed.position.set(2, 1.27, -2.1);
			spotLightRelightRed.angle = (56 * (Math.PI / 180));
			spotLightRelightRed.penumbra = 0.25;
			spotLightRelightRed.decay = 2;
			spotLightRelightRed.distance = 200;
			spotLightRelightRed.intensity = lightIntensity;
			spotLightRelightRed.castShadow = true;
			spotLightRelightRed.shadow.mapSize.width = 512;
			spotLightRelightRed.shadow.mapSize.height = 512;
			spotLightRelightRed.shadow.camera.near = 0.1;
			spotLightRelightRed.shadow.camera.far = 200;
		scene.add( spotLightRelightRed );
			spotLightRelightRed.target.position.y = targetY;
		scene.add( spotLightRelightRed.target )

	var spotLightRelightYellow = new SpotLight( 0xFFFAC6 );
			spotLightRelightYellow.position.set(0, 1.27, 3);
			spotLightRelightYellow.angle = (56 * (Math.PI / 180));
			spotLightRelightYellow.penumbra = 0.25;
			spotLightRelightYellow.decay = 2;
			spotLightRelightYellow.distance = 200;
			spotLightRelightYellow.intensity = lightIntensity;
			spotLightRelightYellow.castShadow = true;
			spotLightRelightYellow.shadow.mapSize.width = 512;
			spotLightRelightYellow.shadow.mapSize.height = 512;
			spotLightRelightYellow.shadow.camera.near = 0.1;
			spotLightRelightYellow.shadow.camera.far = 200;
		scene.add( spotLightRelightYellow );
			spotLightRelightYellow.target.position.y = targetY;
		scene.add( spotLightRelightYellow.target )

	// Set Renderer dimensions & append to HTML
	renderer.setSize(container.offsetWidth, container.offsetHeight);
	renderer.shadowMap.enabled = true;
	renderer.shadowMap.type = PCFSoftShadowMap;
	renderer.setPixelRatio( window.devicePixelRatio );
	container.appendChild(renderer.domElement);


	/******************
	* 4Dviews' WEB4DV *
	******************/
	// 4Dviews: Constructor(s)
	const sequences4D = []
	const player4D = {sequencesList: sequences4D, currentSequence: '', showControls: false, keepInCache: true};

	let timelineProgression = 0;

	let current4DSequence = null;

	function buildSequences() {

		let modelURL = null
		const params = new Proxy(new URLSearchParams(window.location.search), {
      	get: (searchParams, prop) => searchParams.get(prop),
    	})

		let modelLiveURL = params.model
    	let modelaudio = params.audio
    	const staticPath = 'https://storage.googleapis.com/risingstar_player/app'
    	modelLiveURL = staticPath + modelLiveURL
    	modelaudio = staticPath + modelaudio

		let model4DS01Id = 'pitch';
		//let model4DS01Path = 'https://risingstar_player.storage.googleapis.com/model/pitch';
		//let model4DS01Audio = 'https://risingstar_player.storage.googleapis.com/model/sound.wav';
		let model4DS01Position = sequencePosition;
		
		// Sequence 01
		let model4DS01Placeholder = new WEB4DS(model4DS01Id, 'https://risingstar_player.storage.googleapis.com/model/pitch_placeholder.4ds', 'https://risingstar_player.storage.googleapis.com/model/pitch_placeholder_mobile.4ds', '', model4DS01Position, renderer, scene, camera)

		//let model4DS01SD = new WEB4DS(model4DS01Id, model4DS01Path + '.4ds', model4DS01Path + '_mobile' +  '.4ds', model4DS01Audio, model4DS01Position, renderer, scene, camera);
		//let model4DS01MD = new WEB4DS(model4DS01Id, model4DS01Path + '.4ds', model4DS01Path + '_mobile' +  '.4ds', model4DS01Audio, model4DS01Position, renderer, scene, camera);
		//let model4DS01HD = new WEB4DS(model4DS01Id, model4DS01Path + '.4ds', model4DS01Path + '_mobile' +  '.4ds', model4DS01Audio, model4DS01Position, renderer, scene, camera);

		let model4DS01SD = new WEB4DS(model4DS01Id, modelLiveURL, modelLiveURL, modelaudio, model4DS01Position, renderer, scene, camera);
		let model4DS01MD = new WEB4DS(model4DS01Id, modelLiveURL, modelLiveURL, modelaudio, model4DS01Position, renderer, scene, camera);
		let model4DS01HD = new WEB4DS(model4DS01Id, modelLiveURL, modelLiveURL, modelaudio, model4DS01Position, renderer, scene, camera);


		const model4DS01 = {placeholder: model4DS01Placeholder, sd: model4DS01SD, md: model4DS01MD, hd: model4DS01HD, isLoaded: false, currentQuality: ''};

		// Sequence List
		sequences4D.push(model4DS01);

		// Player 4D
			player4D.currentSequence = player4D.sequencesList[0];

				player4D.currentSequence.sd.load(true, false, function() {
					timelineProgression = player4D.currentSequence.sd.currentFrame;
					// player4D.currentSequence.placeholder.toggleStreaming(player4D.keepInCache);
					// console.log(player4D.currentSequence.placeholder);
				});
				player4D.currentSequence.isLoaded = true;
				
				player4D.currentSequence.currentQuality = 'sd';
	}


	// 4Dviews: UI
	const timelineFill = document.getElementById('elem-webplayer-timeline-fill');

	function updateTimeline(elem) {
		
		if ( timelineFill !== null ) {
			if ( elem ) {
				var currentQuality = elem.currentQuality;
				let progress = Math.round( (elem[currentQuality].currentFrame / elem[currentQuality].sequenceTotalLength) * 100 );

				timelineFill.style.width = progress + '%';
			}
		}
	}

	var buttonDestroyLoad = document.getElementById('btn-webplayer-load');
		if( buttonDestroyLoad !== null ) {
			buttonDestroyLoad.addEventListener('click', function(){
							
				let currentQuality = player4D.currentSequence.currentQuality;
				player4D.currentSequence[currentQuality].play();
				buttonPlayPause.classList.remove('play');
				buttonPlayPause.classList.add('pause');
				buttonPlayPause.style.backgroundImage  = "url('./img/icon/playback/pause.png')";
				buttonDestroyLoad.style.display = 'none';
				
			});
		}

		
	var buttonPlayPause = document.getElementById('btn-webplayer-playPause');
		function togglePlayPause(elem) {
			if (elem !== null) {

				let currentQuality = player4D.currentSequence.currentQuality;

				if (player4D.currentSequence[currentQuality].isPlaying){
					player4D.currentSequence[currentQuality].pause()
					elem.classList.remove('pause');
					elem.classList.add('play');
					elem.style.backgroundImage  = "url('./img/icon/playback/pause.png')";
				} else {
					player4D.currentSequence[currentQuality].play();
					elem.classList.remove('play');
					elem.classList.add('pause');
					elem.style.backgroundImage  = "url('./img/icon/playback/play.png')";
				}
			}	
		}
		if (buttonPlayPause !== null) {
			buttonPlayPause.addEventListener('click', function(){
				
				if ( buttonPlayPause.classList.contains("playing") ) {
					buttonPlayPause.classList.remove('playing');
				} else {
					buttonPlayPause.classList.add('playing');
				}
				
	//			playPause();
				buttonDestroyLoad.style.display = 'none';
				togglePlayPause(buttonPlayPause);
			});
		}

		buttonPlayPause.classList.remove('pause');
		buttonPlayPause.classList.add('play');
		buttonPlayPause.style.backgroundImage  = "url('./img/icon/playback/play.png')";

		var buttonStop = document.getElementById('btn-webplayer-stop');
		if( buttonStop !== null ) {
			buttonStop.addEventListener('click', function(){
				let currentQuality = player4D.currentSequence.currentQuality;
				player4D.currentSequence[currentQuality].destroy(function(){
				player4D.currentSequence.sd.load(true, true);
				buttonPlayPause.classList.remove('pause');
				buttonPlayPause.classList.add('play');
				buttonPlayPause.style.backgroundImage  = "url('./img/icon/playback/play.png')";
				
				
			});
		});
	}

	var buttonWrapper = document.getElementById('hologalleryControllersWrapper');
	var buttonPin = document.getElementById('btn-webplayer-pin');
		if (buttonPin !== null) {
			
			buttonPin.addEventListener('click', function(){
				
				if ( buttonPin.classList.contains("pinned") ) {
					buttonPin.classList.remove('pinned');
				} else {
					buttonPin.classList.add('pinned');
				}
				
				if ( buttonWrapper.classList.contains("pinned") ) {
					buttonWrapper.classList.remove('pinned');
				} else {
					buttonWrapper.classList.add('pinned');
				}
			});
		}

	
	var buttonMuteUnmute = document.getElementById('btn-webplayer-audio');
		if( buttonMuteUnmute !== null ) {
			
			buttonMuteUnmute.addEventListener('click', function(){
				
				let currentQuality = player4D.currentSequence.currentQuality;
				
				if ( player4D.currentSequence[currentQuality].isMuted ) {
					player4D.currentSequence[currentQuality].unmute()
						buttonMuteUnmute.classList.remove('muted');
				} else {
					player4D.currentSequence[currentQuality].mute();
						buttonMuteUnmute.classList.add('muted');
				}
			});
			
		}

	var buttonStats = document.getElementById('btn-webplayer-stats');
		function display4DStats(isStats) {

			var elemStats = document.getElementById("web4dv-stats");

			if(isStats) {
				elemStats.style.display = "block";    
				isStats = false;
			} else {
				elemStats.style.display = "none";
				isStats = true;
			}
		}
		function update4DStats() {
			
			let currentQuality = player4D.currentSequence.currentQuality;			
			let sequence = player4D.currentSequence[currentQuality];			
			
			if ( typeof sequence !== "undefined" ) {

				if(sequence.keepInCache !== true)
					var sequenceCacheOption = "Streaming";
				else
					var sequenceCacheOption = "Cached";

				document.getElementById('web4dv-fnow').innerHTML = sequence.currentFrame;
				document.getElementById('web4dv-fnum').innerHTML = sequence.sequenceTotalLength;
	//			document.getElementById('web4dv-fps').innerHTML = sequenceFramerate;
				document.getElementById('web4dv-txsize').innerHTML = sequence.textureSizeY + "p";
	//			document.getElementById('web4dv-cache-opt').innerHTML = sequenceCacheOption;
				document.getElementById('web4dv-cache-max').innerHTML = sequence._maxCacheSize;
				document.getElementById('web4dv-cache-now').innerHTML = sequence.meshesCache.length;
				document.getElementById('web4dv-decoded-last').innerHTML = sequence.sequenceDecodedFrames.slice(-1)[0];
			
	//			console.log(sequence);
				
			}
		}
		function statsOnOff(){
			if( buttonStats.classList.contains('active') )
				display4DStats(true);
			else
				display4DStats(false);
		}
		if (buttonStats !== null) {
			
			buttonStats.addEventListener('click', function(){
				
				if ( buttonStats.classList.contains("active") ) {
					buttonStats.classList.remove('active');
				} else {
					buttonStats.classList.add('active');
				}
				
				statsOnOff();
			});
		}

	var buttonTimeline = document.getElementById('elem-webplayer-timeline-fill');
	var timeline4DObject = buttonTimeline[0];
		if (buttonTimeline !== null) {
			
			buttonTimeline.addEventListener('click', function(){
				
				var rec = timeline4DObject.getBoundingClientRect();
				let x = ev.pageX - (rec.left + window.scrollX);

				let totalFrames = resourceManager._sequenceInfo.NbFrames;

				if(totalFrames > 0)
					var ratio = timeline4DObject.offsetWidth / totalFrames ;
				else
					var ratio = 1;

				let frame = x / ratio;

				console.log(" seek frame: " + frame);

				gotoFrame(frame);
			});
		}


	// EVENT LISTENER: Fullscreen Option (Escape Key Behavior)
	document.addEventListener('fullscreenchange', function(e) {
		if(!document.fullscreen){
			
			canvas.classList.remove("fullscreen");
			buttonFullscreen.classList.remove('fullscreen');

		}
	});
	
	
	
	
		
	function goFullscreen() {
		var screenWidth = window.screen.width;
		var screenHeight = window.screen.height;
			
		canvas.classList.toggle("fullscreen");
		
		if(canvas.classList.contains("fullscreen")){
			if (canvas.requestFullscreen) {
				canvas.requestFullscreen();
			} else if (canvas.mozRequestFullScreen) { /* Firefox */
				canvas.mozRequestFullScreen();
			} else if (canvas.webkitRequestFullscreen) { /* Chrome, Safari & Opera */
				canvas.webkitRequestFullscreen();
			} else if (canvas.msRequestFullscreen) { /* IE/Edge */
				canvas.msRequestFullscreen();
			}
			
			if(screen.width < 561){
				screen.orientation.lock("landscape-primary");
				if(renderer){
					renderer.setSize(screen.width*window.devicePixelRatio, screen.height*window.devicePixelRatio);
				}
			} else{
				if(renderer){
					renderer.setSize(screen.width*window.devicePixelRatio, screen.height*window.devicePixelRatio);
				}
			}
			
			controls.autoRotate = false;
			controls.minDistance = 0.5;
			
			camera.aspect = container.offsetWidth / container.offsetHeight;
			camera.updateProjectionMatrix();
			renderer.setSize(container.offsetWidth, container.offsetHeight);
			
		} else{
			if (document.exitFullscreen) {
				document.exitFullscreen();
			} else if (document.mozCancelFullScreen) { /* Firefox */
				document.mozCancelFullScreen();
			} else if (document.webkitExitFullscreen) { /* Chrome, Safari and Opera */
				document.webkitExitFullscreen();
			} else if (document.msExitFullscreen) { /* IE/Edge */
				document.msExitFullscreen();
			}
			
			if(screen.width < 561){
				screen.orientation.unlock();
			}
			
			if(renderer){
				renderer.setSize(container.offsetWidth, container.offsetHeight);
			}
			
			controls.autoRotate = true;
			controls.minDistance = 5;
			
			resizingWindow();
		}
		
		
	}
	// FULLSCREEN UX
	// TO DO INVERT ORBIT MOUSE KEY
	// LEFT do nothing but playPause
	// RIGHT rotate (or other way ?)
	//canvas.addEventListener('click', function(){
	//
	//	if(canvas.classList.contains("fullscreen")){
	//		togglePlayPause(buttonPlayPause);
	//	}
	//});

	window.addEventListener('keydown', function(e){

		if(e.keyCode == 32){ 
			togglePlayPause(buttonPlayPause);		
			e.preventDefault();
		}
	});






	var controlsWrapper = document.getElementById('webplayer-homepage-controls-wrapper');
		if( controlsWrapper !== null ) {		
			
			controlsWrapper.addEventListener( 'mouseenter', function () {			
				if ( player4D != 'undefined' && player4D.showControls ) {
					var controlsContainer = document.getElementById('webplayer-homepage-controls');
						controlsContainer.style.opacity = 1;
						controlsContainer.style.visibility = 'visible';
				}
			});
			controlsWrapper.addEventListener( 'mouseleave', function () {
				
				let currentQuality = player4D.currentSequence.currentQuality;
				
				if ( player4D.currentSequence[currentQuality].isLoaded ) {
					var controlsContainer = document.getElementById('webplayer-homepage-controls');
						controlsContainer.style.opacity = 0;
						controlsContainer.style.visibility = 'hidden';
				}
			});
		}

	if( typeof buttonVR != 'undefined' ) {
		buttonVR.addEventListener('click', function(){
			
			if ( buttonVR.classList.contains('vravailable') ) {
				
				let currentQuality = player4D.currentSequence.currentQuality;
			
				isVR = true;
				isAR = false;

				player4D.currentSequence[currentQuality].destroy( function() {
					player4D.currentSequence.sd.position = [0,0,-2];
					player4D.currentSequence.sd.load(false, true, function() {
						player4D.currentSequence.sd.mesh.castShadow = false;
					});
					player4D.currentSequence.isLoaded = true;
					
					player4D.currentSequence.currentQuality = 'sd';

					player4D.showControls = true;

					textQuality.innerHTML = '720p';
				});
			}
			
		});
	}else {
		// alert('debug');
	}

	if( typeof buttonAR != 'undefined' ) {
		buttonAR.addEventListener('click', function(){
			 document.getElementById('scanimg').style.display = 'block';
			 document.getElementById('info').style.display = 'block';
				
			
			if ( buttonAR.classList.contains('aravailable') ) {
				
				let currentQuality = player4D.currentSequence.currentQuality;
			
				isVR = false;
				isAR = true;

				player4D.currentSequence[currentQuality].destroy( function() {
					player4D.currentSequence.isLoaded = false;
					
					player4D.currentSequence.currentQuality = 'sd';

					player4D.showControls = true;

					textQuality.innerHTML = '720p';
				});
			}
		});
	}


	/******************
	* GLOBAL FUNCTION *
	******************/
	function resizingWindow(){
		camera.aspect = container.offsetWidth / container.offsetHeight;
		camera.updateProjectionMatrix();
		renderer.setSize(container.offsetWidth, container.offsetHeight);
	}
	window.addEventListener("resize", resizingWindow);
	resizingWindow();


	/**************
	* XR THREE.JS *
	**************/
	var hitTestSource = null;
	var hitTestSourceRequested = false;
	var renderAR = false;
	var controller;
	var gridHelper;
	var cube;
	var isSpawned =false;
	renderer.xr.addEventListener( 'sessionstart', function ( event ) {
		
		console.log("XR session started");
		console.log("isAR: "+isAR);
		
		if ( isAR ) {
			
			renderAR = true;
			this.gestures = new ControllerGestures( this.renderer );

			reticle = new Mesh(
							new RingBufferGeometry( 0.06, 0.10, 32 ).rotateX( - Math.PI / 2 ),
							new MeshBasicMaterial()
						);
			reticle.visible = false;
			reticle.matrixAutoUpdate = false;
			scene.add(reticle);
			// gridHelper.visible = false;
			
			if( plane.visible == true )
				plane.visible = false;
			
			let currentQuality = player4D.currentSequence.currentQuality;
				current4DSequence = player4D.currentSequence;

			
			if ( current4DSequence.isLoaded ) {
				current4DSequence[currentQuality].destroy(function() {
					current4DSequence.sd.load(false);
					current4DSequence.isLoaded = true;
					
					current4DSequence.currentQuality = 'sd';
				});
			}

			this.gestures.addEventListener( 'pinch', (ev)=>{
				//console.log( ev );  
				if (ev.initialise !== undefined){
					self.startScale = self.current4DSequence.object.scale.clone();
				}else{
					const scale = self.startScale.clone().multiplyScalar(ev.scale);
					self.current4DSequence.object.scale.copy( scale );
					
				}
			});

			function onSelect() {
				
				console.log("touch screen");
				
				if ( reticle.visible ) {
					
					console.log('AR sequence: '+current4DSequence);
					
					if ( !current4DSequence.isLoaded ){
						current4DSequence.sd.load(false);
							current4DSequence.isLoaded = true;
							
							current4DSequence.currentQuality = 'sd';
							console.log('loading AR sequence');
					} else {
						var overlayBanners = document.getElementsByClassName('info-area');

						for (var i = 0; i < overlayBanners.length; i ++) {
						    overlayBanners[i].style.display = 'none';
						}
						scene.remove(reticle);
						console.log("removed reticle");
						isSpawned = true;
						setPosition();
						console.log('setting position on AR sequence');
					}
				} else {
					console.log('AR reticle not visible');
				}
			}

			function setPosition() {


				
				let currentQuality = player4D.currentSequence.currentQuality;					
				
					current4DSequence[currentQuality].model4D.mesh.position.set(0,-1,-2).applyMatrix4( reticle.matrix);
					
					console.dir(current4DSequence[currentQuality]);
					console.log(current4DSequence[currentQuality].model4D.mesh.position);
					
					
					// var mesh4D = scene.getObjectByName('mesh4D');
					// mesh4D.position.setFromMatrixPosition( reticle.matrix );
					//mesh4D.scale.x = 0.15;
					//mesh4D.scale.y = 0.15;
					//mesh4D.scale.z = 0.15;

			}

			controller = renderer.xr.getController(0);
			controller.addEventListener( 'select', onSelect );
			scene.add(controller);
		}	
	});

	renderer.xr.addEventListener( 'sessionend', function ( event ) {
		
		if ( isAR ) {
			if ( current4DSequence.isLoaded ) {
				current4DSequence[currentQuality].destroy( function() {
					current4DSequence.sd.load(false);
					current4DSequence.isLoaded = true;
					
					current4DSequence.currentQuality = 'sd';
				});
				scene.remove(reticle);
				console.log("removed reticle");

				if( plane.visible == false )
					plane.visible = true;
				// gridHelper.visible = true;
			}
			renderAR = false;
		}
		
	});

	function init() {
		buildSequences();
		isInit = true;
		
	}
	/********************************
	* THREE JS Standard Render Loop *
	********************************/
	// Rendering the scene at 60 FPS
	function animate() {
		
		renderer.setAnimationLoop( function (timestamp, frame) {
			
			// AR session
			if (renderAR && frame && isAR) {

				var referenceSpace = renderer.xr.getReferenceSpace();				
				var session = renderer.xr.getSession();

				if (hitTestSourceRequested === false) {
					session.requestReferenceSpace('viewer').then(function (referenceSpace) {
						session.requestHitTestSource({ space: referenceSpace }).then(function (source) {
							hitTestSource = source;					
						});
					});
					session.addEventListener('end', function () {
						hitTestSourceRequested = false;
						hitTestSource = null;
					});
					hitTestSourceRequested = true;
				}

				if (hitTestSource) {

					var hitTestResults = frame.getHitTestResults(hitTestSource);
					
					if (hitTestResults.length) {
						var hit = hitTestResults[0];
						reticle.visible = true;
						reticle.matrix.fromArray(hit.getPose(referenceSpace).transform.matrix);
						//document.getElementById("overlay").visible = "false";
						// var overlayBanners = document.getElementsByClassName('info-area');

						// for (var i = 0; i < overlayBanners.length; i ++) {
						//     overlayBanners[i].style.display = 'none';
						// }
						document.getElementById('scanimg').style.display = 'none';
						if(isSpawned){
							document.getElementById('info').style.display = 'none';
							var overlayBanners = document.getElementsByClassName('info-area');

						for (var i = 0; i < overlayBanners.length; i ++) {
						    overlayBanners[i].style.display = 'none';
						}
							
						}
						else{
							document.getElementById('info').innerHTML = "Double tap the circle to place the model" ;
						}
			 			


					} else {
						var overlayBanners = document.getElementsByClassName('info-area');

						for (var i = 0; i < overlayBanners.length; i ++) {
						    overlayBanners[i].style.display = 'block';
						}
						reticle.visible = false;
						console.log('DEBUG: 1031');

					}
				}
			} else {
				/************************************************
				* EXAMPLE 4Dviews' WEB4DV function calls in Loop *
				*************************************************/
				if (current4DSequence && current4DSequence.isLoaded === true) {
					updateSequenceInfos();
					drawTimeline();
					console.log('DEBUG: 1041');
				} else {
					console.log('DEBUG: 1043');
				}
			}		
			
			renderer.render(scene, camera);
			
			if( controlsUpdate )
				controls.update();
			
			stats.update();
			
			var nowFps = stats.getFPS();

			// IF COMPUTER HAS LOW PERFORMANCE, HIDE THE WEBGL
			if( nowFps < 4 && document.hasFocus() ) {
					
				setTimeout( function(){
					
					var newFps = stats.getFPS();
					// console.log("New FPS: "+newFps);	
					// restesting to avoid window blur FPS dropdown
					if( newFps < 4 ) {
						
						let webglWrapper = document.getElementById("demopage-section-webgl");
						let webglWarning = document.getElementById("webgl-lowfps-advertisement");
						let webglWarningBtn = document.getElementById("webgl-lowfps-advertisement-btn");
																				 
						if ( webglWrapper != null && webglWrapper.classList.contains("checkfps") ) {

						   webglWrapper.style.display = "none";
						   webglWrapper.classList.add("disable");

						   if ( webglWarning != null ) {

								webglWarning.style.display = "block";

								if ( webglWarningBtn != null ) {

									webglWarningBtn.addEventListener('click', function(){

										webglWrapper.style.display = "block";
										webglWarning.style.display = "none";
										webglWrapper.classList.remove("disable");
										webglWrapper.classList.remove("checkfps");
										
										animate();

									});
								}
							}
							
							console.log('FPS TOO SLOW:'+newFps+' STOPPING WEBGL');

							renderer.setAnimationLoop(null);
							return;

						} else {

						}
					
					}
					
				}, 2000);
				
			} else if ( typeof nowFps != "undefined" ) {
				if ( !isInit ) {
					init();
				}
			} else {}
			
			updateTimeline(player4D.currentSequence);
			update4DStats();
			
		});
	}

	animate();