# ChessIQ Piece Asset Research

The current handcrafted SVG family is unsuitable and will be removed. Research identified the `kmar/chess_svg_piece_sets` repository as a candidate because its README explicitly describes the Livius, Meridian, and Meridian Shaded families as CC0/public-domain and suitable for commercial bundling.

The Meridian Shaded set supplies all twelve standard assets as individual SVG files (`bb`, `bk`, `bn`, `bp`, `bq`, `br`, `wb`, `wk`, `wn`, `wp`, `wq`, and `wr`). Its design is a coherent, conservative tournament family with consistent proportions and stroke treatment. In contrast, the generated piece image was rejected because it contained unsuitable photographic material detail and transparency artefacts; the Chessground Cburnett set was also rejected because its package license is GPL.

The CC0 Meridian Shaded family has now replaced the hand-drawn system. At desktop scale, its queens, kings, rooks, bishops, knights, and pawns form a visibly coherent professional set with no distorted hand-drawn forms. At the 390px mobile breakpoint, the silhouettes remain distinct, proportionate, and contained within the board. The existing CSS movement container continues to animate the new SVG asset elements.
