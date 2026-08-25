# ChessIQ Piece Classification Marker

The board-marker feature attaches a compact classification signal to the destination square of the analyzed move and is synchronized with the Game Review card. Its symbol map uses `!!` for Brilliant, check marks for Best and Excellent, `?`/`?!`/`×` for lower-quality moves, and small positive symbols for other classifications.

The desktop and mobile review routes confirm that the marker is rendered with the analyzed board state. It is centered above the destination piece, uses a higher visual layer than the engine arrow, and stays compact enough not to hide board coordinates or navigation. Its entry uses a short pop animation and reduces to a static marker when motion preferences require it.
