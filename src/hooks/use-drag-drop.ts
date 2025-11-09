import { useEffect, useRef } from "react";
import { getCurrentWebview } from "@tauri-apps/api/webview";

interface DragDropCallbacks {
  onDrop?: (paths: string[], position: { x: number; y: number }) => void | Promise<void>;
  onHover?: (position: { x: number; y: number }) => void;
  onLeave?: () => void;
}

export function useDragDrop(callbacks: DragDropCallbacks) {
  const callbacksRef = useRef(callbacks);

  // Update ref when callbacks change to avoid re-registering the event listener
  useEffect(() => {
    callbacksRef.current = callbacks;
  }, [callbacks]);

  useEffect(() => {
    let unlisten: (() => void) | undefined;
    let mounted = true;

    (async () => {
      const unlistenFn = await getCurrentWebview().onDragDropEvent(async (event) => {
        if (!mounted) return;

        if (event.payload.type === 'over') {
          callbacksRef.current.onHover?.(event.payload.position);
        } else if (event.payload.type === 'drop') {
          await callbacksRef.current.onDrop?.(event.payload.paths, event.payload.position);
        } else {
          callbacksRef.current.onLeave?.();
        }
      });

      if (mounted) {
        unlisten = unlistenFn;
      } else {
        // Component unmounted before listener was registered
        unlistenFn();
      }
    })();

    return () => {
      mounted = false;
      unlisten?.();
    };
  }, []);
}
