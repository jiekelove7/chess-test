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
                cell.style.backgroundColor = "#3de482";
            else
                cell.style.backgroundColor = "#0e9747";
            if(j != 7)
                counter ++;
        }
    }

    loadFEN("rnbqkbnr/pp1ppppp/8/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R");
}

function clickCell(cell) {
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