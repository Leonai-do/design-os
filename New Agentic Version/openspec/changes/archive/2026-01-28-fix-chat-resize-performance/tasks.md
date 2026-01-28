## 1. Setup Refs and State Management

- [x] 1.1 Add `cardRef` using `React.useRef<HTMLDivElement>(null)` to reference the Card element
- [x] 1.2 Add `isResizing` state using `React.useState(false)` to track resize mode
- [x] 1.3 Keep existing `size` state for persistence across minimize/restore

## 2. Implement Direct DOM Resize

- [x] 2.1 Update `handleMouseMove` to use `cardRef.current.style.width/height` instead of `setSize()`
- [x] 2.2 Apply min/max constraints (350/400 min, 90vw/90vh max) before DOM updates
- [x] 2.3 Set `isResizing(true)` when resize starts in `startResizing` handler
- [x] 2.4 Set `isResizing(false)` when resize ends in `handleMouseUp`

## 3. Add State Synchronization

- [x] 3.1 Add `mouseup` handler that reads final dimensions from `cardRef.current`
- [x] 3.2 Sync dimensions to React state only on `mouseup`
- [x] 3.3 Ensure dimensions persist when minimize then restore

## 4. Manage CSS Transitions

- [x] 4.1 Remove `transition-all duration-300` from default Card className
- [x] 4.2 Add conditional: apply transitions only when `!isResizing && !isMinimized`
- [ ] 4.3 Verify transitions still work for minimize/maximize animations

## 5. Testing and Verification

- [ ] 5.1 **Responsiveness Test**: Drag resize handle rapidly - window should follow mouse 1:1
- [ ] 5.2 **Transition Test**: Minimize/maximize should still animate smoothly
- [ ] 5.3 **Persistence Test**: Resize → Minimize → Restore should keep new dimensions
- [ ] 5.4 **Boundary Test**: Verify min 350x400 and max 90% screen constraints
- [ ] 5.5 **Edge Case**: Resize to min, minimize, restore - should maintain min size

---

**Implementation Notes:**

- Used `useState` for `isResizing` instead of `useRef` to trigger re-render for transition class updates
- Direct DOM manipulation in `handleMouseMove` bypasses React render cycle during drag
- State sync in `handleMouseUp` preserves final dimensions for minimize/restore
- Transition class computed as: `(!isResizing && !isMinimized) ? 'transition-all duration-300' : ''`

## 5. Testing and Verification

- [ ] 5.1 **Responsiveness Test**: Drag resize handle rapidly - window should follow mouse 1:1
- [ ] 5.2 **Transition Test**: Minimize/maximize should still animate smoothly
- [ ] 5.3 **Persistence Test**: Resize → Minimize → Restore should keep new dimensions
- [ ] 5.4 **Boundary Test**: Verify min 350x400 and max 90% screen constraints
- [ ] 5.5 **Edge Case**: Resize to min, minimize, restore - should maintain min size
