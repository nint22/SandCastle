/***

 SandCastle - Falling Sand Experimental Game
 Copyright (c) CoreS2 - Software Solutions.  All rights reserved.
 
***/

/*** Globals & Constants ***/

// What are "block" sizes in pixels
var BlockSizeInPixels = 4;

// World size, in blocks
var WorldBlockCount = { width: 64, height: 64 };

// Camera properties
var ScreenSize = { width: 640, height: 480 };
var CameraPosition = { x:0, y:0 };

// Input management
var InputSpeeds = { horizontalMovement: 4 };

// Main world instance
var g_mainWorldManager = null;

/*** World Manager ***/

// Implemented as a singleton pattern
function WorldManager()
{
	// Initialize this world
	this.Initialize = function()
	{
		this.m_WorldData = new Array( WorldBlockCount.width * WorldBlockCount.height );
		
		// Fill with default air cell
		for( var yIndex = 0; yIndex < WorldBlockCount.height; yIndex++)
		{
			for( var xIndex = 0; xIndex < WorldBlockCount.width; xIndex++)
			{
				var i = yIndex * WorldBlockCount.width + xIndex;
				this.m_WorldData[ i ] = new Air();
			}
        }
        
	};
	
	// Given a copy of a WorldManager, manually copy over the tiles
	this.CopyInto = function(worldManager)
	{
		for( var yIndex = 0; yIndex < WorldBlockCount.height; yIndex++)
		{
			for( var xIndex = 0; xIndex < WorldBlockCount.width; xIndex++)
			{
				var i = yIndex * WorldBlockCount.width + xIndex;
				this.m_WorldData[ i ] = worldManager.m_WorldData[ i ];
			}
        }
	}
	
	// Get a cell at a position, origin is top-left; returns null on failure
	this.GetCell = function(x, y)
	{
		if( x < 0 || y < 0 || x > WorldBlockCount.width || y > WorldBlockCount.height )
			return null;
		
		return this.m_WorldData[ y * WorldBlockCount.width + x ];
	};
	
	// Set a cell at a position, origin is top-left; returns null on failure
	this.SetCell = function(x, y, cell)
	{
		if( x < 0 || y < 0 || x > WorldBlockCount.width || y > WorldBlockCount.height )
			return;
		
		this.m_WorldData[ y * WorldBlockCount.width + x ] = cell;
	};
	
	// Retrieve up / down / left / right; returns null when out of bounds
	this.GetUp = function(x, y) {
		return this.GetCell( x, y - 1 );
	}
	
	this.GetDown = function(x, y) {
		return this.GetCell( x, y + 1 );
	}
	
	this.GetLeft = function(x, y) {
		return this.GetCell( x - 1, y );
	}
	
	this.GetRight = function(x, y) {
		return this.GetCell( x + 1, y );
	}
	
	// Get all directly-adjacent cells (in order of up, right, down, left)
	this.GetAdjacentCells = function(x, y)
	{
		return [ this.GetUp(), this.GetRight(), this.GetDown(), this.GetLeft() ];
	}
	
	// Returns the count of non-air elements up/down/left/right
	this.GetAdjacentSolidCellCount = function(x, y)
	{
		var count = 0;
		var cells = this.GetAdjacentCells(x, y);
		for(var i = 0; i < 4; i++)
		{
			var cell = cells[i];
			if( cell != null & cell.m_id != AirID )
				count++;
		}
		return count;
	}
	
};

/*** Material Classes ***/

// List of all IDs
var AirID = -1;
var BedrockID = 0;
var SandID = 1;
var DirtID = 2;
var GoldID = 3;
var WaterID = 4;

// Air
function Air() {
	this.m_id = AirID;
	this.m_name = "Air";
    this.m_color = { r:191, g:255, b:254 };
    this.m_updateFunc = function( world, origin ) {
    };
};

