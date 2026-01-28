## Context

The chat window in [`ChatInterface.tsx`](src/components/ChatInterface.tsx) currently uses React state (`useState`) for dimension management during resize operations. When a user drags the resize handle, every `mousemove` event triggers `setSize()`, which causes:

1. React re-render of `ChatInterface` and potentially child components
2. Re-application of CSS `transition-all duration-300` which conflicts with real-time updates
3. Visual lag where the window trails behind the mouse cursor

The current implementation:

```tsx
const [size, setSize] = React.useState({ width: 600, height: 800 });

const handleMouseMove = (e: MouseEvent) => {
  setSize({ width: newWidth, height: newHeight }); // Triggers re-render
};
```

This results in a sluggish, unresponsive resize experience.

## Goals / Non-Goals

**Goals:**

- Achieve 60fps responsive resizing that tracks mouse movement 1:1
- Eliminate visual lag and "elastic" trailing behavior
- Maintain smooth animations for minimize/maximize actions
- Preserve resize dimensions across minimize/restore cycles

**Non-Goals:**

- No changes to resize handle UI appearance or position
- No changes to minimize/maximize functionality beyond animation behavior
- No changes to minimum/maximum size constraints (350x400 min, 90% screen max)
- No new features (pure performance optimization)

## Decisions

### Decision: Direct DOM manipulation during resize

**Choice:** Use `ref` to directly manipulate DOM styles during resize, bypassing React's render cycle.

**Rationale:**

- Mousemove events fire at 60-120Hz (every 8-16ms)
- React re-renders take ~1-16ms depending on component complexity
- Direct DOM updates take <1ms and don't trigger reconciliation
- This is a transient UI interaction, not state that other components need during the drag

**Implementation:**

```tsx
const cardRef = React.useRef<HTMLDivElement>(null);

const handleMouseMove = (e: MouseEvent) => {
  if (cardRef.current) {
    cardRef.current.style.width = `${newWidth}px`;
    cardRef.current.style.height = `${newHeight}px`;
  }
};
```

### Decision: Transition class conditional application

**Choice:** Dynamically add/remove `transition-all duration-300` class based on resize state.

**Rationale:**

- Transitions are desirable for minimize/maximize (visual polish)
- Transitions are detrimental during resize (cause lag)
- A boolean flag can control this without complex logic

**Implementation:**

```tsx
className={`... ${isResizing ? '' : 'transition-all duration-300'} ...`}
```

### Decision: State synchronization on mouseup only

**Choice:** Sync React state only when resize completes (`mouseup` event).

**Rationale:**

- React state is needed for minimize/restore to know dimensions
- State updates on every mousemove were the performance bottleneck
- Single state update at end preserves final dimensions

**Trade-off:** If component unmounts during resize (unlikely), dimensions are lost. This is acceptable for this UX.

### Decision: No requestAnimationFrame needed

**Choice:** Skip `requestAnimationFrame` throttling in favor of direct DOM updates.

**Rationale:**

- `requestAnimationFrame` adds complexity and still queues updates
- Direct DOM manipulation is already optimal for this use case
- If profiling reveals issues, RAF can be added later

## Risks / Trade-offs

| Risk                                         | Mitigation                                                                    |
| -------------------------------------------- | ----------------------------------------------------------------------------- |
| **State desync** if mouseup is missed (rare) | Implement `mouseleave` on window as fallback to ensure resize flag is cleared |
| **Dimensions lost** if unmount during resize | Extremely unlikely; user must close app mid-drag. Acceptable edge case.       |
| **CSS specificity conflicts**                | Use inline styles for dynamic dimensions (highest specificity)                |
| **Accessibility concerns**                   | Resize handle already exists; no keyboard resize changes                      |

## Migration Plan

This is a self-contained component change with no external dependencies or breaking changes.

**Deploy Steps:**

1. Implement changes in `ChatInterface.tsx`
2. Verify with 4 manual test scenarios (see proposal Test Strategy)
3. Deploy as standard code change

**Rollback:**

- Single file revert if issues arise
- No data migration or state concerns

## Open Questions

_None - this is a straightforward performance optimization with clear implementation path._
