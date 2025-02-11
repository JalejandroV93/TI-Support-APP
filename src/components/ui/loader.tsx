import React from "react";
import "@/assets/styles/loader.css";

export const Loader = () => {
  return (
    <div className="flex h-screen w-full items-center justify-center overflow-hidden">
      <section className="loader">
        <div
          className="slider"
          style={{ "--i": 0 } as React.CSSProperties}
        ></div>
        <div
          className="slider"
          style={{ "--i": 1 } as React.CSSProperties}
        ></div>
        <div
          className="slider"
          style={{ "--i": 2 } as React.CSSProperties}
        ></div>
        <div
          className="slider"
          style={{ "--i": 3 } as React.CSSProperties}
        ></div>
        <div
          className="slider"
          style={{ "--i": 4 } as React.CSSProperties}
        ></div>
      </section>
    </div>
  );
};
