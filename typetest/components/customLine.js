import { Chart } from "chart.js";
import { useRef, useEffect, useState } from "react";

export default function CustomLine({ data, options }) {
  const [legend, setLegend] = useState([]);
  const [crossRotColour, setCrossRotColour] = useState("rgb(225,25,25)");

  // use a ref to store the chart instance since it it mutable
  const chartRef = useRef(null);

  // callback creates the chart on the canvas element
  const canvasCallback = (canvas) => {
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (ctx && !chartRef.current) {
      chartRef.current = new Chart(ctx, {
        type: "line",
        data: data,
        options: options,
      });
    }
  };

  // effect to update the chart when props are updated
  useEffect(() => {
    // must verify that the chart exists
    const chart = chartRef.current;
    if (chart) {
      setLegend(chart.legend.legendItems);
      console.log(chart.legend.legendItems);
      chart.data = data;
      chart.options = options;
      chart.update();
    }
  }, [data, options]);

  return (
    <div className='chartContainer'>
      <div className='overflow'>
        <div className='legend'>
          {legend.map((l, i) => {
            return (
              <div
                className='label legendItem'
                key={i}
                style={{
                  color: l.fontColor,
                }}
              >
                <span
                  className={l.pointStyle || "circle"}
                  style={{ backgroundColor: l.fontColor }}
                ></span>
                {l.text}
              </div>
            );
          })}
        </div>
        <canvas ref={canvasCallback}></canvas>
      </div>
      <style jsx>{`
        .chartContainer {
          position: relative;
          width: 100%;
          height: 100%;
        }
        .overflow {
          overflow: hidden;
          height: 100%;
          max-height: 50vh;
          min-height: 500px;
        }
        .legend {
          display: flex;

          position: absolute;
          left: 108px;
        }
        .legendItem {
          display: flex;
          margin-right: 64px;
        }

        .crossRot,
        .circle {
          position: relative;
          display: inline-block;
          min-height: 16px;
          min-width: 16px;
          height: 16px;
          width: 16px;
          margin-right: 12px;
          margin-top: 6px;
        }

        .crossRot {
          background-color: transparent !important;
        }

        .crossRot:before,
        .crossRot:after {
          position: absolute;
          content: "";
          width: 100%;
          height: 3px; /* cross thickness */
          border-radius: 4px;
          top: 50%;
          background-color: ${crossRotColour};
        }
        .crossRot:before {
          transform: rotate(45deg);
        }
        .crossRot:after {
          transform: rotate(-45deg);
        }

        .circle {
          border-radius: 50%;
        }
      `}</style>
    </div>
  );
}
