const NROWS = 8;
const NCOLS = 8;
const INT_INIT = -1; // To initialise integers
const WHITE_PAWN_START = 2;
const BLACK_PAWN_START = 7;
const PiecesType = {
    "P" : "♙",
    "p" : "♟",
    "R" : "♖",
    "r" : "♜",
    "N" : "♘",
    "n" : "♞",
    "B" : "♗",
    "b" : "♝",
    "Q" : "♕",
    "q" : "♛",
    "K" : "♔",
    "k" : "♚",
}
const keyFromPiece = {
    "♙" : "P",
    "♟" : "p",
    "♖" : "R",
    "♜" : "r",
    "♘" : "N",
    "♞" : "n",
    "♗" : "B",
    "♝" : "b",
    "♕" : "Q",
    "♛" : "q",
    "♔" : "K",
    "♚" : "k",
}

const MOVES = {
    ROOK : [[-1, 0], [0, 1], [1, 0], [0, -1]],
    KNIGHT : [[-2, 1], [-1, 2], [1, 2], [2, 1], [2, -1], [1, -2], [-1, -2], [-2, -1]],
    BISHOP: [[-1, 1], [1, 1], [1, -1], [-1, -1]],
    KING: [[-1, 0], [-1, 1], [0, 1], [1, 1], [1, 0], [1, -1], [0, -1], [-1, -1]],
    PAWN: [[[0, 1], [-1, 1], [1, 1]], [[0, -1], [-1, -1], [1, -1]]]
    }

const COLOURS = {
    WHITE : "white",
    BLACK : "black"
}

const SQUARES = {
    LIGHT : "#3de482",
    DARK : "#0e9747",
    HIGHLIGHTED : "#0089fa",
    MOVES : "#00eece"
}

// Global Variables
let pieceSelected = "";
let cellSelected = "";
let turn = COLOURS.WHITE;
let gameOver = false;
let possibleMoves = [];
let enPassant = [[false, false, false, false, false, false ,false, false],
                    [false, false, false, false ,false, false, false, false]];
let castle = [[false, false], [false, false]]; 

// Initialise
$(document).ready(initBoard);

function isNum(number) {
    return !isNaN(number);
}

function initBoard() {
    let board = $("#board")[0];
    let counter = 0; // Used for alternating black squares

    // Initialises background color of square and events
    for(var i = 0; i < NROWS; i++) {
        for(var j = 0; j < NCOLS; j++) {
            let cell = board.rows[i].cells[j];
            cell.id = "" + (j + 1) + "," + (8 - i);
            cell.onclick = function() {
                clickCell(this);
            }
            if(counter % 2 == 0)
                cell.style.backgroundColor = SQUARES.LIGHT;
            else
                cell.style.backgroundColor = SQUARES.DARK;
            if(j != 7)
                counter ++;
        }
    }
    turn = COLOURS.WHITE; // White starts first, should be replaced
    // FEN string of default starting position
    loadFEN("2R5/4bppk/1p1p4/5R1P/4PQ2/5P2/r4q1P/7K", COLOURS.WHITE);
    // loadFEN("rnbqkbnr/8/8/8/8/8/8/RNBQKBNR");

    $("#input").submit((event) => {
        event.preventDefault();
        let FEN = $("#fen").val();
        let checked = $("#input input[type='radio']:checked").val();
        let color = (checked == "whitemove") ? COLOURS.WHITE: COLOURS.BLACK;
        loadFEN(FEN, color);
    });
    
}

function debugClickCell(cell) {
    var s = "This cell contains the piece: ";
    // const [x, y] = cell.id.split(",")
    let p = cell.innerHTML;
    if(p === "") {
        document.getElementById("debug").innerHTML = "Cell is empty!"
        return true;
    } else {
        document.getElementById("debug").innerHTML = s + p;
    }
    return true;
}