// Cannot ever be destroyed
function Bedrock() {
	this.m_id = BedrockID;
	this.m_name = "Bedrock";
    this.m_color = { r:83, g:83, b:83 };
    this.m_updateFunc = function( world, origin ) {
    };
};

// Moves down
function Sand() {
	this.m_id = SandID;
    this.m_name = "Sand";
    this.m_color = { r:237, g:201, b:175 };
    this.m_updateFunc = function( world, origin ) {
        
        // What's below me? Keep falling if air (null)
        var cell = world.GetDown(origin.x, origin.y);
        if( cell != null && cell.m_id == AirID )
        {
        	return { x:origin.x, y:origin.y+1 };
        }
        else
        {
        	return null;
        }
    };
};

// Static placement
function Dirt() {
	this.m_id = DirtID;
	this.m_name = "Dirt";
    this.m_color = { r:150, g:108, b:74 };
    this.m_updateFunc = function( world, origin ) {
    };
};

// Static placement
function Gold() {
	this.m_id = GoldID;
	this.m_name = "Gold";
    this.m_color = { r:255, g:255, b:11 };
    this.m_updateFunc = function( world, origin ) {
    };
};

// Static placement
function Water() {
	this.m_id = WaterID;
	this.m_name = "Water";
    this.m_color = { r:31, g:85, b:255 };
    
    // Very simple water
    this.m_updateFunc = function( world, origin ) {
        
        // Expand to any cell below (three bottom)
        var rightToleft = Math.floor(Math.random() * 2)
        for(var x = -1; x <= 1; x++)
        {
        	var dx = x;
        	if( rightToleft )
        		dx = -x;
        	
        	var cell = world.GetDown(origin.x + dx, origin.y);
			if( cell != null && cell.m_id == AirID )
			{
				return { x:origin.x + dx, y:origin.y + 1 };
			}
        }
		
		// For-loop has failed to return, so we can't move down, so move to the right or left
		if( this.m_seekDir == 0 )
			cell = world.GetLeft(origin.x, origin.y);
		else if( this.m_seekDir == 1 )
			cell = world.GetRight(origin.x, origin.y);
		
		// If there is data and it's just air, move into it
		if( cell != null && cell.m_id == AirID )
		{
			return { x:origin.x + ( this.m_seekDir == 0 ? -1 : +1 ), y:origin.y };
		}
		// Else, failure, try other direction next update loop
		else
		{
			this.m_seekDir = Math.floor(Math.random() * 2);
		}
    };
    
    // Water specific state variables
    this.m_seekDir = Math.floor(Math.random() * 2); // 0 - left, 1 - right
};

// Active cell type
var g_activeCell = new Sand();

/*** Game Update Loot ***/

// Main application entry point (JQuery on-load)
$(function()
{
    // Get renderable surface
    var ctx = $("#MainCanvas")[0].getContext("2d");
    
    // Initialize main world
    g_mainWorldManager = new WorldManager();
    g_mainWorldManager.Initialize();
    
    // Build the ground: just a sum of different sin waves, then a row of bedrock at the bottom
	for( var xIndex = 0; xIndex < WorldBlockCount.width; xIndex++)
	{
		var surfaceLoc =
			Math.floor( (Math.sin( xIndex * 0.1 ) + 1) * 2 ) + 35;
		
		for( var yIndex = surfaceLoc; yIndex < WorldBlockCount.height; yIndex++ )
		{
			var isGold = (Math.floor( Math.random() * 100 ) == 0);
			g_mainWorldManager.SetCell(xIndex, yIndex, isGold ? new Gold() : new Dirt());
			if( yIndex == WorldBlockCount.height - 1 )
				g_mainWorldManager.SetCell(xIndex, yIndex, new Bedrock());
		}
	}
	
	// Place sand in a few spots for testing
	g_mainWorldManager.SetCell(10, 10, new Sand());
	g_mainWorldManager.SetCell(11, 11, new Sand());
	g_mainWorldManager.SetCell(12, 12, new Sand());
	
    // Register keyboard / input service
    RegisterInputs();
    
    // Define the draw loop (at 5hz)
    setInterval(function() {
    	UpdateFrame();
        DrawFrame( ctx );
    }, 1000.0 / 10.0 );
});

