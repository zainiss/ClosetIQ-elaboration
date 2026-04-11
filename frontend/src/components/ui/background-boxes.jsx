import React from "react";
import { motion } from "framer-motion";

const BoxesCore = ({ style, ...rest }) => {
  const rows = new Array(150).fill(1);
  const cols = new Array(100).fill(1);

  // Indigo/purple palette to match the app's color scheme
  const colors = [
    "rgba(99,  102, 241, 0.5)",  // indigo-500
    "rgba(139,  92, 246, 0.5)",  // purple-500
    "rgba(129, 140, 248, 0.45)", // indigo-400
    "rgba(167, 139, 250, 0.45)", // purple-400
    "rgba(196, 181, 253, 0.4)",  // violet-300
    "rgba(165, 180, 252, 0.4)",  // indigo-300
    "rgba(79,   70, 229, 0.5)",  // indigo-600
    "rgba(109,  40, 217, 0.45)", // purple-700
    "rgba(255, 255, 255, 0.12)", // white accent
  ];

  const getRandomColor = () => colors[Math.floor(Math.random() * colors.length)];

  const borderColor = "rgba(255, 255, 255, 0.08)";
  const svgColor    = "rgba(255, 255, 255, 0.08)";

  return (
    <div
      style={{
        transform: "translate(-40%,-60%) skewX(-48deg) skewY(14deg) scale(0.675) translateZ(0)",
        position: "absolute",
        left: "25%",
        top: "-25%",
        padding: "1rem",
        display: "flex",
        width: "100%",
        height: "100%",
        zIndex: 0,
        pointerEvents: "none",
        ...style,
      }}
      {...rest}
    >
      {rows.map((_, i) => (
        <motion.div
          key={`row${i}`}
          style={{
            width: "4rem",
            height: "2rem",
            borderLeft: `1px solid ${borderColor}`,
            position: "relative",
            flexShrink: 0,
          }}
        >
          {cols.map((_, j) => (
            <motion.div
              key={`col${j}`}
              whileHover={{
                backgroundColor: getRandomColor(),
                transition: { duration: 0 },
              }}
              style={{
                width: "4rem",
                height: "2rem",
                borderRight: `1px solid ${borderColor}`,
                borderTop:   `1px solid ${borderColor}`,
                position: "relative",
                pointerEvents: "auto",
              }}
            >
              {j % 2 === 0 && i % 2 === 0 ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke={svgColor}
                  style={{
                    position: "absolute",
                    height: "1.5rem",
                    width: "2.5rem",
                    top: "-14px",
                    left: "-22px",
                    pointerEvents: "none",
                  }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 6v12m6-6H6"
                  />
                </svg>
              ) : null}
            </motion.div>
          ))}
        </motion.div>
      ))}
    </div>
  );
};

export const Boxes = React.memo(BoxesCore);
