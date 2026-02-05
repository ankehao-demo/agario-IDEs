---
description: Game Development & Testing Workflow - Complete development cycle for Agar.io clone
auto_execution_mode: 1
---

# Game Development & Testing Workflow

This workflow provides a complete development cycle for the Agar.io clone game, ensuring code quality and functionality.

## Steps

1. **Run Jest Tests**
   ```bash
   npm test
   ```
   Verify all existing tests pass before making changes.

2. **Start Flask Development Server**
   // turbo
   ```bash
   python3 app.py
   ```
   Starts the backend server on http://localhost:5000

3. **Open Game in Browser**
   Open http://localhost:5000 in your browser to test the game.

4. **Make Your Changes**
   Edit the relevant files:
   - `static/js/entities.js` - Player, AI, and food entities
   - `static/js/collisions.js` - Collision detection logic
   - `static/js/renderer.js` - Game rendering
   - `static/js/game.js` - Main game loop
   - `app.py` - Backend Flask routes

5. **Test Your Changes**
   - Refresh browser to see changes
   - Test game functionality manually
   - Check browser console for errors

6. **Run Tests Again**
   ```bash
   npm test
   ```
   Ensure your changes don't break existing functionality.

7. **Add New Tests (if needed)**
   If you added new functions, add corresponding tests in `static/js/__tests__/`

## Quick Commands

- **Full test run**: `npm test`
- **Start server**: `python3 app.py`
- **View test coverage**: `npm test -- --coverage`

## Troubleshooting

- If Flask server fails to start, check Python dependencies: `pip3 install -r requirements.txt`
- If tests fail, check the console output for specific errors
- For JavaScript errors, use browser developer tools
