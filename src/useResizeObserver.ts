import { useState, useEffect } from "react";

interface Size {
  width: number;
  height: number;
}

function useResizeObserver(element: HTMLElement | null) {
  const [size, setSize] = useState<Size>({ width: 0, height: 0 });

  useEffect(() => {
    if (element) {
      const observer = new ResizeObserver((entries) => {
        for (let entry of entries) {
          const { width, height } = entry.contentRect;
          setSize({ width, height });
        }
      });

      observer.observe(element);

      return () => observer.disconnect();
    }
  }, [element]);

  return size;
}

export default useResizeObserver;