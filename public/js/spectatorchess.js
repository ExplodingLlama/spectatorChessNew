$(document).ready(function() {
    
    "use strict";
    
    var WHITE = 'w';
    var BLACK = 'b';

    var START_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR";
    
    var files = ['a','b','c','d','e','f','g','h'];
    var ranks = ['1','2','3','4','5','6','7','8'];
    
    var CSS = {
        whiteT1: 'white-territory1',
        blackT1: 'black-territory1',
        whiteT2: 'white-territory2',
        blackT2: 'black-territory2',
        whiteT3: 'white-territory3',
        blackT3: 'black-territory3',
    };
    
    //Auto-called when user makes a move
    var onChange = function(oldPos, newPos) {
        makeGoodThingsHappen(ChessBoard.objToFen(newPos));
    };
    
    var cfg = {
        draggable: true,
        position: 'start',
        onChange: onChange
    };
    
    var board = ChessBoard('chessboard', cfg);
    
    var chess = new Chess();
    
    board.start(true);
    
    var territoryMap = {};
    
    makeGoodThingsHappen(board.fen());

    //Called when FEN is being added
    $('#fenbutton').on('click', function() {
        var fen = $('#feninput').val() || START_FEN;
        board.position(fen);
        makeGoodThingsHappen(fen);
    });


        
    //Make a valid FEN string for Chess.js castling info is not required
    function getValidFen(fen, color) {
        var elements = fen.split(' ');
        return elements[0] + " " + color + " - - 0 1";
    }
    
    //This is the place to add new functionality, the function makeGoodThingsHappen()
    function makeGoodThingsHappen(fen) {
                
        removeTerritoryMarkings();
        markTerritory(fen, WHITE);
        markTerritory(fen, BLACK);
        addTerritoryMarkings();
    }
    
    function markTerritory(fen, color) {

        //load board state into chess.js
        chess.load(getValidFen(fen, color));
        
        //We take each piece of this color and according to what piece it is, we find all the squares it attacks
        $.each(files, function(fileIndex, fileValue) {
           $.each(ranks, function(rankIndex, rankValue) {
               var piece = chess.get(fileValue+rankValue);
               var attckedSquaresPerPiece = [];
               if(piece && piece.color == color){
                   switch(piece.type){
                       case 'b': //Bishop
                           attckedSquaresPerPiece = getBishopTerritory(fileIndex, rankIndex);
                           break;
                       case 'q': //Queen
                           attckedSquaresPerPiece = getQueenTerritory(fileIndex, rankIndex);
                           break;
                       case 'k': //King
                           attckedSquaresPerPiece = getKingTerritory(fileIndex, rankIndex);
                           break;
                       case 'n': //Knight
                           attckedSquaresPerPiece = getKnightTerritory(fileIndex, rankIndex);
                           break;
                       case 'r': //Rook
                           attckedSquaresPerPiece = getRookTerritory(fileIndex, rankIndex);
                           break;
                       case 'p': //teeny tiny cute can't-move-back Pawn
                           attckedSquaresPerPiece = getPawnTerritory(fileIndex, rankIndex, color);
                           break;
                   }
               }
               
               $.each(attckedSquaresPerPiece, function(index, value) {
                   
                   if(territoryMap[value] == null) {
                       territoryMap[value] = 0;
                   }
                   
                   if(color == WHITE) territoryMap[value]++;
                   else territoryMap[value]--;
               });
           }); 
        });

    }
    
    function removeTerritoryMarkings() {
        
        var squareElementIds = board.getSquareElIds();
        $.each(files, function(fileIndex, fileValue) {
           $.each(ranks, function(rankIndex, rankValue) {
               territoryMap[fileValue+rankValue] = 0;
               $('#' + squareElementIds[fileValue+rankValue]).removeClass(CSS.blackT1);
               $('#' + squareElementIds[fileValue+rankValue]).removeClass(CSS.whiteT1);
               $('#' + squareElementIds[fileValue+rankValue]).removeClass(CSS.blackT2);
               $('#' + squareElementIds[fileValue+rankValue]).removeClass(CSS.whiteT2);
               $('#' + squareElementIds[fileValue+rankValue]).removeClass(CSS.blackT3);
               $('#' + squareElementIds[fileValue+rankValue]).removeClass(CSS.whiteT3);
           }); 
        });
    }
    
    function addTerritoryMarkings() {
        
        var squareElementIds = board.getSquareElIds();
        var cssClass;
        
        $.each(territoryMap, function(index, value) {
            switch(value) {
                case 1: cssClass = CSS.whiteT1;
                    break;
                case 2: cssClass = CSS.whiteT2;
                    break;
                case 3:
                case 4:
                case 5:
                case 6:
                case 7:
                case 8: cssClass = CSS.whiteT3;
                    break;
                case -1: cssClass = CSS.blackT1;
                    break;
                case -2: cssClass = CSS.blackT2;
                    break;
                case -3: 
                case -4:
                case -5:
                case -6:
                case -7:
                case -8:
                    cssClass = CSS.blackT3;
                    break;
                default: cssClass = null;
                    break;
                    
            }
            
            $('#' + squareElementIds[index]).addClass(cssClass);
        })
        
    }
    
    function getPawnTerritory(fileIndex, rankIndex, color) {
        var result = [];
        
        //Only two possible squares
        var attackedRankI;
        if(color == WHITE) attackedRankI = rankIndex+1;
        else attackedRankI = rankIndex-1;
        
        if(attackedRankI>=0 && attackedRankI<=ranks.length-1) {
            if(fileIndex>0) result.push(files[fileIndex-1] + ranks[attackedRankI]);
            if(fileIndex<files.length-1) result.push(files[fileIndex+1] + ranks[attackedRankI]);
        }
        
        return result;
    }
    
    function getKnightTerritory(fileIndex, rankIndex) {
        
        var result = [];
        
        //Eight possible squares
        //First, two squares to the right
        var fileI = fileIndex+2;
        if(fileI <= files.length-1) {
            if(rankIndex<ranks.length-1) result.push(files[fileI] + ranks[rankIndex+1]);
            if(rankIndex>0) result.push(files[fileI] + ranks[rankIndex-1]);
        }
        
        //Next, twp squares to the left
        fileI = fileIndex-2;
        if(fileI>=0) {
            if(rankIndex<ranks.length-1) result.push(files[fileI] + ranks[rankIndex+1]);
            if(rankIndex>0) result.push(files[fileI] + ranks[rankIndex-1]);
        }
        
        //next, two squares up
        var rankI = rankIndex+2;
        if(rankI <= ranks.length-1) {
            if(fileIndex<files.length-1) result.push(files[fileIndex+1] + ranks[rankI]);
            if(fileIndex>0) result.push(files[fileIndex-1] + ranks[rankI]);
        }
        
        //Next, two squares down
        rankI = rankIndex-2;
        if(rankI>=0) {
            if(fileIndex<files.length-1) result.push(files[fileIndex+1] + ranks[rankI]);
            if(fileIndex>0) result.push(files[fileIndex-1] + ranks[rankI]);
        }
        
        return result;
    }
    
    function getKingTerritory(fileIndex, rankIndex) {
        
        var result = [];
        //One square each direction
        //to the left
        if(fileIndex>0) {
            var fileI = fileIndex-1;
            if(rankIndex>0) result.push(files[fileI] + ranks[rankIndex-1]);
            result.push(files[fileI] + ranks[rankIndex]);
            if(rankIndex<ranks.length-1) result.push(files[fileI] + ranks[rankIndex+1]);
        }
        //to the right
        if(fileIndex<files.length-1) {
            var fileI = fileIndex+1;
            if(rankIndex>0) result.push(files[fileI] + ranks[rankIndex-1]);
            result.push(files[fileI] + ranks[rankIndex]);
            if(rankIndex<ranks.length-1) result.push(files[fileI] + ranks[rankIndex+1]);
        }
        //up
        if(rankIndex<ranks.length-1) result.push(files[fileIndex] + ranks[rankIndex+1]);
        //down
        if(rankIndex>0) result.push(files[fileIndex] + ranks[rankIndex-1]);
        
        return result;
    }
    
    function getQueenTerritory(fileIndex, rankIndex) {
        
        //This is just a combination of rook and bishop squares.
        var bishopResult = getBishopTerritory(fileIndex, rankIndex);
        var rookResult = getRookTerritory(fileIndex, rankIndex);
        return bishopResult.concat(rookResult);
    }
    
    function getRookTerritory(fileIndex, rankIndex) {
        var result = [];
        //Four Directions
        
        //going right
        var fileI = fileIndex;
        while(true) {
            if(fileI>=files.length-1) break;
            fileI++;
            //Add to list
            var square = files[fileI] + ranks[rankIndex];
            result.push(square);
            //If there is a piece on this square, break out
            var piece = chess.get(square);
            if(piece && piece.type!='r' && piece.type!='q') break;
        }
        
        //going left
        fileI = fileIndex;
        while(true) {
            if(fileI<=0) break;
            fileI--;
            //Add to list
            var square = files[fileI] + ranks[rankIndex];
            result.push(square);
            //If there is a piece on this square, break out
            var piece = chess.get(square);
            if(piece && piece.type!='r' && piece.type!='q') break;
        }
        
        //going up
        var rankI = rankIndex;
        while(true) {
            if(rankI>=ranks.length-1) break;
            rankI++;
            var square = files[fileIndex] + ranks[rankI];
            result.push(square);
            //if there is a piece on this square, breakout
            var piece = chess.get(square);
            if(piece && piece.type!='r' && piece.type!='q') break;
        }
        
        //going down
        rankI = rankIndex;
        while(true) {
            if(rankI<=0) break;
            rankI--;
            var square = files[fileIndex] + ranks[rankI];
            result.push(square);
            //if there is a piece on this square, breakout
            var piece = chess.get(square);
            if(piece && piece.type!='r' && piece.type!='q') break;
        }
        
        return result;
    }
    
    //Find all the squares attacked by this bishop on this file and this rank
    function getBishopTerritory(fileIndex, rankIndex) {
        var result = [];
        //Four directions
        //First one, going upward and right, and second one, going downward and right, inside the loop
        var fileI = fileIndex;
        var rankUp = rankIndex;
        var rankDown = rankIndex;
        while(true){
            
            //If last file, break out.
            if(fileI>=files.length-1) break;
            
            fileI++;
            //If not the last rank, do some shit
            if(rankUp<ranks.length-1) {
                rankUp++;
                var square = files[fileI] + ranks[rankUp];
                //Add this square to the list
                result.push(square);
                //If there is a piece on this square, short circuit this part from further executions by making the value of rankUp = 100 because no one will create a board that big haha.
                var piece = chess.get(square);
                if(piece && piece.type != 'q' && piece.type !='b') rankUp=100;
            }
            
            //If not the first rank, do some shit
            if(rankDown>0) {
                rankDown--;
                var square = files[fileI] + ranks[rankDown];
                //Add this square to the list
                result.push(square);
                //If there is a piece on this square, short circuit this part from further executions by making the value of rankDown = 0 because that'll do pig, that'll do.
                var piece = chess.get(square);
                if(piece && piece.type != 'q' && piece.type !='b') rankDown = 0;
            }
        }
        //Second one, going left and upward and left and downward
        fileI = fileIndex;
        rankUp = rankIndex;
        rankDown = rankIndex;
        while(true){
            //If the first file, break out
            if(fileI<=0) break;
            
            fileI--;
            //If not the last rank, do some shit
            if(rankUp<ranks.length-1) {
                rankUp++;
                var square = files[fileI] + ranks[rankUp];
                //Add this square to the list
                result.push(square);
                //If there is a piece on this square, short circuit this part from further executions by making the value of rankUp = 100 because no one will create a board that big haha.
                var piece = chess.get(square);
                if(piece && piece.type != 'q' && piece.type !='b') rankUp=100;
            }
            
            //If not the first rank, do some shit
            if(rankDown>0) {
                rankDown--;
                var square = files[fileI] + ranks[rankDown];
                //Add this square to the list
                result.push(square);
                //If there is a piece on this square, short circuit this part from further executions by making the value of rankDown = 0 because that'll do pig, that'll do.
                var piece = chess.get(square);
                if(piece && piece.type != 'q' && piece.type !='b') rankDown = 0;
            }
        }
        return result;
    }
});
