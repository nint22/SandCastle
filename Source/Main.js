/***

 SandCastle - Falling Sand Experimental Game
 Copyright (c) CoreS2 - Software Solutions.  All rights reserved.
 
***/

// What are "block" sizes in pixels
var BlockSizeInPixels = 3;

// World size, in blocks
var WorldBlockCount = { width: 128, height: 128 };

// World data (tiles, etc.)
var WorldData = new Array( WorldBlockCount.width * WorldBlockCount.height );

// Camera properties
var ScreenSize = { width: 640, height: 480 };
var CameraPosition = { x:0, y:0 };

// Input management
var InputSpeeds = { horizontalMovement: 4 };

// Main application entry point
function main()
{
    // Get renderable surface
    var ctx = document.getElementById("MainCanvas").getContext("2d");
    
    // Register keyboard service
    RegisterKeyboard();
    
    // Define the draw loop (at 24hz)
    setInterval(function() {
        DrawFrame( ctx );
    }, 1000.0 / 24.0 );
}

function RegisterKeyboard()
{
    document.onkeydown = function(evt) {
        evt = evt || window.event;
        switch (evt.keyCode) {
            case 37:
                leftArrowPressed();
                break;
            case 39:
                rightArrowPressed();
                break;
        }
    };
}

function leftArrowPressed()
{
    CameraPosition.x -= InputSpeeds.horizontalMovement;
}

function rightArrowPressed()
{
    CameraPosition.x += InputSpeeds.horizontalMovement;
}

function DrawFrame( canvasContext )
{
    // Shorthand
    var ctx = canvasContext;
    
    // For each block, draw
    for( var yIndex = 0; yIndex < WorldBlockCount.height; yIndex++)
    {
        for( var xIndex = 0; xIndex < WorldBlockCount.width; xIndex++)
        {
            ctx.fillStyle = "rgb("
                + Math.floor( Math.random() * 256 ) + ","
                + Math.floor( Math.random() * 256 ) + ","
                + Math.floor( Math.random() * 256 ) + ")";
            ctx.fillRect( xIndex * BlockSizeInPixels + CameraPosition.x, yIndex * BlockSizeInPixels + CameraPosition.y, BlockSizeInPixels, BlockSizeInPixels );
        }
    }
}
