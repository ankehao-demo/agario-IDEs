---
description: Debug Memory Leaks - Identify and fix memory leaks in the Agar.io game
---

# Memory Leak Debugging Workflow

This workflow helps identify and resolve memory leaks in the Agar.io clone game, focusing on common JavaScript/Canvas issues.

## Step 1: Enable Browser Memory Profiling

Open Chrome DevTools and prepare for memory analysis:
```
1. Open the game in Chrome
2. Press F12 to open DevTools
3. Go to the "Memory" tab
4. Take a heap snapshot (baseline)
```

## Step 2: Run Memory Leak Detection

Play the game for 2-3 minutes while monitoring memory:
```
1. Play the game normally (move around, split cells, eat food)
2. Take another heap snapshot after 2-3 minutes
3. Compare snapshots to identify growing objects
4. Look for: Arrays, Event Listeners, Canvas contexts, Detached DOM nodes
```

## Step 3: Check Event Listener Leaks

Verify event listeners are properly managed:

**Check these files for potential leaks:**
- `static/js/game.js` - setupInputHandlers() (lines 7-25)
- `static/js/ui.js` - Any dynamic event listener additions

**Common issues:**
- Event listeners added in game loop without removal
- Multiple listeners on same element
- Listeners on removed DOM elements

**Fix pattern:**
```javascript
// Store listener references
const handleMouseMove = (e) => { /* ... */ };
canvas.addEventListener('mousemove', handleMouseMove);

// Clean up when needed
canvas.removeEventListener('mousemove', handleMouseMove);
```

## Step 4: Inspect Canvas Context Leaks

Check canvas rendering for memory issues:

**Review `static/js/renderer.js`:**
- Line 9: `ctx = canvas.getContext('2d')` - Ensure context is reused
- Line 11: `minimapCtx` - Check minimap context usage
- Lines 63-110: `drawGame()` - Verify no context recreation in loop
- Lines 112-155: `drawMinimap()` - Check for context leaks

**Common canvas leaks:**
- Creating new contexts in game loop
- Not clearing canvas properly
- Accumulating path/arc definitions without beginPath()

## Step 5: Check Array Growth

Monitor game state arrays for unbounded growth:

**Inspect `static/js/gameState.js`:**
```javascript
// Check these arrays don't grow indefinitely:
gameState.food          // Should maintain ~200 items
gameState.playerCells   // Should be reasonable (< 16 typically)
gameState.aiPlayers     // Should maintain ~10 items
```

**Add logging to game loop (temporary):**
```javascript
// In game.js gameLoop() function
console.log('Food:', gameState.food.length);
console.log('Player cells:', gameState.playerCells.length);
console.log('AI players:', gameState.aiPlayers.length);
```

## Step 6: Review Collision Detection

Check `static/js/collisions.js` for object accumulation:

**Verify proper cleanup:**
- `handleFoodCollisions()` - Food removal after consumption
- `handlePlayerAICollisions()` - AI removal after being eaten
- `handleAIAICollisions()` - Proper AI merging/removal
- `respawnEntities()` - Respawn logic doesn't duplicate

**Look for:**
- Objects marked for deletion but not removed
- Duplicate object creation
- References preventing garbage collection

## Step 7: Check requestAnimationFrame

Verify game loop doesn't create multiple animation frames:

**In `static/js/game.js` (line 58):**
```javascript
// Ensure only ONE requestAnimationFrame call
function gameLoop() {
    // ... game logic ...
    requestAnimationFrame(gameLoop);  // Should be called once per frame
}
```

**Common issue:**
- Multiple game loops running simultaneously
- Game loop not cancelled on page navigation

## Step 8: Profile with Performance Tab

Use Chrome Performance profiler:
```
1. Open Performance tab in DevTools
2. Click Record
3. Play game for 30 seconds
4. Stop recording
5. Check Memory timeline for steady growth
6. Look for sawtooth pattern (normal GC) vs. steady climb (leak)
```

## Step 9: Test Fixes

After implementing fixes:

// turbo
```bash
npm test
```

Run the game and verify:
- Memory usage stabilizes after initial load
- Heap snapshots show no growing object counts
- Performance remains consistent over time

## Step 10: Common Leak Patterns to Check

**Pattern 1: Closure Leaks**
```javascript
// BAD: Creates new closure each frame
function gameLoop() {
    canvas.addEventListener('click', () => { /* uses gameState */ });
}

// GOOD: Define once outside loop
const handleClick = () => { /* uses gameState */ };
canvas.addEventListener('click', handleClick);
```

**Pattern 2: Detached DOM Nodes**
```javascript
// Check leaderboard updates (renderer.js line 178)
// Ensure innerHTML replacement doesn't accumulate listeners
```

**Pattern 3: Canvas Image Data**
```javascript
// If using getImageData/putImageData, ensure proper cleanup
// Not currently used in this game, but watch for future additions
```

## Expected Results

After following this workflow:
- Memory usage should plateau after ~1 minute of gameplay
- Heap snapshots should show stable object counts
- No continuous memory growth during extended play
- Game maintains 60 FPS without degradation

## Quick Memory Check Command

Monitor memory from console:
```javascript
// Paste in browser console while game is running
setInterval(() => {
    console.log('Food:', gameState.food.length, 
                'Players:', gameState.playerCells.length, 
                'AI:', gameState.aiPlayers.length);
}, 5000);
```
