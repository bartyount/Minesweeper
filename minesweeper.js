// Run init funtion after page is loaded
window.onload = init;

// Enumerate Tile Types
const EMPTY = 0;
const MINE = 9;

// Initialize Game
function init() {
    
    // Initialize Game Parameters
    let numRows = 10;
    let numCols = 20;
    let numMines = 25;

    // Create the Board Model
    model.initBoard(numRows, numCols, numMines);
    
    // Build the HTML Board for Display
    view.buildHTMLBoard(model.numRows, model.numCols);
    
    // Assign Mouse Click Handlers to each tile
    let tiles = document.getElementsByClassName("tile");
    for (let i = 0; i < tiles.length; i++) {
        tiles[i].onclick = handleMouseClick;
        tiles[i].onmouseover = handleMouseOver;
        tiles[i].onmouseout = handleMouseOut;
    }
    
    // Disable Right Mouse Click Context Menu
    // since right mouse click is used to set flag tiles
    document.addEventListener("contextmenu", function(event) {
        event.preventDefault();
        handleMouseClick(event);
    }, false);

    console.log(model.boardModel);    
} // End init

// Mouseover Handler Hilites Tile Under Mouse
function handleMouseOver(event) {
    view.hiliteTile(event.target);
}

// Mouseout Handler un-hilites tile
function handleMouseOut(event) {
    view.unHiliteTile(event.target);
}

// Mouse Click Handler
function handleMouseClick(event) {
    // Get Clicked Button and Send to Controller
    if (event.button === 0) controller.leftClickTile(event.target);
    if (event.button === 2) controller.rightClickTile(event.target);
}

// Check that Coordinates are Within Board Bounds
function isCoordValid(row, col) {
    if (row >= 0 && row < model.numRows &&
        col >= 0 && col < model.numCols) {
        return true;
    }
    return false;
}


// For debugging if needed
function sleep(milliseconds) {
  var start = new Date().getTime();
  for (var i = 0; i < 1e7; i++) {
    if ((new Date().getTime() - start) > milliseconds){
      break;
    }
  }
}


let model = {
    numRows: 10,
    numCols: 10,
    numHiddenTiles: 100,
    numMines: 20,
    numFlags: 0,
    numFlaggedMines: 0,
    boardModel: [],
    
    // Create Board Model
    initBoard: function(numRows, numCols, numMines) {
        // Set Board Size and Number of Mines
        this.numRows = numRows;
        this.numCols = numCols;
        this.numMines = numMines;
        this.numHiddenTiles = numRows * numCols;
        
        
        // Initialize Board Model with 0s
        for (let row = 0; row < this.numRows; row++) {
            this.boardModel[row] = new Array(this.numCols).fill(0);
        }
        // Add Mines to Board Model
        for (let i = 0; i < this.numMines; i++) {
            let row = 0;
            let col = 0;
            
            // Find an un-mined coord to place a mine
            do {
                row = Math.floor(Math.random() * this.numRows);
                col = Math.floor(Math.random() * this.numCols);
            } while (this.boardModel[row][col] === MINE);
            this.boardModel[row][col] = MINE;
            
            // Increment Values Around Each Bomb
            for (let y = row-1; y <= row+1; y++) {
                for (let x = col-1; x <= col+1; x++) {
                    if (isCoordValid(y,x)) {
                        if (this.boardModel[y][x] !== MINE) {
                            this.boardModel[y][x]++;
                        }
                    }
                }
            }
        }
    },
    
    // Get Tile Value
    getTileValue: function(tile) {
        let tileId = tile.getAttribute("id").split("_");
        let row = Number(tileId[1]);
        let col = Number(tileId[2]);
        let value = model.boardModel[row][col];
        return value;
    },
    
    // Get Tile Coord
    getTileCoord: function(tile) {
        let tileId = tile.getAttribute("id").split("_");
        let row = Number(tileId[1]);
        let col = Number(tileId[2]);
        let coord = {row: row, col: col};
        return coord;
    }
};