function clickCell(cell) {
    var errno = ["Cell is empty!", "Wrong colour!", "Invalid move!"]
    var errsq = document.getElementById("debug");
    const EMPTY = 0;
    const COLOUR = 1;
    const INVALID = 2;
    
    // Clear debug
    errsq.innerHTML = "&nbsp;";

    let p = cell.innerHTML;
    if (!isPieceSelected()) { // Select a piece

        // Square is unoccupied
        if(p === "") {
            errsq.innerHTML = errno[EMPTY];
            return;
        }

        // Is it your turn?
        if(turn != colourOfPiece(p)) {
            errsq.innerHTML = errno[COLOUR];
            return;
        }
        // document.getElementById("debug").innerHTML = resetBackground(cell.id);

        // Select the piece and the cell
        pieceSelected = p;
        cellSelected = cell.id;
        // Set background to show it has been selected
        cell.style.backgroundColor = SQUARES.HIGHLIGHTED;

        generateAllValidMoves(p, cell.id);
        return;
        
        
    } else { // Select a cell to move

        // Deselect piece
        if(cell.id == cellSelected) {
            resetBackground(cellSelected)
            pieceSelected = ""
            cellSelected = ""
            refreshCellBackgrounds();
            return;
        }

        // Reselect a piece
        if(p != "" && colourOfPiece(p) == turn) {
            resetBackground(cellSelected);
            pieceSelected = p;
            cellSelected = cell.id;
            cell.style.backgroundColor = SQUARES.HIGHLIGHTED;
            refreshCellBackgrounds();
            generateAllValidMoves(p, cell.id);
            return;
        }

        // Is it a legal move?
        if(isValidMove(cell.id)) {
            document.getElementById(cellSelected).innerHTML = "";
            resetBackground(cellSelected);
            cell.innerHTML = pieceSelected;
            pieceSelected = "";
            cellSelected = "";
            advanceTurn();
            refreshCellBackgrounds();
            return;
        }  

        // Invalid move
        errsq.innerHTML = errno[INVALID];
        return;
        
    }
}

function advanceTurn() {
    if(turn == COLOURS.WHITE) turn = COLOURS.BLACK;
    else turn = COLOURS.WHITE;
}

/**
 * @returns true if a piece is selected
 */
function isPieceSelected() {
    return pieceSelected != "";
}

/**
 * 
 * @param {PiecesType} HTMLpiece the innerHTML representation of a piece
 * @param {String} start 
 */
function generateAllValidMoves(HTMLpiece, start) {
    let list = [];
    let piece = keyFromPiece[HTMLpiece];
    let x = Number(start[0]);
    let y = Number(start[2]);

    switch(piece) {
        case "N": case "n": // Knight piece
            for(var i = 0; i < 8; i++) {
                let new_x = x + MOVES.KNIGHT[i][0];
                let new_y = y + MOVES.KNIGHT[i][1];
                let target = document.getElementById(new_x + "," + new_y);

                if(!isValidSquare(new_x, new_y)) // Not a valid square
                    continue;

                if(target.innerHTML != "" && colourOfPiece(target.innerHTML) == turn) // Ally piece
                    continue;

                list.push(new_x + "," + new_y);
            }
            break;
        case "R": case "r": // Rook piece
            for(var i = 0; i < 4; i++) {
                let new_x = x;
                let new_y = y;
                for(var j = 0; j < 8; j++) {
                    new_x = new_x + MOVES.ROOK[i][0];
                    new_y = new_y + MOVES.ROOK[i][1];
                    let target = document.getElementById(new_x + "," + new_y);

                    if(!isValidSquare(new_x, new_y)) // Not a valid square
                        break;
                    
                    if(target.innerHTML == "") {
                        list.push(new_x + "," + new_y);
                    } else if(colourOfPiece(target.innerHTML) == turn) {
                        break;
                    } else {
                        list.push(new_x + "," + new_y);
                        break;
                    }
                }

            }
            break;
            //
        case "B": case "b": // Bishop piece
            for(var i = 0; i < 4; i++) {
                let new_x = x;
                let new_y = y;
                for(var j = 0; j < 8; j++) {
                    new_x = new_x + MOVES.BISHOP[i][0];
                    new_y = new_y + MOVES.BISHOP[i][1];
                    let target = document.getElementById(new_x + "," + new_y);

                    if(!isValidSquare(new_x, new_y)) // Not a valid square
                        break;
                    
                    if(target.innerHTML == "") {
                        list.push(new_x + "," + new_y);
                    } else if(colourOfPiece(target.innerHTML) == turn) {
                        break;
                    } else {
                        list.push(new_x + "," + new_y);
                        break;
                    }
                }

            }
            break;
        case "Q": case "q": // Queen piece
            for(var i = 0; i < 8; i++) {
                let new_x = x;
                let new_y = y;
                for(var j = 0; j < 8; j++) {
                    new_x = new_x + MOVES.KING[i][0];
                    new_y = new_y + MOVES.KING[i][1];
                    let target = document.getElementById(new_x + "," + new_y);

                    if(!isValidSquare(new_x, new_y)) // Not a valid square
                        break;
                    
                    if(target.innerHTML == "") {
                        list.push(new_x + "," + new_y);
                    } else if(colourOfPiece(target.innerHTML) == turn) {
                        break;
                    } else {
                        list.push(new_x + "," + new_y);
                        break;
                    }
                }

            }
            break;
        case "K": case"k": // Temporary
            for(var i = 0; i < 8; i++) {
                let new_x = x + MOVES.KING[i][0];
                let new_y = y + MOVES.KING[i][1];
                let target = document.getElementById(new_x + "," + new_y);

                if(!isValidSquare(new_x, new_y)) // Not a valid square
                    continue;

                if(target.innerHTML != "" && colourOfPiece(target.innerHTML) == turn) // Ally piece
                    continue;

                list.push(new_x + "," + new_y);
            }
            break;
        default: // pawn
            //
            let moves = [];
            let startRank = INT_INIT;
            if(isWhite(piece)) {
                moves = MOVES.PAWN[0];
                startRank = WHITE_PAWN_START;
            } else {
                moves = MOVES.PAWN[1];
                startRank = BLACK_PAWN_START;
            }
            
            for(var i = 0; i < 3; i++) {
                let new_x = x + moves[i][0];
                let new_y = y + moves[i][1];
                
                if(!isValidSquare(new_x, new_y)) // Not a valid square
                    continue;
                
                let target = document.getElementById(new_x + "," + new_y);
                
                if(i == 0) { // Pushing pawn
                    if(target.innerHTML == "")                    
                        list.push(new_x + "," + new_y);
                    
                    if(y == startRank) {
                        new_y = new_y + moves[i][1];
                        target = document.getElementById(new_x + "," + new_y);
                        if(target.innerHTML == "")                    
                            list.push(new_x + "," + new_y);
                    }
                } else { // Taking a piece
                    if(target.innerHTML != "" && colourOfPiece(target.innerHTML) != turn)
                        list.push(new_x + "," + new_y);
                }                
            }

            break;
    }
    for(var i = 0; i < list.length; i++) {
        var temp = document.getElementById(list[i]);
        temp.style.backgroundColor = SQUARES.MOVES;
        possibleMoves.push(list[i]);
    }
    return list;
}

