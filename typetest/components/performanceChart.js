import React, { useContext, useState, useEffect } from "react";
import Context from "../components/context";
import { Line, defaults } from "react-chartjs-2";

const AVERAGING_FACTOR = 3;

const parseStats = (rawStats) => {
  return rawStats.map((stat, i) => {
    let raw = parseInt(stat.raw);
    let adj = 1;
    for (let k = 1; k <= AVERAGING_FACTOR; k++) {
      if (i - k >= 0) {
        raw += parseInt(rawStats[i - k].raw);
        adj += 1;
      }
    }
    raw /= adj;
    return {
      wpm: stat.wpm,
      raw: raw,
      correctInInterval: stat.correctInInterval,
      incorrectInInterval: stat.incorrectInInterval,
      time: stat.time,
      correctToTime: stat.correctToTime,
      incorrectToTime: stat.incorrectToTime,
    };
  });
};

export default function PerformanceChart({ rawStats }) {
  const theme = useContext(Context);

  defaults.font.family = "Roboto";
  defaults.font.size = 14;
  defaults.font.lineHeight = 1.5;
  defaults.font.weight = 700;

  const [stats, setStats] = useState(parseStats(rawStats));
  useEffect(() => {
    setStats(parseStats(rawStats));
  }, [rawStats]);

  const data = {
    labels: stats.map((s) => s.time),
    datasets: [
      {
        label: "Errors",
        data: stats.map((s) =>
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
      {
        label: "WPM",
        data: stats.map((s) => s.wpm),
        fill: false,
        backgroundColor: theme.values.highlight,
        borderColor: theme.values.highlight,
        spanGaps: true,
        tension: 0.4,
        yAxisID: "wpmAxis",
      },
      {
        label: "Raw",
        data: stats.map((s) => s.raw),
        fill: false,
        backgroundColor: theme.values.main,
        borderColor: theme.values.main,
        spanGaps: true,
        tension: 0.4,
        yAxisID: "wpmAxis",
      },
    ],
  };

  const options = {
    scales: {
      wpmAxis: {
        type: "linear",
        display: true,
        position: "left",
        suggstedMin: 0,
        grace: "10%",
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
          callback: (tick) => {
            if (tick % 1 === 0) return tick;
          },
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
        display: true,
        labels: {
          usePointStyle: true,
          boxWidth: 7,
        },
      },
      tooltip: {
        usePointStyle: true,
        boxWidth: 10,
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
