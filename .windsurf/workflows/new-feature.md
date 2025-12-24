---
description: Feature Development Workflow - Structured approach to adding new game mechanics
---

# Feature Development Workflow

This workflow guides you through adding new features to the Agar.io clone in a structured way.

## Steps

1. **Create Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Plan Your Feature**
   - Identify which modules need changes:
     - `entities.js` - New entity types or behaviors
     - `collisions.js` - New collision logic
     - `renderer.js` - Visual changes
     - `config.js` - New configuration constants
     - `app.py` - Backend changes

3. **Run Baseline Tests**
   ```bash
   npm test
   ```
   Ensure all tests pass before starting.

4. **Implement Core Logic**
   Start with the core game logic in the appropriate JavaScript modules.

5. **Add Configuration**
   Add any new constants to `static/js/config.js`:
   ```javascript
   // Example: New feature constants
   export const NEW_FEATURE_ENABLED = true;
   export const NEW_FEATURE_VALUE = 10;
   ```

6. **Update Game Loop (if needed)**
   Modify `static/js/game.js` if your feature affects the main game loop.

7. **Add Backend Support (if needed)**
   Update `app.py` if your feature requires server-side logic.

8. **Write Tests**
   Add tests in `static/js/__tests__/` for your new functionality:
   ```bash
   # Create test file for new feature
   touch static/js/__tests__/your-feature.test.js
   ```

9. **Test Manually**
   ```bash
   python3 app.py
   ```
   Open http://localhost:5000 and test your feature thoroughly.

10. **Run All Tests**
    ```bash
    npm test
    ```
    Ensure all tests pass including your new ones.

11. **Commit Your Changes**
    ```bash
    git add .
    git commit -m "feat: add [description of your feature]"
    ```

12. **Push and Create PR**
    ```bash
    git push origin feature/your-feature-name
    ```

## Feature Ideas

- **Power-ups**: Special food that gives temporary abilities
- **Obstacles**: Static objects that block movement
- **Teams**: Color-coded team gameplay
- **Leaderboard**: Real-time scoring system
- **Sound effects**: Audio feedback for actions
- **Particle effects**: Visual enhancements for collisions

## Testing Checklist

- [ ] Feature works as expected
- [ ] No console errors
- [ ] All existing tests still pass
- [ ] New tests added for new functionality
- [ ] Performance impact is acceptable
- [ ] Feature is configurable (if appropriate)
