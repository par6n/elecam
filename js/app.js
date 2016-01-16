window.addEventListener("DOMContentLoaded", function() {
	var timerPanelUp = false;
	var timerSec = 0;
	var snappingDisabled = false;

	var video = document.getElementById("video"),
		videoObj = { "video": true },
		canvas = document.getElementById( "shutterCanvas" ),
		context = canvas.getContext( '2d' ),
		errBack = function(error) {
			console.log("Video capture error: ", error.code); 
		};

	// Put video listeners into place
	if(navigator.getUserMedia) { // Standard
		navigator.getUserMedia(videoObj, function(stream) {
			video.src = window.URL.createObjectURL( stream );
		}, errBack);
	} else if(navigator.webkitGetUserMedia) { // WebKit-prefixed
		navigator.webkitGetUserMedia(videoObj, function(stream){
			video.src = window.URL.createObjectURL(stream);
		}, errBack);
	}

	var snapPhoto = function() {
		var w, h;
		h = video.clientHeight;
		w = (4 / 3) * h;
		canvas.width = w;
		canvas.height = h;
		context.drawImage( video, 0, 0, canvas.width, canvas.height );
		
		/*var imageData = context.getImageData( 0, 0, w, h );
		var data = imageData.data;

		for( var i = 0; i < data.length; i += 4 ) {
			var brightness = 0.34 * data[i] + 0.5 * data[i + 1] + 0.16 * data[i + 2];
			data[i] = brightness;
			data[i+1] = brightness;
			data[i+2] = brightness;
		}
		context.putImageData( imageData, 0, 0 );*/

		var img = canvas.toDataURL( 'image/jpeg' ),
			remote = require( 'remote' ),
			snapper = remote.getGlobal( 'snapper' );

		snapper.takePhoto( img );

		$( '#flashOverride' ).show( 0, function() {
			$( '#flashOverride' ).fadeOut( 800 );
		} );
		$( '#shutterCanvas' ).fadeIn( 500, function() {
			$( '#shutterCanvas' ).animate( { width: 0, height: 0 }, 500, function() {
				$( '#shutterCanvas' ).attr( 'style', '' );
			} );
		} );
	};
	window.snapPhoto = snapPhoto;

	var snapPhotoBtn = function() {
		var timer = parseInt( $( '.timerValue:checked' ).val() );

		if ( timer == 0 ) {
			snapPhoto();
		} else {
			timerSec = timer;
			$( '#snap' ).hide();
			$( '#timerCount' ).show();
			$( '#timerCount' ).html( timerSec ); 
			snappingDisabled = true;

			if ( timerPanelUp )
				$( '#timer' ).click();

			var tInterval = setInterval( function() {
				if ( timerSec > 0 ) {
					timerSec--;
					$( '#timerCount' ).html( timerSec );
				} else {
					snapPhoto();
					snappingDisabled = false;
					$( '#timerCount' ).hide();
					$( '#snap' ).show();
					clearInterval( tInterval );
				}
			}, 1000 );
		}
	};

	document.getElementById( 'snap' ).addEventListener( 'click', snapPhotoBtn );

	document.addEventListener( 'keyup', function( evt ) {
		console.log( evt.keyCode );
		if ( evt.keyCode == 13 && ! snappingDisabled ) {
			snapPhotoBtn();
		}
	} );

	var panelHeight = document.getElementById( 'timerPanel' ).clientHeight;
	$( '#timerPanel' ).css( { 'bottom': '-' + panelHeight + 'px' } );

	$( '#timer' ).click( function() {
		if ( ! timerPanelUp ) {
			$( '#timerPanel' ).animate( { bottom: '0px' } );
			$( '#timer' ).animate( { bottom: panelHeight } );
			timerPanelUp = true;
		} else {
			$( '#timerPanel' ).animate( { bottom: '-' + panelHeight } );
			$( '#timer' ).animate( { bottom: '0px' } );
			timerPanelUp = false;
		}
	} );

}, false);