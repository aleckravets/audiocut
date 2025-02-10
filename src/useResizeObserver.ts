import { useState, useEffect, useRef, useCallback } from "react";

interface Size {
  width: number;
  height: number;
}

type ResizeCallback = (size: Size) => void;

function useResizeObserver(element: HTMLElement | null) {
  const [size, setSize] = useState<Size>({ width: 0, height: 0 });
  const callbackRefs = useRef<ResizeCallback[]>([]);

  const subscribe = useCallback((callback: ResizeCallback) => {
    callbackRefs.current.push(callback);
    return () => {
      callbackRefs.current = callbackRefs.current.filter(cb => cb !== callback);
    };
  }, []);

  useEffect(() => {
    if (element) {
      const observer = new ResizeObserver((entries) => {
        for (let entry of entries) {
          const { width, height } = entry.contentRect;
          setSize({ width, height });
          callbackRefs.current.forEach(cb => cb({ width, height }));
        }
      });

      observer.observe(element);

      return () => observer.disconnect();
    }
  }, [element]);

  return { size, subscribe };
}

export default useResizeObserver;