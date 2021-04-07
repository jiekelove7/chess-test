const nRows = 8;
const nCols = 8;
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

const COLOURS = {
    WHITE : "white",
    BLACK : "black"
}

const SQUARES = {
    LIGHT : "#3de482",
    DARK : "#0e9747",
    HIGHLIGHTED : "white"
}

// Global Variables
let pieceSelected = "";
let cellSelected = "";
let turn = COLOURS.WHITE;


function isNum(number) {
    return !isNaN(number);
}

function loadBoard() {
    let board = document.getElementById("board");
    let counter = 0; // Used for alternating black squares

    // Initialises background color of square and events
    for(var i = 0; i < nRows; i++) {
        for(var j = 0; j < nCols; j++) {
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
    // FEN string of default starting position
    loadFEN("2R5/4bppk/1p1p4/5R1P/4PQ2/5P2/r4q1P/7K");
    turn = COLOURS.WHITE;
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
        cell.style.backgroundColor = "white";
        return;
        
        
    } else { // Select a cell to move

        // Deselect piece
        if(cell.id == cellSelected) {
            resetBackground(cellSelected)
            pieceSelected = ""
            cellSelected = ""
            return;
        }

        // Reselect a piece
        if(p != "" && colourOfPiece(p) == turn) {
            resetBackground(cellSelected);
            pieceSelected = p;
            cellSelected = cell.id;
            cell.style.backgroundColor = "white";
            return;
        }

        // Is it a legal move?
        if(isValidMove("", cellSelected, cell.id)) {
            document.getElementById(cellSelected).innerHTML = "";
            resetBackground(cellSelected);
            cell.innerHTML = pieceSelected;
            pieceSelected = "";
            cellSelected = "";
            advanceTurn();
            return;
        }  
        
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
 * @param {PiecesType} piece 
 * @param {string} start id of start cell
 * @param {string} end id of end cell
 */
function isValidMove(piece, start, end) {
    target = document.getElementById(end).innerHTML;
    if(target == "") return true;
    
    if(colourOfPiece(target) != turn) {
        return true;
    }

    return false;
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

/**
 * Converts FEN string to represent a position on the board.
 * Assumes a valid FEN string is entered
 * @param {string} FEN FEN string of position of pieces ONLY
 * @returns true - assumes no errors during processing
 */
function loadFEN(FEN) {
    let counter = 0;
    for(var i = 0; i < nRows; i++) {
        for(var j = 0; j < nCols; j++) {
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
    return true;
}