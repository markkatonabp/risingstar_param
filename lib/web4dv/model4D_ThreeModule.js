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

import { BufferGeometry,
		 BufferAttribute,
		 CompressedTexture,
		 RGBA_ASTC_8x8_Format,
		 RGB_S3TC_DXT1_Format,
		 RGBAFormat,
		 UnsignedByteType,
		 UVMapping,
		 ClampToEdgeWrapping,
		 LinearFilter,
		 MeshBasicMaterial,
		 Mesh,
		 DataTexture,
		 AudioListener,
		 PositionalAudio,
		 AudioLoader,
		 } from '../../lib/threejs/three.module.js'

export default class Model4D {
	constructor() {
		this.geometry = null
        this.material = null
        this.texture = null
        this.mesh = null

        this.textureSizeX = 0
        this.textureSizeY = 0

		this.audioListener = null 
        this.audioSound = null  
        this.audioLoader = null 
	}


    initMesh(vertices, uvs, indices, normals, textureEncoding, textureSizeX, textureSizeY, modelPosition) {
        this.geometry = new BufferGeometry()
        this.geometry.addAttribute('position', new BufferAttribute(vertices, 3))
        this.geometry.addAttribute('uv', new BufferAttribute(uvs, 2))
        this.geometry.addAttribute('normal', new BufferAttribute(normals, 3))
        this.geometry.setIndex(new BufferAttribute(indices, 1))
        this.geometry.dynamic = true

        if (textureEncoding === 164) {  // astc
            this.texture = new CompressedTexture(null, textureSizeX, textureSizeY,
                                                    RGBA_ASTC_8x8_Format, UnsignedByteType, UVMapping,
                                                    ClampToEdgeWrapping, ClampToEdgeWrapping,
                                                    LinearFilter, LinearFilter)
        } else if (textureEncoding === 100) {  // dxt
            this.texture = new CompressedTexture(null, textureSizeX, textureSizeY,
                                                    RGB_S3TC_DXT1_Format, UnsignedByteType, UVMapping,
                                                    ClampToEdgeWrapping, ClampToEdgeWrapping,
                                                    LinearFilter, LinearFilter)
        } else {  // rgba
            this.texture = new DataTexture(null, textureSizeX, textureSizeY, RGBAFormat,
                                                    UnsignedByteType, UVMapping,
                                                    ClampToEdgeWrapping, ClampToEdgeWrapping,
                                                    LinearFilter, LinearFilter)
        }

        this.textureSizeX = textureSizeX
        this.textureSizeY = textureSizeY
        this.material = new MeshBasicMaterial({ map: this.texture })
        
        this.mesh = new Mesh(this.geometry, this.material)
        this.mesh.name = 'mesh4D'
        this.mesh.position.x = modelPosition[0]
        this.mesh.position.y = modelPosition[1]
        this.mesh.position.z = modelPosition[2]
    }


    updateMesh(Verts, Faces, UVs, Normals, Texture, nbVerts, nbFaces)
    {
        /* update the buffers */
        this.geometry.attributes.position.array = Verts
        this.geometry.attributes.uv.array = UVs
        this.geometry.attributes.normal.array = Normals
        this.mesh.geometry.index.array = Faces

        /* flags */
        this.geometry.attributes.position.needsUpdate = true
        this.geometry.attributes.uv.needsUpdate = true
        this.geometry.attributes.normal.needsUpdate = true
        this.mesh.geometry.index.needsUpdate = true

        /* to use only part of the buffer */
        this.geometry.setDrawRange(0, nbFaces * 3)
        this.mesh.rotation.x = -1.57

        /* update the texture */
        const mipmap = { 'data': Texture, 'width': this.textureSizeX, 'height': this.textureSizeY }
        const mipmaps = []
        mipmaps.push(mipmap)

        this.texture.mipmaps = mipmaps
        this.texture.needsUpdate = true
    }
	
	setPosition(modelPositionVec3)
	{
		this.mesh.position.x = modelPositionVec3[0]
        this.mesh.position.y = modelPositionVec3[1]
        this.mesh.position.z = modelPositionVec3[2]
	}
	
	setRotation(modelOrientationVec3)
	{
		this.mesh.rotation.x = modelOrientationVec3[0]
		this.mesh.rotation.y = modelOrientationVec3[1]
		this.mesh.rotation.z = modelOrientationVec3[2]
	}


    initAudio(audioCtx) {
        this.audioListener = new AudioListener(audioCtx)
        this.audioSound = new PositionalAudio(this.audioListener)
    }

    loadAudioFile(audioFile, isAudioloaded, callback) {
        this.audioLoader = new AudioLoader()
        this.audioLoader.load(audioFile, (buffer) => {
            this.setAudioBuffer(buffer)
            isAudioloaded = true;
            callback()
        })
    }

    setAudioBuffer(buffer)
    {
        this.audioSound.setBuffer(buffer)
        this.audioSound.setLoop(false)
        this.audioSound.setVolume(0)
    }
}