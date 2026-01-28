## Why

The current chat window resizing experience is suboptimal. Users report that dragging the resize corner is laggy, slow, and the window does not track the mouse pointer responsively. This is likely due to a combination of expensive React re-renders on every mouse move and CSS transitions interfering with the real-time dimension updates.

## What Changes

To achieve 60fps responsive resizing:

- **Direct DOM Manipulation**: Switch from React state-based updates (`setSize`) to direct DOM updates via `ref` during the drag operation. This bypasses the React render cycle for immediate visual feedback.
- **Transition Management**: Dynamically disable CSS transitions (`transition-all`) specifically during the Resize interaction. Transitions should only be active for minimize/maximize actions.
- **State Synchronization**: Sync the React state (`size`) only on `mouseup` to ensure the final dimension is preserved for subsequent renders (e.g., toggling minimize/maximize).
- **Optimization**: Use `requestAnimationFrame` for the resize handler if needed to further decouple input from rendering, though direct DOM updates usually suffice.

## Capabilities

### New Capabilities

_(None - this is a performance fix for an existing feature)_

### Modified Capabilities

- `chat-window-behavior`: The behavior of the chat window resizing will be modified to be instantaneous and strictly coupled to mouse movement, rather than transitioned.

## Impact

- **UI Components**: `src/components/ChatInterface.tsx`
- **Performance**: significantly reduced main-thread work during resizing; elimination of layout thrashing caused by fighting CSS transitions.

## Test Strategy

1.  **Responsiveness Test**: rapidly drag the resize handle (top-left corner). The window corner must follow the mouse cursor 1:1 with zero visible delay or "elastic" lag.
2.  **Transition Test**: Click the minimize/maximize button. The window should still animate smoothly (slide down/up).
3.  **Persistence Test**: Resize the window -> Minimize -> Restore. The window should restore to the _new_ resized dimensions, not the default.
4.  **Boundary Test**: Try to resize smaller than minimum constraints or larger than screen. Verify existing constraints (min 350x400) are respected.

## ADDED/MODIFIED/REMOVED

### Modified

- `src/components/ChatInterface.tsx`
