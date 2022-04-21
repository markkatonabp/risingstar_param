// **********************************************************
//
// WEB4DV
// THREE.js plug-in for 4Dviews volumetric video sequences
//
// Version: 3.1.0
// Release date: 18-December 2020
//
// Copyright: 4D View Solutions SAS
// Authors: M.Adam & T.Groubet
//
// NOTE:
// ADD: import WEB4DS from 'yourpath/web4dvImporter.js'
// in your main script
// Then create a WEB4DS object with the right parameters
// Call yourObject.load() to start the streaming
// OPTIONS:
// - yourObject.load( bool showPlaceholder, bool playOnload, callback() )
// Then you can call:
// - play/pause
// - mute/unmute
// - destroy
// - get some info like currentFrame or sequenceTotalLength
//
// **********************************************************

import { default as ResourceManagerXHR, Decoder4D } from './web4dvResource.js'
import { default as Model4D } from './model4D_ThreeModule.js'

// 4Dviews variables
const resourceManager = new ResourceManagerXHR()
let waiterLoaded = false

// Script Path
const scripts = document.getElementsByTagName('script');
const path = scripts[scripts.length-1].src.split('?')[0];      // remove any ?query
const mydir = path.split('/').slice(0, -1).join('/')+'/';  // remove last filename part of path


// MAIN CLASS MANAGING A 4DS
export default class WEB4DS {
    constructor(id, urlD, urlM, urlA, position, renderer, scene, camera) {
        // properties
        this.id = id  // unique id
        this.urlD = urlD  // url Desktop format
        this.urlM = urlM  // url Mobile format
        this.urlA = urlA  // url Audio
        this.position = position
        this.renderer = renderer
        this.scene = scene
        this.camera = camera

        this.model4D = new Model4D()
        this.sequenceTotalLength = 0
        this.sequenceDecodedFrames = []
		
		// Options
		this.showPlaceholder = false
		this.playOnload = true

        // Status
        this.isLoaded = false
        this.isPlaying = false
        this.isAudioloaded = false
        this.isAudioplaying = false
        this.wasPlaying = true
        this.isDecoding = false
        this.isMuted = false

        // Audio
        this.audioListener = null 
        this.audioSound = null  
        this.audioLoader = null 
        // for cross browser compatibility
        let AudioContext = window.AudioContext || window.webkitAudioContext
        this.audioCtx = new AudioContext()
        this.gainNode = null
        this.audioStartOffset = 0
        this.audioStartTime = 0
        this.audioPassedTime = 0
        this.audioTrack = null
        this.audioLevel = null

        // Loop
        this.playbackLoop = null
        this.decodeLoop = null

        this.firstChunks = true

        this.currentMesh = null
        this.currentFrame = null

        this.meshesCache = []
		
		// Waiter
		this.waiterParent = this.renderer.domElement
		
		if ( this.waiterParent ) {
				this.waiterParent.style.zIndex = "1";

			this.waiterElem = document.createElement("div");	
			let waiterElemOpacity = 100;

			this.waiterElem.id = "web4dv-waiter";
				this.waiterElem.style.position = "absolute";
				this.waiterElem.style.backgroundImage = "red";
				this.waiterElem.style.top = "50%";
				this.waiterElem.style.left = "50%";
				this.waiterElem.style.width = "150px";
				this.waiterElem.style.height = "150px";
				this.waiterElem.style.marginTop = "-75px";
				this.waiterElem.style.marginLeft = "-75px";
				this.waiterElem.style.opacity = (waiterElemOpacity / 100);
				this.waiterElem.style.zIndex = "2";
			
			let waiterElemLogo = new Image(150, 150);
				waiterElemLogo.src = "lib/web4dv/waiter/waiter.gif";

			if ( waiterLoaded === false ) {
				this.waiterParent.parentNode.insertBefore(this.waiterElem, this.waiterParent.nextSibling);
				this.waiterElem.appendChild(waiterElemLogo);
				
				waiterLoaded = true;
			}
		}

    }

    initSequence(nbFrames, nbBlocs, framerate, maxVertices, maxTriangles, textureEncoding, textureSizeX, textureSizeY, modelPosition) {
        const vertices = new Float32Array(maxVertices * 3)
        const uvs = new Float32Array(maxVertices * 2)
        const indices = new Uint32Array(maxTriangles * 3)
        const normals = new Float32Array(maxVertices * 3)

        this.model4D.initMesh(vertices, uvs, indices, normals, textureEncoding, textureSizeX, textureSizeY, modelPosition)

		this.model4D.mesh.castShadow = true;
		this.model4D.mesh.frustumCulled = false;
		
        this.scene.add(this.model4D.mesh)
    }

