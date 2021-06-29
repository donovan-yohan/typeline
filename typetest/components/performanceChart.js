import React, { useContext } from "react";
import Context from "../components/context";
import { Line } from "react-chartjs-2";

export default function PerformanceChart({ rawStats }) {
  const theme = useContext(Context);

  const data = {
    labels: rawStats.map((s) => s.time),
    datasets: [
      {
        label: "WPM",
        data: rawStats.map((s) => s.wpm),
        fill: false,
        backgroundColor: theme.values.highlight,
        borderColor: theme.values.highlight,
        spanGaps: true,
        tension: 0.33,
        yAxisID: "wpmAxis",
      },
      {
        label: "Raw",
        data: rawStats.map((s) => s.raw),
        fill: false,
        backgroundColor: theme.values.main,
        borderColor: theme.values.main,
        spanGaps: true,
        tension: 0.25,
        yAxisID: "wpmAxis",
      },
      {
        label: "Errors",
        data: rawStats.map((s) =>
          s.incorrectInInterval > 0 ? s.incorrectInInterval : undefined
        ),
        fill: false,
        backgroundColor: theme.values.incorrect,
        borderColor: theme.values.incorrect,
        showLine: false,
        pointStyle: "crossRot",
        yAxisID: "errorAxis",
        pointRadius: 5,
      },
    ],
  };

  const options = {
    scales: {
      wpmAxis: {
        type: "linear",
        display: true,
        position: "left",
        min: 0,
        title: {
          display: true,
          text: "WPM",
        },
      },
      errorAxis: {
        type: "linear",
        display: true,
        position: "right",
        gridLines: {
          drawOnArea: false,
        },
        ticks: {
          beginAtZero: true,
        },
        min: 0,
        title: {
          display: true,
          text: "Errors",
        },
      },
      x: {
        title: {
          display: true,
          text: "Time",
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
    },
  };
  return (
    <div className={"container"}>
      <Line data={data} options={options} />
      <style jsx>{`
        .container {
          display: flex;
          width: 100%;
          flex-direction: column;
        }
      `}</style>
    </div>
  );
}
