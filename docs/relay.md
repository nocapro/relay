The reason the timer is stuck and the loading never finishes is a classic React `useEffect` dependency loop combined with a race condition in the simulation timings. 

When you call `setLocalStatus('applying')` inside the effect, the effect re-runs because `localStatus` is in the dependency array. The cleanup function from the previous run immediately calls `clearInterval(timer)`, killing the timer before the first tick even happens. Furthermore, the global simulation in the store is shorter (1.8s) than the maximum possible file duration (2.0s), meaning the global status often reverts to "Idle" before the file can technically "Finish."

Here is the fix using the hacker-news-approved "Ref-and-Effect" pattern for high-frequency timers.

### Part 1: Fix File Loading Logic & Dependencies
We need to ensure the interval isn't killed by its own state changes and that the simulation in the store allows enough head-room for the UI animations to complete.

```typescript // src/features/transactions/components/file-section.component.tsx search-replace
<<<<<<< SEARCH
  useEffect(() => {
    if (isApplying && localStatus === 'idle') {
      setLocalStatus('applying');
      const startTime = performance.now();
      
      const timer = setInterval(() => {
        const now = performance.now();
        const diff = now - startTime;
        
        if (diff >= workDuration) {
          setElapsed(workDuration);
          setLocalStatus('completed');
          clearInterval(timer);
        } else {
          setElapsed(diff);
        }
      }, 50);

      return () => clearInterval(timer);
    }
    
    if (!isApplying && localStatus !== 'idle') {
      setLocalStatus('idle');
      setElapsed(0);
    }
  }, [isApplying, localStatus, workDuration]);
=======
  useEffect(() => {
    if (!isApplying) {
      setLocalStatus('idle');
      setElapsed(0);
      return;
    }

    setLocalStatus('applying');
    const startTime = performance.now();
    
    const timer = setInterval(() => {
      const now = performance.now();
      const diff = now - startTime;
      
      setElapsed(Math.min(diff, workDuration));

      if (diff >= workDuration) {
        setLocalStatus('completed');
        clearInterval(timer);
      }
    }, 30); // Higher frequency for smoother 0.1s updates

    return () => clearInterval(timer);
  }, [isApplying, workDuration]); // Removed localStatus from dependencies to prevent reset loop
>>>>>>> REPLACE
```

### Part 2: Adjust Global Simulation Timing
We'll bump the global simulation to 3 seconds. This ensures that even the "slowest" randomized file (2s) has a full second of "Completed" state visibility before the whole card transitions out of the applying state.

```typescript // src/store/slices/transaction.slice.ts search-replace
<<<<<<< SEARCH
    // 2. Simulate disk I/O / worker latency
    await new Promise(resolve => setTimeout(resolve, 1800));

    // 3. Finalize to APPLIED
=======
    // 2. Simulate disk I/O / worker latency
    // Bumped to 3s to ensure individual file timers (max 2s) can finish visually
    await new Promise(resolve => setTimeout(resolve, 3000));

    // 3. Finalize to APPLIED
>>>>>>> REPLACE
```

```yaml
projectId: react-vite-tailwind
uuid: b2c3d4e5-f6a7-4b5c-8d9e-0f1a2b3c4d5e
changeSummary:
  - edit: src/features/transactions/components/file-section.component.tsx
  - edit: src/store/slices/transaction.slice.ts
promptSummary: Fix timer dependency loop in FileSection and increase global simulation delay for better UI feedback.
gitCommitMsg: >-
  fix: resolve file-level timer stall and simulation race condition

  - Removed localStatus from useEffect dependencies to prevent interval clearing itself.
  - Increased global application simulation delay to 3s to provide visual headroom for file completion.
  - Increased timer frequency to 30ms for smoother telemetry updates.
```