    // methods
    load(showPlaceholder, playOnload, callback) {
        if (!this.isLoaded) {
			
			this.showPlaceholder = showPlaceholder
			this.playOnload = playOnload

            if (this.renderer.extensions.get('WEBGL_compressed_texture_astc')) {
                resourceManager.set4DSFile(this.urlM)
                Decoder4D.SetInputTextureEncoding(164)
            } else {
                resourceManager.set4DSFile(this.urlD)
                Decoder4D.SetInputTextureEncoding(100)
            }

            resourceManager.Open(() => {
                const si = resourceManager._sequenceInfo

                this.initSequence(si.NbFrames, si.NbBlocs, si.Framerate, si.MaxVertices, si.MaxTriangles, si.TextureEncoding, si.TextureSizeX, si.TextureSizeY, this.position)  // Get sequence information

                this.Decode()  // Start decoding, downloading

                this.loadAudio(this.urlA)
				
				let waiterHtml = document.getElementById("web4dv-waiter");
				
                const waiter = setInterval(() => {
					
                    if (this.meshesCache.length >= Decoder4D._maxCacheSize) {
                        clearInterval(waiter)  // Stop the waiter loop
						
						if ( this.waiterElem ) // Hide Waiter
							waiterHtml.style.display = "none";
						
						if (showPlaceholder === true) { // Placeholder equals frame 0
							
							//resourceManager.seek(0);

							// Display the frame 0
							const placeholder = this.meshesCache.shift() 
							this.updateSequenceMesh(placeholder.GetVertices(), placeholder.GetFaces(), placeholder.GetUVs(), placeholder.GetNormals(), placeholder.GetTexture(), placeholder.nbVertices, placeholder.nbFaces);
								
						} else { // Else, play sequence
							if (this.playOnload === true || this.playOnload == null)
								this.play()
							else
								alert('sequence is ready | showPlaceholder: ' + this.showPlaceholder + ' | playOnload: ' + this.playOnload)
						}
                    } else {
                        // Start waiter animation
                        if ( this.waiterElem && !this.waiterDisplayed ) { // Display waiter
							waiterHtml.style.display = "block";
							this.waiterDisplayed = true;
						} else {}
                    }
                }, 0.1)

                this.isLoaded = true
                this.sequenceTotalLength = si.NbFrames
                if (callback) {
                    callback()
                }
            })
        } else {
            alert('A sequence is already loaded. One sequence at a time.')
        }
    }

    updateSequenceMesh(Verts, Faces, UVs, Normals, Texture, nbVerts, nbFaces) {
        // stats.begin();

        this.model4D.updateMesh(Verts, Faces, UVs, Normals, Texture, nbVerts, nbFaces)
    }

    // Decode 4D Sequence
    Decode() {
        if (this.isDecoding)
            return
            console.log("decode")

        const dt = 1000.0 / (resourceManager._sequenceInfo.FrameRate * 3)

        /* Download a first pack of chunks at sequence init, bigger than the next ones */
        if (this.firstChunks ) {
            if (Decoder4D._chunks4D.length < resourceManager._sequenceInfo.NbFrames * 2) {
			
//				if (this.showPlaceholder === true) {
//					resourceManager._internalCacheSize = 2000000 // 2 Mo (1 frame 2880p)
//					Decoder4D._maxCacheSize = 1 // 1 frame
//				} else {
                	resourceManager._internalCacheSize = 2000000  // 20 Mo
					Decoder4D._maxCacheSize = 20 // 20 frames
//				}
				
				resourceManager.getBunchOfChunks()

                console.log('downloading first chunks')
            }

            this.firstChunks = false
        }
		
        /* Decoding loop, 3*fps */
        this.decodeLoop = setInterval(() => {
            this.isDecoding = true
			
            /* Do not decode if enough meshes in cache */
            if (Decoder4D._keepChunksInCache) {
                if (this.meshesCache.length >= resourceManager._sequenceInfo.NbFrames) {
                    return
                }
            } else if (this.meshesCache.length >= Decoder4D._maxCacheSize) {
                return
            }

            /* Decode chunk */
            const newmesh = Decoder4D.DecodeChunk()

            /* If a few chunks, download more */
            const maxCache = resourceManager._sequenceInfo.NbFrames * 2 < 300 ? resourceManager._sequenceInfo.NbFrames * 2 : 300

            if (Decoder4D._chunks4D.length < maxCache || (Decoder4D._keepChunksInCache === true && Decoder4D._chunks4D.length < resourceManager._sequenceInfo.NbFrames * 2)) {
                resourceManager._internalCacheSize = 6000000  // 6 Mo
				
//				if(this.showPlaceholder === false || this.showPlaceholder == null) {
                	resourceManager.getBunchOfChunks()
//				}
            }

            /* If mesh is decoded, we stock it */
            if (newmesh) {
                this.meshesCache.push(newmesh)
//                 alert("stop");
            } else {
                // console.log('pas de mesh')
            }

            if (typeof Decoder4D._decodedFrames !== 'undefined') {
                this.sequenceDecodedFrames = Decoder4D._decodedFrames
            }
        }, dt)

    }