let view = {
    // Build the HTML to display the tiles
    buildHTMLBoard: function(numRows, numCols) {
        // Header
        this.updateMarkedMines();
        
        // Determine percentage of window each tile should take
        let tile_width = Math.floor(100/numCols) + "%";

        // Iterate through each row
        for (let i = 0; i < numRows; i++) {
            let row = document.createElement("div");
            row.setAttribute('id', "row_" + i);
            row.setAttribute('class', 'row');
            board.appendChild(row);

            // Iterate through each cloumn in row 
            // and assign properties to each tile
            for(let j = 0; j < numCols; j++) {
                let tile = document.createElement("img");
                let tileId = "tile_" + i.toString() + "_" + j.toString();
                tile.setAttribute('id', tileId);
                tile.setAttribute('class', 'tile');
                tile.setAttribute('src', 'Assets/tile_hidden.png');
                tile.setAttribute('width', tile_width);
                tile.setAttribute('height', 'auto');
                row.appendChild(tile);
            } // for columns
        } // for rows
    }, // buildHTMLBoard
    
    // Update Mine Count in Game Display Header
    updateMarkedMines: function() {
        let numMineMarkersLeft = model.numMines - model.numFlags;
        
        // Convert number to string, split into array, then reverse
        numMineMarkersLeft = numMineMarkersLeft.toString().split("").reverse();
        
        // Pad array with zeros if 10s or 100s digits dont exist
        while (numMineMarkersLeft.length < 3) { numMineMarkersLeft.push("0") }
        
        // Create path to image that corresponds to the digits
        let mineCount_100s = "Assets/led_" + numMineMarkersLeft[2] + ".png";
        let mineCount_10s = "Assets/led_" + numMineMarkersLeft[1] + ".png";
        let mineCount_1s = "Assets/led_" + numMineMarkersLeft[0] + ".png";
        
        // Update the HTML Marker Elements to reflect new count
        document.getElementById("numMineMarkersLeft_100s").src = mineCount_100s;
        document.getElementById("numMineMarkersLeft_10s").src = mineCount_10s;
        document.getElementById("numMineMarkersLeft_1s").src = mineCount_1s;
    },
    
    // Hilite Tile
    hiliteTile: function(tile) {
        if(tile.src.endsWith("hidden.png")) {
            tile.src = "Assets/tile_focus_hidden.png";
        }
    }, // hiliteTile
    
    // Unhilite Tile
    unHiliteTile: function(tile) {
        if(tile.src.endsWith("focus_hidden.png")) {
            tile.src = "Assets/tile_hidden.png";
        }
    }, // un-hiliteTile
    
    // Toggle Flag
    toggleFlag: function(tile) {
        if (tile.src.endsWith("hidden.png")) {
            if(model.numFlags < model.numMines) {
                model.numFlags++;
                tile.src = "Assets/tile_flag.png";
            }
            if(model.getTileValue(tile) === MINE) {
                model.numFlaggedMines++;
            }
        } else if (tile.src.endsWith("flag.png")) {
            if(model.numFlags > 0) {
                tile.src = "Assets/tile_hidden.png";
                model.numFlags--;
                if(model.getTileValue(tile) === MINE) {
                    model.numFlaggedMines--;
                }
            }
        }
        this.updateMarkedMines();
    },
    
    // Update Tile
    updateTile: function(tile, tileName) {
        tile.src = "Assets/" + tileName + ".png";
        model.numHiddenTiles--;
//        if(model.numHiddenTiles <= model.numMines) {
//            let numMineMarkersLeftId = document.getElementById("numMineMarkersLeft");
//            numMineMarkersLeftId.innerHTML = "You're A Winner!!!";
//        }
    },
    
    // BOOM
    boom: function() {
        let tileName;
        let tileIdList = document.getElementsByClassName("tile");
        for(let i = 0; i < tileIdList.length; i++) {
            let tileValue = model.getTileValue(tileIdList[i]);
            switch(tileValue) {
                case EMPTY: tileName = "tile_empty"; break;
                case MINE: tileName = "tile_mine"; break;
                case 1: tileName = "tile_1"; break;
                case 2: tileName = "tile_2"; break;
                case 3: tileName = "tile_3"; break;
                case 4: tileName = "tile_4"; break;
                case 5: tileName = "tile_5"; break;
                case 6: tileName = "tile_6"; break;
                case 7: tileName = "tile_7"; break;
                case 8: tileName = "tile_8"; break;
            }
            this.updateTile(tileIdList[i], tileName);
        }
    }
};

let controller = {
    // rightClickTile Toggles Flag
    rightClickTile: function(tile) {
        if(tile.className == "tile") {
            view.toggleFlag(tile);
        }
    },
    
    // leftClickTile
    leftClickTile: function(tile) {
        // Do not clear a tile marked with a flag
        if (tile.src.endsWith("flag.png")) return true;

        // Get Coord and Value of Tile from Board Model
        let row = model.getTileCoord(tile).row;
        let col = model.getTileCoord(tile).col;
        let value = model.getTileValue(tile);

        // Assign new tile name
        tileName = "tile_" + value;
        
        // Clear Tiles
        if (value === EMPTY) {
            // Clear all connected empty tiles
            tileName === "tile_empty";
            this.clearTiles(row, col);
        } else if (value === MINE) {
            // Clear Mined Tile
            tileName = "tile_mine";
            view.updateTile(tile, tileName);
            view.boom();
        } else {
            view.updateTile(tile, tileName);
        }
    },
    
    // Recursively Clear Empty Tiles
    clearTiles: function(row, col) {
        
        // Get Tile Info
        let tileValue = model.boardModel[row][col];
        let tile = document.getElementById("tile_" + row.toString() + "_" + col.toString());
        let isTileHidden = tile.src.endsWith("hidden.png");

        // Clear Connected Empty and Numbered Tiles
        if(tileValue === MINE) {
            return true;
        } else if(tileValue > EMPTY && tileValue < MINE) {
            view.updateTile(tile, "tile_" + tileValue.toString());
            return true;
        } else if (tileValue === 0 && isTileHidden) {
            view.updateTile(tile, "tile_empty");
        } else {
            return true;
        }

        // Iterate Through Adjacent Empty Tiles
        for (let y = row-1; y <= row+1; y++) {
            for (let x = col-1; x <= col+1; x++) {
                let isThisCoord = y === row && x === col;
                if (isThisCoord == false && isCoordValid(y,x)) {
                    this.clearTiles(y,x);
                }
            }
        }

        return true;
    }

};