/*** Input & Graphics ***/

function RegisterInputs( canvasContext )
{
    // Shorthand
    var ctx = canvasContext;
    var mouseDown = false;
    
	$("#MainCanvas")
	.attr("tabindex", "0")
	.mousedown(function(event){
	
		$(this).focus();
		mouseDown = true;
	})
	.mouseup(function(event){
		mouseDown = false;
	})
	.mousemove(function(event){
	
		if( mouseDown )
		{
			var x = Math.floor( (event.pageX-$("#MainCanvas").offset().left) / BlockSizeInPixels );
			var y = Math.floor( (event.pageY-$("#MainCanvas").offset().top) / BlockSizeInPixels );
			
			g_mainWorldManager.SetCell(x,y,g_activeCell);
		}
		
	})
	.keydown(function(event){
		
		// Change tools
		if( event.which == 49 )
			g_activeCell = new Sand();
		else if( event.which == 50 )
			g_activeCell = new Bedrock();
		else if( event.which == 51 )
			g_activeCell = new Dirt();
		else if( event.which == 52 )
			g_activeCell = new Gold();
		else if( event.which == 53 )
			g_activeCell = new Water();
		else if( event.which == 48 )
			g_activeCell = new Air();
		
		// move left / right
        else if( event.which == 37 )
			leftArrowPressed();
        else if( event.which == 39 )
			rightArrowPressed();
	});
}

function leftArrowPressed()
{
    CameraPosition.x -= InputSpeeds.horizontalMovement;
}

function rightArrowPressed()
{
    CameraPosition.x += InputSpeeds.horizontalMovement;
}

function UpdateFrame()
{
	// Much like a back-buffer, we're going to write out the update logic to a different frame
    var tempWorldManager = new WorldManager();
    tempWorldManager.Initialize();
	
    for( var yIndex = 0; yIndex < WorldBlockCount.height; yIndex++)
    {
        for( var xIndex = 0; xIndex < WorldBlockCount.width; xIndex++)
        {
        	var cell = g_mainWorldManager.GetCell( xIndex, yIndex );
        	
        	// Cell has moved
        	var nextPos = cell.m_updateFunc( g_mainWorldManager, { x:xIndex, y:yIndex } );
        	if( nextPos != null && nextPos != undefined )
        	{
        		tempWorldManager.SetCell( nextPos.x, nextPos.y, cell );
        	}
        	
        	// Don't overwrite with air
        	else if( cell.m_id != AirID )
        	{
        		tempWorldManager.SetCell( xIndex, yIndex, cell );
        	}
        }
    }
    
    g_mainWorldManager.CopyInto( tempWorldManager );
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
        	// Retrieve cell
        	var cell = g_mainWorldManager.GetCell( xIndex, yIndex );
        	var rgbColor = { r:Math.floor( Math.random() * 256 ), g:Math.floor( Math.random() * 256 ), b:Math.floor( Math.random() * 256 ) };
        	
        	if( cell == null )
        	{
        		// Sky
        		rgbColor.r = 255;
        		rgbColor.g = 255;
        		rgbColor.b = 255;
        	}
        	else
        	{
        		// Cell color
        		rgbColor = cell.m_color;
        	}
        	
            ctx.fillStyle = "rgb(" + rgbColor.r + "," + rgbColor.g + "," + rgbColor.b + ")";
            ctx.fillRect( xIndex * BlockSizeInPixels + CameraPosition.x, yIndex * BlockSizeInPixels + CameraPosition.y, BlockSizeInPixels, BlockSizeInPixels );
        }
    }
}