    stopDecoding()
    {
        console.log('Stop decoding')
        clearInterval(this.decodeLoop)
        this.isDecoding = false
    }

    // For now, will pause any WEB4DV object created (function is generic)
    pause() {
        clearInterval(this.playbackLoop)
        this.isPlaying = false

        if (this.meshesCache >= Decoder4D._maxCacheSize) {
            this.stopDecoding()
        }
        this.pauseAudio()
    }

    // For now, will play any WEB4DV object created (function is generic)
    play() {
        if (this.isPlaying) {  // If sequence is already playing, do nothing
            return
        }

        this.showPlaceholder = false

        // If not decoding, decode
        this.Decode()

        const dt = 1000.0 / resourceManager._sequenceInfo.FrameRate
        
        this.playbackLoop = setInterval(() => {
            this.isPlaying = true

            const mesh = this.meshesCache.shift()  // get first mesh from cache

            if (mesh) {
                /* update buffers for rendering */
                this.updateSequenceMesh(mesh.GetVertices(), mesh.GetFaces(), mesh.GetUVs(), mesh.GetNormals(), mesh.GetTexture(), mesh.nbVertices, mesh.nbFaces)

                if (this.currentMesh) {
                    this.currentMesh.delete()
                }

                this.currentMesh = mesh
                this.currentFrame = mesh.frame

                if (!this.isMuted) {
                    if (this.isAudioloaded) {
                        if (mesh.frame === 0) {
                            this.restartAudio()
                        }

                        if (this.audioStartOffset + this.audioPassedTime > ((mesh.frame / resourceManager._sequenceInfo.FrameRate))) {
                            //console.log(`Audio Time: ${this.audioStartOffset + this.audioPassedTime}  - sequence time:  ${mesh.frame / resourceManager._sequenceInfo.FrameRate}`)
                            this.pauseAudio()
                        } else {
                            this.playAudio()
                            this.audioPassedTime = this.audioCtx.currentTime - this.audioStartTime
                        }
                    }
                }

              //  if (!this.wasPlaying) {
              //      this.pauseSequence()
              //      this.wasPlaying = true
              //  }

            } else if (!this.isMuted) {
                /* There is no mesh to be displayed YET, pause audio */
                this.pauseAudio()
            }
        }, dt)


    }

    loadAudio(audioFile) {
        if (typeof this.camera !== 'undefined') {
            this.model4D.initAudio(this.audioCtx)

            this.camera.add(this.model4D.audioListener)
            this.gainNode = this.audioCtx.createGain()

            if (audioFile !== '') {
                console.log(`loading audio file: ${audioFile}`)

                this.model4D.loadAudioFile(audioFile, this.isAudioloaded, () => {
                    this.gainNode.gain.value = 0.5
                    this.isAudioloaded = true
                })

            } else if (resourceManager._audioTrack !== 'undefined' && resourceManager._audioTrack !== [] && resourceManager._audioTrack != '') {
                console.log('loading internal audio ')

                this.audioCtx.decodeAudioData(resourceManager._audioTrack, (buffer) => {
                    this.model4D.setAudioBuffer(buffer)
                    this.gainNode.gain.value = 0.5
                    this.isAudioloaded = true
                })
            }
        } else {
            alert('Please add a camera to your scene or set your camera to var = camera. AudioListener not attached.')
        }
    }

    playAudio() {
        if (this.isAudioplaying === false) {
            this.audioTrack = this.audioCtx.createBufferSource()
            this.audioTrack.buffer = this.model4D.audioSound.buffer
            this.audioTrack.connect(this.gainNode)
            this.gainNode.connect(this.audioCtx.destination)

            this.audioStartOffset = this.currentFrame / resourceManager._sequenceInfo.FrameRate

            this.audioTrack.start(this.audioCtx.currentTime, this.audioStartOffset)
            //console.log(`start audio at time ${this.audioStartOffset} ; ${this.audioCtx.currentTime}`)

            this.isAudioplaying = true
            this.audioStartTime = this.audioCtx.currentTime
        }
    }

    pauseAudio() {
        if (this.isAudioplaying === true) {
            if (this.audioTrack) this.audioTrack.stop()

            this.isAudioplaying = false
        }
    }

