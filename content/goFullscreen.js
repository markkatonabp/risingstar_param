import { canvas, renderer, controls, camera, container, resizingWindow } from './webplayer-demo';

function goFullscreen() {
	var screenWidth = window.screen.width;
	var screenHeight = window.screen.height;

	canvas.classList.toggle('fullscreen');

	if (canvas.classList.contains('fullscreen')) {
		if (canvas.requestFullscreen) {
			canvas.requestFullscreen();
		} else if (canvas.mozRequestFullScreen) {
			/* Firefox */
			canvas.mozRequestFullScreen();
		} else if (canvas.webkitRequestFullscreen) {
			/* Chrome, Safari & Opera */
			canvas.webkitRequestFullscreen();
		} else if (canvas.msRequestFullscreen) {
			/* IE/Edge */
			canvas.msRequestFullscreen();
		}

		if (screen.width < 561) {
			screen.orientation.lock('landscape-primary');
			if (renderer) {
				renderer.setSize(
					screen.width * window.devicePixelRatio,
					screen.height * window.devicePixelRatio
				);
			}
		} else {
			if (renderer) {
				renderer.setSize(
					screen.width * window.devicePixelRatio,
					screen.height * window.devicePixelRatio
				);
			}
		}

		controls.autoRotate = false;
		controls.minDistance = 0.5;

		camera.aspect = container.offsetWidth / container.offsetHeight;
		camera.updateProjectionMatrix();
		renderer.setSize(container.offsetWidth, container.offsetHeight);
	} else {
		if (document.exitFullscreen) {
			document.exitFullscreen();
		} else if (document.mozCancelFullScreen) {
			/* Firefox */
			document.mozCancelFullScreen();
		} else if (document.webkitExitFullscreen) {
			/* Chrome, Safari and Opera */
			document.webkitExitFullscreen();
		} else if (document.msExitFullscreen) {
			/* IE/Edge */
			document.msExitFullscreen();
		}

		if (screen.width < 561) {
			screen.orientation.unlock();
		}

		if (renderer) {
			renderer.setSize(container.offsetWidth, container.offsetHeight);
		}

		controls.autoRotate = true;
		controls.minDistance = 5;

		resizingWindow();
	}
}
