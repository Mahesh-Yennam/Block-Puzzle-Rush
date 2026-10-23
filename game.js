/**
 * BLOCK PUZZLE RUSH - Core Game Engine
 * Pure Vanilla JavaScript with HTML5 DOM Grid & Web Audio API
 */

(function () {
  'use strict';

  // --- Web Audio Synthesizer Engine ---
  let audioCtx = null;
  let isMuted = false;

  function initAudio() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        audioCtx = new AudioContext();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  function playTone(freq, type, duration, vol = 0.15) {
    if (isMuted || !audioCtx) return;
    try {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(vol, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (e) {
      // Audio fallback
    }
  }

  function playSound(type) {
    if (isMuted) return;
    initAudio();
    if (type === 'pick') {
      playTone(480, 'sine', 0.05, 0.1);
    } else if (type === 'drop') {
      playTone(320, 'triangle', 0.09, 0.15);
      setTimeout(() => playTone(220, 'triangle', 0.08, 0.12), 40);
    } else if (type === 'clear') {
      playTone(523, 'sine', 0.15, 0.2); // C5
      setTimeout(() => playTone(659, 'sine', 0.18, 0.2), 90); // E5
      setTimeout(() => playTone(784, 'sine', 0.25, 0.22), 180); // G5
    } else if (type === 'combo') {
      playTone(523, 'triangle', 0.12, 0.2);
      setTimeout(() => playTone(659, 'triangle', 0.12, 0.2), 70);
      setTimeout(() => playTone(784, 'triangle', 0.12, 0.2), 140);
      setTimeout(() => playTone(1046, 'triangle', 0.28, 0.25), 210); // C6
    } else if (type === 'gameover') {
      playTone(330, 'sawtooth', 0.25, 0.3);
      setTimeout(() => playTone(240, 'sawtooth', 0.3, 0.3), 180);
      setTimeout(() => playTone(160, 'sawtooth', 0.5, 0.35), 360);
    }
  }

  // --- Shapes Definitions ---
  const SHAPES = [
    // 1x1
    { matrix: [[1]], color: 'color-amber' },
    // Dominoes
    { matrix: [[1, 1]], color: 'color-cyan' },
    { matrix: [[1], [1]], color: 'color-cyan' },
    // Triominoes
    { matrix: [[1, 1, 1]], color: 'color-blue' },
    { matrix: [[1], [1], [1]], color: 'color-blue' },
    // Tetris bars
    { matrix: [[1, 1, 1, 1]], color: 'color-purple' },
    { matrix: [[1], [1], [1], [1]], color: 'color-purple' },
    // 5-bar
    { matrix: [[1, 1, 1, 1, 1]], color: 'color-rose' },
    { matrix: [[1], [1], [1], [1], [1]], color: 'color-rose' },
    // Squares
    { matrix: [[1, 1], [1, 1]], color: 'color-amber' },
    { matrix: [[1, 1, 1], [1, 1, 1], [1, 1, 1]], color: 'color-rose' },
    // Small corners / L
    { matrix: [[1, 0], [1, 1]], color: 'color-emerald' },
    { matrix: [[0, 1], [1, 1]], color: 'color-emerald' },
    { matrix: [[1, 1], [1, 0]], color: 'color-emerald' },
    { matrix: [[1, 1], [0, 1]], color: 'color-emerald' },
    // Large 3x3 Corners
    { matrix: [[1, 0, 0], [1, 0, 0], [1, 1, 1]], color: 'color-blue' },
    { matrix: [[0, 0, 1], [0, 0, 1], [1, 1, 1]], color: 'color-blue' },
    { matrix: [[1, 1, 1], [1, 0, 0], [1, 0, 0]], color: 'color-blue' },
    { matrix: [[1, 1, 1], [0, 0, 1], [0, 0, 1]], color: 'color-blue' },
    // T-Shapes
    { matrix: [[1, 1, 1], [0, 1, 0]], color: 'color-purple' },
    { matrix: [[0, 1, 0], [1, 1, 1]], color: 'color-purple' },
    // Cross
    { matrix: [[0, 1, 0], [1, 1, 1], [0, 1, 0]], color: 'color-cyan' },
  ];

  // --- Game State ---
  const BOARD_SIZE = 10;
  let board = Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(null));

  let score = 0;
  let highScore = parseInt(localStorage.getItem('block_puzzle_highscore') || '0', 10);
  let streak = 0;
  let linesClearedCount = 0;

  let trayPieces = [null, null, null];
  let selectedTrayIndex = null;
  let isGameOver = false;

  // DOM Elements
  const boardEl = document.getElementById('boardGrid');
  const trayEl = document.getElementById('trayContainer');
  const scoreVal = document.getElementById('scoreVal');
  const highVal = document.getElementById('highVal');
  const streakVal = document.getElementById('streakVal');
  const linesVal = document.getElementById('linesVal');

  const gameOverOverlay = document.getElementById('gameOverOverlay');
  const finalScoreEl = document.getElementById('finalScore');
  const restartBtn = document.getElementById('restartBtn');
  const resetGameBtn = document.getElementById('resetGameBtn');
  const muteBtn = document.getElementById('muteBtn');

  if (highVal) highVal.textContent = highScore;

  // --- Core Lifecycle ---
  function initGame() {
    board = Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(null));
    score = 0;
    streak = 0;
    linesClearedCount = 0;
    isGameOver = false;
    selectedTrayIndex = null;

    gameOverOverlay?.classList.add('hidden');
    updateHUD();
    renderBoard();
    spawnTrayPieces();
  }

  function updateHUD() {
    if (scoreVal) scoreVal.textContent = score;
    if (streakVal) streakVal.textContent = streak > 1 ? `${streak}x` : '1x';
    if (linesVal) linesVal.textContent = linesClearedCount;
    if (highVal) highVal.textContent = highScore;
  }

  // --- Board Rendering ---
  function renderBoard() {
    if (!boardEl) return;
    boardEl.innerHTML = '';

    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        const cell = document.createElement('div');
        cell.className = 'grid-cell';
        cell.setAttribute('data-r', r);
        cell.setAttribute('data-c', c);

        const color = board[r][c];
        if (color) {
          cell.classList.add('filled', color);
        }

        // Cell Interactions (Hover preview & Click to place)
        cell.addEventListener('mouseenter', () => onCellHover(r, c));
        cell.addEventListener('mouseleave', clearPreview);
        cell.addEventListener('click', () => onCellClick(r, c));

        boardEl.appendChild(cell);
      }
    }
  }

  // --- Piece Tray Rendering ---
  function spawnTrayPieces() {
    for (let i = 0; i < 3; i++) {
      const randShape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
      trayPieces[i] = {
        matrix: randShape.matrix,
        color: randShape.color,
      };
    }
    selectedTrayIndex = null;
    renderTray();
    checkGameOver();
  }

  function renderTray() {
    if (!trayEl) return;
    trayEl.innerHTML = '';

    trayPieces.forEach((piece, index) => {
      const slot = document.createElement('div');
      slot.className = 'tray-slot';
      slot.setAttribute('data-index', index);

      if (!piece) {
        slot.classList.add('disabled');
        trayEl.appendChild(slot);
        return;
      }

      if (selectedTrayIndex === index) {
        slot.classList.add('selected');
      }

      // Check if this piece can fit anywhere
      if (!canFitAnywhere(piece)) {
        slot.classList.add('disabled');
      }

      // Render Piece Matrix
      const pieceGrid = document.createElement('div');
      pieceGrid.className = 'piece-grid';
      const rows = piece.matrix.length;
      const cols = piece.matrix[0].length;
      pieceGrid.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
      pieceGrid.style.gridTemplateRows = `repeat(${rows}, 1fr)`;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const block = document.createElement('div');
          if (piece.matrix[r][c] === 1) {
            block.className = `piece-block ${piece.color}`;
          }
          pieceGrid.appendChild(block);
        }
      }

      slot.appendChild(pieceGrid);

      // Click to select
      slot.addEventListener('click', () => {
        if (slot.classList.contains('disabled')) return;
        if (selectedTrayIndex === index) {
          selectedTrayIndex = null;
        } else {
          selectedTrayIndex = index;
          playSound('pick');
        }
        renderTray();
        clearPreview();
      });

      // Pointer / Touch Drag Support
      setupDrag(slot, index);

      trayEl.appendChild(slot);
    });
  }

  // --- Drag and Drop Precision Math Engine ---
  let activeDragPiece = null;
  let activeDragIndex = null;

  function getGridCoords(clientX, clientY, piece) {
    if (!boardEl || !piece) return null;
    const rect = boardEl.getBoundingClientRect();

    const cellW = rect.width / BOARD_SIZE;
    const cellH = rect.height / BOARD_SIZE;

    // Detect mobile touch for comfortable vertical lift so finger doesn't obscure the target
    const isTouch = window.matchMedia('(pointer: coarse)').matches;
    const targetY = isTouch ? (clientY - 55) : clientY;
    const targetX = clientX;

    const relX = targetX - rect.left;
    const relY = targetY - rect.top;

    // Center the polyomino piece blocks around the pointer
    const pieceRows = piece.matrix.length;
    const pieceCols = piece.matrix[0].length;
    const centerR = (pieceRows - 1) / 2;
    const centerC = (pieceCols - 1) / 2;

    const col = Math.round((relX / cellW) - centerC - 0.5);
    const row = Math.round((relY / cellH) - centerR - 0.5);

    return { r: row, c: col, targetX, targetY };
  }

  function setupDrag(slotEl, index) {
    let isDragging = false;
    let ghostEl = null;

    slotEl.addEventListener('pointerdown', (e) => {
      if (slotEl.classList.contains('disabled') || !trayPieces[index]) return;
      slotEl.setPointerCapture(e.pointerId);
      isDragging = true;
      activeDragPiece = trayPieces[index];
      activeDragIndex = index;
      selectedTrayIndex = index;
      playSound('pick');

      // Create floating ghost with 1:1 scale matching board cells
      ghostEl = document.createElement('div');
      ghostEl.className = 'drag-ghost';
      ghostEl.style.position = 'fixed';
      ghostEl.style.zIndex = '1000';
      ghostEl.style.pointerEvents = 'none';
      ghostEl.style.display = 'grid';
      ghostEl.style.gap = '3px';
      ghostEl.style.gridTemplateColumns = `repeat(${activeDragPiece.matrix[0].length}, 1fr)`;
      ghostEl.style.gridTemplateRows = `repeat(${activeDragPiece.matrix.length}, 1fr)`;
      ghostEl.style.transform = 'translate(-50%, -50%)';
      ghostEl.style.filter = 'drop-shadow(0 0 14px rgba(255,255,255,0.4))';
      ghostEl.style.opacity = '0.9';

      const rect = boardEl ? boardEl.getBoundingClientRect() : { width: 400 };
      const ghostBlockSize = Math.max(22, Math.min(38, rect.width / (BOARD_SIZE + 1)));

      for (let pr = 0; pr < activeDragPiece.matrix.length; pr++) {
        for (let pc = 0; pc < activeDragPiece.matrix[0].length; pc++) {
          const b = document.createElement('div');
          b.style.width = `${ghostBlockSize}px`;
          b.style.height = `${ghostBlockSize}px`;
          b.style.borderRadius = '4px';
          if (activeDragPiece.matrix[pr][pc] === 1) {
            b.className = `piece-block ${activeDragPiece.color}`;
          } else {
            b.style.visibility = 'hidden';
          }
          ghostEl.appendChild(b);
        }
      }

      const isTouch = window.matchMedia('(pointer: coarse)').matches;
      const displayY = isTouch ? (e.clientY - 55) : e.clientY;
      ghostEl.style.left = `${e.clientX}px`;
      ghostEl.style.top = `${displayY}px`;
      document.body.appendChild(ghostEl);

      const coords = getGridCoords(e.clientX, e.clientY, activeDragPiece);
      if (coords) onCellHover(coords.r, coords.c);
    });

    slotEl.addEventListener('pointermove', (e) => {
      if (!isDragging || !ghostEl || !activeDragPiece) return;
      const isTouch = window.matchMedia('(pointer: coarse)').matches;
      const displayY = isTouch ? (e.clientY - 55) : e.clientY;
      ghostEl.style.left = `${e.clientX}px`;
      ghostEl.style.top = `${displayY}px`;

      const coords = getGridCoords(e.clientX, e.clientY, activeDragPiece);
      if (coords && coords.r >= -2 && coords.r < BOARD_SIZE && coords.c >= -2 && coords.c < BOARD_SIZE) {
        onCellHover(coords.r, coords.c);
      } else {
        clearPreview();
      }
    });

    const endDrag = (e) => {
      if (!isDragging) return;
      isDragging = false;
      if (ghostEl) {
        ghostEl.remove();
        ghostEl = null;
      }

      const coords = getGridCoords(e.clientX, e.clientY, activeDragPiece);
      if (coords && canPlace(activeDragPiece, coords.r, coords.c)) {
        tryPlacePiece(coords.r, coords.c, activeDragIndex);
      } else {
        clearPreview();
      }

      activeDragPiece = null;
      activeDragIndex = null;
    };

    slotEl.addEventListener('pointerup', endDrag);
    slotEl.addEventListener('pointercancel', endDrag);
  }

  // --- Placement & Validation ---
  function canPlace(piece, startR, startC) {
    if (!piece) return false;
    const rows = piece.matrix.length;
    const cols = piece.matrix[0].length;

    if (startR < 0 || startC < 0 || startR + rows > BOARD_SIZE || startC + cols > BOARD_SIZE) {
      return false;
    }

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (piece.matrix[r][c] === 1) {
          if (board[startR + r][startC + c] !== null) {
            return false;
          }
        }
      }
    }
    return true;
  }

  function canFitAnywhere(piece) {
    if (!piece) return false;
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        if (canPlace(piece, r, c)) return true;
      }
    }
    return false;
  }

  function onCellHover(r, c) {
    clearPreview();
    const piece = activeDragPiece || (selectedTrayIndex !== null ? trayPieces[selectedTrayIndex] : null);
    if (!piece) return;

    const valid = canPlace(piece, r, c);
    const rows = piece.matrix.length;
    const cols = piece.matrix[0].length;

    for (let pr = 0; pr < rows; pr++) {
      for (let pc = 0; pc < cols; pc++) {
        if (piece.matrix[pr][pc] === 1) {
          const targetR = r + pr;
          const targetC = c + pc;
          if (targetR >= 0 && targetR < BOARD_SIZE && targetC >= 0 && targetC < BOARD_SIZE) {
            const cellEl = boardEl?.querySelector(`.grid-cell[data-r="${targetR}"][data-c="${targetC}"]`);
            if (cellEl && !cellEl.classList.contains('filled')) {
              cellEl.classList.add(valid ? 'preview-valid' : 'preview-invalid');
            }
          }
        }
      }
    }
  }

  function clearPreview() {
    const cells = boardEl?.querySelectorAll('.grid-cell');
    cells?.forEach(cell => {
      cell.classList.remove('preview-valid', 'preview-invalid');
    });
  }

  function onCellClick(clickedR, clickedC) {
    if (selectedTrayIndex === null) return;
    const piece = trayPieces[selectedTrayIndex];
    if (!piece) return;

    // 1. Try centering around clicked cell
    const centerR = Math.floor((piece.matrix.length - 1) / 2);
    const centerC = Math.floor((piece.matrix[0].length - 1) / 2);
    const centerTargetR = clickedR - centerR;
    const centerTargetC = clickedC - centerC;

    if (canPlace(piece, centerTargetR, centerTargetC)) {
      tryPlacePiece(centerTargetR, centerTargetC, selectedTrayIndex);
      return;
    }

    // 2. Try top-left alignment
    if (canPlace(piece, clickedR, clickedC)) {
      tryPlacePiece(clickedR, clickedC, selectedTrayIndex);
      return;
    }

    // 3. Magnetic snap to nearest adjacent valid position
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        const testR = centerTargetR + dr;
        const testC = centerTargetC + dc;
        if (canPlace(piece, testR, testC)) {
          tryPlacePiece(testR, testC, selectedTrayIndex);
          return;
        }
      }
    }
  }

  function tryPlacePiece(r, c, trayIndex) {
    const piece = trayPieces[trayIndex];
    if (!piece || !canPlace(piece, r, c)) return;

    // Place piece blocks on board
    let blockCount = 0;
    const rows = piece.matrix.length;
    const cols = piece.matrix[0].length;

    for (let pr = 0; pr < rows; pr++) {
      for (let pc = 0; pc < cols; pc++) {
        if (piece.matrix[pr][pc] === 1) {
          board[r + pr][c + pc] = piece.color;
          blockCount++;
        }
      }
    }

    score += blockCount;
    playSound('drop');

    // Remove piece from tray
    trayPieces[trayIndex] = null;
    selectedTrayIndex = null;
    clearPreview();
    renderBoard();

    // Check line completions
    checkLines();

    // Spawn new batch if tray is empty
    if (trayPieces.every(p => p === null)) {
      spawnTrayPieces();
    } else {
      renderTray();
      checkGameOver();
    }
  }

  // --- Line Clearing & Streak Logic ---
  function checkLines() {
    const fullRows = [];
    const fullCols = [];

    // Check rows
    for (let r = 0; r < BOARD_SIZE; r++) {
      if (board[r].every(cell => cell !== null)) {
        fullRows.push(r);
      }
    }

    // Check columns
    for (let c = 0; c < BOARD_SIZE; c++) {
      let isColFull = true;
      for (let r = 0; r < BOARD_SIZE; r++) {
        if (board[r][c] === null) {
          isColFull = false;
          break;
        }
      }
      if (isColFull) fullCols.push(c);
    }

    const totalLines = fullRows.length + fullCols.length;

    if (totalLines > 0) {
      streak++;
      linesClearedCount += totalLines;

      // Scoring formula with combo multiplier
      let basePts = totalLines * 100;
      if (totalLines === 2) basePts = 300;
      if (totalLines === 3) basePts = 600;
      if (totalLines >= 4) basePts = 1000;

      const earned = basePts * Math.min(5, streak);
      score += earned;

      if (totalLines > 1) {
        playSound('combo');
      } else {
        playSound('clear');
      }

      // Visual flash animation on clearing cells
      fullRows.forEach(r => {
        for (let c = 0; c < BOARD_SIZE; c++) {
          const cellEl = boardEl?.querySelector(`.grid-cell[data-r="${r}"][data-c="${c}"]`);
          cellEl?.classList.add('clearing');
        }
      });
      fullCols.forEach(c => {
        for (let r = 0; r < BOARD_SIZE; r++) {
          const cellEl = boardEl?.querySelector(`.grid-cell[data-r="${r}"][data-c="${c}"]`);
          cellEl?.classList.add('clearing');
        }
      });

      // Clear from board array after animation
      setTimeout(() => {
        fullRows.forEach(r => {
          for (let c = 0; c < BOARD_SIZE; c++) board[r][c] = null;
        });
        fullCols.forEach(c => {
          for (let r = 0; r < BOARD_SIZE; r++) board[r][c] = null;
        });
        renderBoard();
        checkGameOver();
      }, 300);
    } else {
      streak = 0;
    }

    // Check High Score
    if (score > highScore) {
      highScore = score;
      localStorage.setItem('block_puzzle_highscore', highScore.toString());
    }

    updateHUD();
  }

  // --- Game Over Check ---
  function checkGameOver() {
    const availablePieces = trayPieces.filter(p => p !== null);
    if (availablePieces.length === 0) return;

    const anyFit = availablePieces.some(p => canFitAnywhere(p));
    if (!anyFit) {
      isGameOver = true;
      playSound('gameover');
      if (finalScoreEl) finalScoreEl.textContent = score;
      gameOverOverlay?.classList.remove('hidden');
    }
  }

  // --- Event Bindings ---
  restartBtn?.addEventListener('click', initGame);
  resetGameBtn?.addEventListener('click', initGame);

  muteBtn?.addEventListener('click', () => {
    isMuted = !isMuted;
    if (muteBtn) {
      muteBtn.innerHTML = isMuted ? '🔇 Muted' : '🔊 Sound';
    }
  });

  // Start initial game
  initGame();
})();