    restartAudio() {
        console.log('restart audio playback')
        if (this.audioTrack) this.audioTrack.stop()
        this.isAudioplaying = false
        this.audioPassedTime = 0

        this.playAudio()
    }

    // For now, will mute any WEB4DV object created (function is generic)
    mute() {
        this.audioLevel = this.gainNode.gain.value
        console.log(`volume will be set back at:${this.audioLevel}`)

        this.gainNode.gain.value = 0
        this.isMuted = true
    }

    // For now, will unmute any WEB4DV object created (function is generic)
    unmute() {
        this.isMuted = false

        if (this.audioLevel) {
            this.gainNode.gain.value = this.audioLevel
        } else {
            this.gainNode.gain.value = 0.5
        }
    }

    keepsChunksInCache(booleanVal) {
        Decoder4D._keepChunksInCache = booleanVal
    }

    destroy(callback) {
        clearInterval(this.playbackLoop)
        this.stopDecoding()
        // clearInterval(renderLoop); // No more needed: renderLoop is managed outside

        if (this.model4D.audioSound) {
            if (this.audioTrack) {
                this.audioTrack.stop()
            }

            this.model4D.audioLoader = null
            this.model4D.audioSound = null
            this.model4D.audioListener = null

            this.audioStartTime = 0
            this.audioStartOffset = 0
            this.audioPassedTime = 0
        }

        resourceManager.reinitResources()

        if (this.isLoaded) {
            this.scene.remove(this.model4D.mesh)
        }

        this.isLoaded = false
        this.isPlaying = false
        this.isDecoding = false
        this.isAudioplaying = false
        this.isAudioloaded = false
        this.firstChunks = false

        this.currentMesh = null

        Decoder4D._chunks4D.forEach((element) => {
            element.delete()
        })
        this.meshesCache.forEach((element) => {
            element.delete()
        })

        this.meshesCache = []
        Decoder4D._chunks4D = []

        // Decoder4D.Destroy(); //No more needed: there is always an instance running

        // Reset Sequence Infos
        this.currentFrame = 0
        this.sequenceTotalLength = 0
        this.sequenceDecodedFrames = []
        Decoder4D._decodedFrames = []

        // Callback
        if (callback) {
            callback()
        }
    }

}

// ***********
// SPEED TEST *
// ***********

// Network speed
// let speedBps
// let speedKbps
// let speedMbps
// var imageAddr = "https://www.4dviews.com/media/speedtest.jpg";
// var downloadSize = 5425060; //bytes
//
// function ShowProgressMessage(msg) {
//    if (console) {
//        if (typeof msg == "string") {
//            console.log(msg);
//        } else {
//            for (var i = 0; i < msg.length; i++) {
//                console.log(msg[i]);
//            }
//        }
//    }
//
//    var oProgress = document.getElementById("progress");
//    if (oProgress) {
//        var actualHTML = (typeof msg == "string") ? msg : msg.join("<br />");
//        oProgress.innerHTML = actualHTML;
//    }
// }
//
// function InitiateSpeedDetection() {
//    ShowProgressMessage("Loading the image, please wait...");
//    window.setTimeout(MeasureConnectionSpeed, 1);
// };
//
// if (window.addEventListener) {
//    window.addEventListener('load', InitiateSpeedDetection, false);
// } else if (window.attachEvent) {
//    window.attachEvent('onload', InitiateSpeedDetection);
// }
//
// function MeasureConnectionSpeed() {
//    var startTime, endTime;
//    var download = new Image();
//    download.onload = function () {
//        endTime = (new Date()).getTime();
//        showResults();
//    }
//
//    download.onerror = function (err, msg) {
//        ShowProgressMessage("Invalid image, or error downloading");
//    }
//
//    startTime = (new Date()).getTime();
//    var cacheBuster = "?nnn=" + startTime;
//    download.src = imageAddr + cacheBuster;
//
//    function showResults() {
//        var duration = (endTime - startTime) / 1000;
//        var bitsLoaded = downloadSize * 8;
//        speedBps = (bitsLoaded / duration).toFixed(2);
//        speedKbps = (speedBps / 1024).toFixed(2);
//        speedMbps = (speedKbps / 1024).toFixed(2);
//        ShowProgressMessage([
//            "Your connection speed is:",
//            speedBps + " bps",
//            speedKbps + " kbps",
//            speedMbps + " Mbps"
//        ]);
//		var networkSpeedContainer = document.getElementById("networkSpeed");
//		networkSpeedContainer.innerHTML = (Math.ceil(speedMbps/8) + " Mo/s");
//    }
// }