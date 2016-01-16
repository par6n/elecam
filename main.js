var app = require( 'app' ),
	browserWindow = require( 'browser-window' );
require( 'crash-reporter' ).start();

global.snapper = {
	takePhoto: function( data ) {
		data = data.replace( /^data:image\/\w+;base64,/, "" );
		var buf = new Buffer( data, 'base64' ),
			fs = require( 'fs' ),
			d = new Date(),
			app = require( 'app' ),
			savePath = app.getPath( 'pictures' ) + '/EleCam';

		if ( ! fs.existsSync( savePath ) )
			fs.mkdirSync( savePath );

		savePath = savePath + '/' + d.getFullYear() + '.' + ( d.getMonth() + 1 ) + '.' + d.getDate() + '@' + d.getHours() + '.' + d.getMinutes() + '.' + d.getSeconds() + '.jpg';
		app.addRecentDocument( savePath );
		fs.writeFile( savePath, buf );
	}
};

var mainWindow = null;
var shouldQuit = app.makeSingleInstance( function( commandLine, workingDir ) {
	if ( mainWindow ) {
		if ( mainWindow.isMinimized() ) mainWindow.restore();
		mainWindow.focus();
		mainWindow.reload();
	}

	return true;
} );
if ( shouldQuit ) {
	app.quit();
	return;
}

app.on( 'window-all-closed', function() {
	if ( process.platform != 'darwin' )
		app.quit();
} );

app.on( 'ready', function() {
	mainWindow = new browserWindow( {
		'min-width': 		1024,
		'min-height': 		768
	} );

	mainWindow.maximize();
	mainWindow.loadURL( 'file://' + __dirname + '/index.html' );
	// mainWindow.openDevTools(); // For debug purposes.

	mainWindow.on( 'closed', function() {
		mainWindow = null;
	} );
} );