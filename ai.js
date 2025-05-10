function aiMove(board, hands) {
  const moves = [];
  const dirs = {
    L: [[0,1],[1,0],[-1,0],[0,-1],[1,1],[-1,1],[1,-1],[-1,-1]],
    E: [[1,1],[-1,1],[1,-1],[-1,-1]],
    G: [[0,1],[1,0],[-1,0],[0,-1]],
    C: [[0,1]],
    H: [[0,1],[1,0],[-1,0],[1,1],[-1,1]],
  };

  const evalMove = (from, to, piece, captured) => {
    let score = 0;
    if (captured === 'L') score += 1000;
    if (piece === 'C' && to[1] === 3) score += 5; // promote
    if (captured) score += { E: 4, G: 4, C: 2, H: 2 }[captured] || 0;
    if (piece === 'L') score += 2; // avoid useless lion move
    return score + Math.random();
  };

  // 通常の移動を収集
  for (let y = 0; y < 4; y++) {
    for (let x = 0; x < 3; x++) {
      const cell = board[y][x];
      if (!cell || cell[0] !== 'A') continue;
      const type = cell.slice(1);
      for (let [dx, dy] of dirs[type] || []) {
        const nx = x + dx;
        const ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= 3 || ny >= 4) continue;
        const target = board[ny][nx];
        if (target && target[0] === 'A') continue;
        const captured = target ? target.slice(1) : null;
        moves.push({
          from: [x, y],
          to: [nx, ny],
          piece: type,
          score: evalMove([x, y], [nx, ny], type, captured)
        });
      }
    }
  }

  // 打ちも収集
  hands.A.forEach((piece, idx) => {
    for (let y = 0; y < 4; y++) {
      for (let x = 0; x < 3; x++) {
        if (!board[y][x]) {
          moves.push({
            from: null,
            to: [x, y],
            piece,
            handIndex: idx,
            score: (piece === 'C' && y === 0 ? 3 : 1) + Math.random()
          });
        }
      }
    }
  });

  // 最良手を選択
  if (moves.length === 0) return;
  moves.sort((a, b) => b.score - a.score);
  const best = moves[0];

  if (best.from) {
    const [sx, sy] = best.from;
    const [dx, dy] = best.to;
    const movingPiece = board[sy][sx];
    const dest = board[dy][dx];
    if (dest && dest[0] === 'P') {
      let captured = dest.slice(1);
      if (captured === 'H') captured = 'C';
      hands.A.push(captured);
    }
    board[dy][dx] = movingPiece;
    board[sy][sx] = null;

    // 成り判定
    if (movingPiece === 'AC' && dy === 3) board[dy][dx] = 'AH';
  } else {
    const [dx, dy] = best.to;
    board[dy][dx] = 'A' + best.piece;
    hands.A.splice(best.handIndex, 1);
  }

  // 勝利チェック（index.htmlの checkWin() で補完）
}