function isKingValid() {

}

/**
 * 
 * @param {PiecesType} piece 
 * @param {string} start id of start cell
 * @param {string} end id of end cell
 */
function isValidMove(end) {
    return possibleMoves.includes(end);
}

/**
 * @returns true if parameters signify a calid square
 */
function isValidSquare() {
    let x = INT_INIT;
    let y = INT_INIT;
    // Cell.id was inputted
    if (arguments.length == 1) {
        let s = arguments[0].split(",");
        x = s[0];
        y = s[1];
    }
    // Coordinates of the square was inputted
    if (arguments.length == 2) {
        x = arguments[0];
        y = arguments[1];
    }

    if(x < 1 || x > 8 || y < 1 || y > 8) {
        return false;
    } else {
        return true;
    }
}

/**
 * @param {string} piece input piece can be in either form
 * @returs the colour of the input piece
 */
function colourOfPiece(piece) {
    if(piece in keyFromPiece) {
        piece = keyFromPiece[piece];
    }
    return (isWhite(piece) ? COLOURS.WHITE : COLOURS.BLACK);
}

// Capital means white
const isWhite = str => /^[A-Z]+$/.test(str);

/**
 *  Naiive solution of 'un-highlighting' a cell
 *  @param {string} cellId 
 */
function resetBackground(cellId) {
    let sum = +cellId[0] + +cellId[2];
    if(sum % 2 == 0) {
        document.getElementById(cellId).style.backgroundColor = SQUARES.DARK;
    } else {
        document.getElementById(cellId).style.backgroundColor = SQUARES.LIGHT;
    }
}

function refreshCellBackgrounds() {
    if(possibleMoves.length < 1) {
        return false;
    } else {
        for(var i = 0; i < possibleMoves.length ; i++) {
            resetBackground(possibleMoves[i]);
        }
        possibleMoves = [];
        return true;
    }
}

/**
 * Converts FEN string to represent a position on the board.
 * Assumes a valid FEN string is entered
 * Currently only supports position, turn order and castelling status not implemented
 * @param {string} FEN FEN string of position of pieces ONLY
 * @returns true - assumes no errors during processing
 */
function loadFEN(FEN, colour) {
    // Clear board
    for(var i = 0; i < NROWS; i++) {
        for(var j = 0; j < NCOLS; j++) {
            let cell = board.rows[i].cells[j];
            cell.id = "" + (j + 1) + "," + (8 - i);
            cell.innerHTML = "";
        }
    }

    let counter = 0;
    for(var i = 0; i < NROWS; i++) {
        for(var j = 0; j < NCOLS; j++) {
            let char = FEN[counter];
            if(char == "/") {
                counter++;
                char = FEN[counter]
            }
            if(isNum(char)) {
                j = j + (+char) - 1;
                counter++;
            } else {
                document.getElementById("board").rows[i].cells[j].innerHTML = PiecesType[char];
                counter++;
            }
        }
    }
    turn = colour;
    return true;
}