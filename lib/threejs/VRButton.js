class VRButton {
	
	static createButton( renderer, callback ) {
		
//		if ( options ) {
//
//			console.error( 'THREE.VRButton: The "options" parameter has been removed. Please set the reference space type via renderer.xr.setReferenceSpaceType() instead.' );
//
//		}

		const button = document.createElement( 'button' );

		function showEnterVR( /*device*/ ) {

			let currentSession = null;

			function onSessionStarted( session ) {

				session.addEventListener( 'end', onSessionEnded );

				renderer.xr.setSession( session );
				button.textContent = 'EXIT VR';

				currentSession = session;
				
				if( typeof isVR != 'undefined' )
					isVR = true;
					
				if( typeof isAR != 'undefined' )
					isAR = false;				
			}

			function onSessionEnded( /*event*/ ) {

				currentSession.removeEventListener( 'end', onSessionEnded );

				button.textContent = 'ENTER VR';

				currentSession = null;
				
				if( typeof isVR != 'undefined' )
					isVR = false;

			}

			//

			button.style.display = 'inline-block';
			
			button.classList.add('vravailable');

			button.style.cursor = 'pointer';
			button.style.left = 'calc(50% - 110px)';
			button.style.width = '100px';
			button.style.fontSize = '24px';

			button.textContent = 'ENTER VR';
			
			callback();

			button.onmouseenter = function () {

				button.style.opacity = '1.0';

			};

			button.onmouseleave = function () {

				button.style.opacity = '0.5';

			};

			button.onclick = function () {

				if ( currentSession === null ) {

					// WebXR's requestReferenceSpace only works if the corresponding feature
					// was requested at session creation time. For simplicity, just ask for
					// the interesting ones as optional features, but be aware that the
					// requestReferenceSpace call will fail if it turns out to be unavailable.
					// ('local' is always available for immersive sessions and doesn't need to
					// be requested separately.)

					const sessionInit = { optionalFeatures: [ 'local-floor', 'bounded-floor', 'hand-tracking' ] };
					navigator.xr.requestSession( 'immersive-vr', sessionInit ).then( onSessionStarted );

				} else {

					currentSession.end();

				}

			};

		}

		function disableButton() {

			button.style.display = 'none';
			
			button.classList.remove('vravailable');
			button.classList.add('vrnotavailable');

			button.style.cursor = 'pointer';
			button.style.left = 'calc(50% - 160px)';
			button.style.width = '150px';
			button.style.fontSize = '20px';

			button.onmouseenter = null;
			button.onmouseleave = null;

			button.onclick = null;

		}

		function showWebXRNotFound() {

			disableButton();

			button.textContent = 'VR NOT SUPPORTED';
			
			callback();

		}

		function stylizeElement( element ) {

			element.style.position = 'absolute';
			element.style.bottom = '60px';
			element.style.padding = '12px 6px';
			element.style.border = '1px solid #fff';
			element.style.borderRadius = '4px';
			element.style.boxSizing = 'border-box';
			element.style.background = 'rgba(0,0,0,0.1)';
			element.style.color = '#fff';
			element.style.font = 'normal 13px sans-serif';
			element.style.textAlign = 'center';
			element.style.opacity = '0.5';
			element.style.outline = 'none';
			element.style.zIndex = '999';

		}

		if ( 'xr' in navigator ) {

			button.id = 'VRButton';
			button.style.display = 'none';

//			stylizeElement( button );

			navigator.xr.isSessionSupported( 'immersive-vr' ).then( function ( supported ) {

				supported ? showEnterVR() : showWebXRNotFound();

			} );
			
			console.log('XR IN NAVIGATOR');

			return button;

		} else {

			const message = document.createElement( 'a' );

			if ( window.isSecureContext === false ) {

				message.href = document.location.href.replace( /^http:/, 'https:' );
				message.innerHTML = 'WEBXR NEEDS HTTPS'; // TODO Improve message
				
				message.style.left = 'calc(50% - 90px)';
				message.style.width = '180px';
				message.style.textDecoration = 'none';

				stylizeElement( message );
				
				return message;

			} else {

				message.href = 'https://immersiveweb.dev/';
				message.innerHTML = 'WEBXR NOT AVAILABLE ';
				
				console.log('WEBXR NOT SUPPORTED BY NAVIGATOR (like Firefox) ');

			}

			

		}

	}

}

export { VRButton };