"use client";
import { ReactSVG } from "react-svg";

type TeaLeafIconProps = {
  color: string;
};

export default function TeaLeafIcon({ color }: TeaLeafIconProps) {
  return (
    <div>
      <ReactSVG
        src="/tea.svg"
        beforeInjection={(svg) => {
          svg.querySelectorAll("path").forEach((path) => {
            path.setAttribute("fill", color);
          });
          svg.setAttribute("width", "256px");
          svg.setAttribute("height", "256px");
        }}
      />
    </div>
  );
}
