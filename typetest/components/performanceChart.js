import React, { useContext, useState, useEffect } from "react";
import Context from "../components/context";
import { Line, defaults } from "react-chartjs-2";
import { formatTime } from "../utils/formatTime";
import CustomLine from "./customLine";

const AVERAGING_FACTOR = 2;

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

const getLabelString = (context) => {
  let value = ` ${context.parsed.y}`;
  if (context.dataset.label.includes("WPM")) {
    return (
      value + `wpm ${context.dataset.label.replace(" WPM", "").toLowerCase()}`
    );
  } else if (context.dataset.label.includes("Error")) {
    if (context.parsed.y == 1) {
      return value + ` error`;
    } else {
      return value + ` errors`;
    }
  } else {
    return value + ` ${context.dataset.label.toLowerCase()}`;
  }
};

export default function PerformanceChart({ rawStats }) {
  const theme = useContext(Context);

  defaults.font.family = "Nunito";
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
        pointRadius: 6,
        pointBorderColor: theme.values.incorrect,
        pointBorderWidth: 2,
        pointHitRadius: 12,
        pointHoverRadius: 9,
        pointHoverBorderWidth: 3,
      },
      {
        label: "Average WPM",
        data: stats.map((s) => s.wpm),
        fill: false,
        backgroundColor: theme.values.highlight,
        borderColor: theme.values.highlight,
        spanGaps: true,
        tension: 0.4,
        yAxisID: "wpmAxis",
        pointHitRadius: 12,
        pointHoverRadius: 6,
      },
      {
        label: "Raw WPM at Time",
        data: stats.map((s) => s.raw),
        fill: false,
        backgroundColor: theme.values.main,
        borderColor: theme.values.main,
        spanGaps: true,
        tension: 0.4,
        yAxisID: "wpmAxis",
        pointHitRadius: 12,
        pointHoverRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      wpmAxis: {
        type: "linear",
        display: true,
        position: "left",
        grid: {
          display: false,
          drawBorder: false,
        },
        // stop WPM axis from going negative for very low WPM
        min: stats[stats.length - 1].wpm < 10 ? 0 : null,
        suggstedMin: 0,
        grace: "5%",
        ticks: {
          font: {
            weight: 400,
          },
          callback: function (val, index) {
            return val;
          },
        },
      },
      errorAxis: {
        type: "linear",
        display: true,
        position: "right",
        grid: {
          display: false,
          drawBorder: false,
        },
        ticks: {
          color: theme.values.background,
          beginAtZero: true,
          callback: (tick) => {
            if (tick % 1 === 0) return tick;
          },
        },
        min: 0,
        grace: "5%",
      },
      x: {
        grid: {
          display: false,
          drawBorder: false,
        },
        ticks: {
          font: {
            weight: 400,
          },
        },
      },
    },
    plugins: {
      legend: {
        display: false,
        labels: {
          generateLabels: (chart) => {
            let data = chart.data.datasets;
            return data.map((l, i) => {
              return {
                text: l.label.toLowerCase(),
                fontColor: l.backgroundColor,
                fillStyle: "fill",
                strokeStyle: "none",
                pointStyle: l.pointStyle,
                fillColor: l.backgroundColor,
                color: l.backgroundColor,
              };
            });
          },
        },
        onClick: function (e, legendItem, legend) {
          // do nothing
        },
      },
      tooltip: {
        usePointStyle: true,
        backgroundColor: theme.values.tooltipColourFade,
        boxWidth: 12,
        padding: 16,
        bodySpacing: 4,
        bodyFont: {
          weight: "normal",
        },
        cornerRadius: 2,
        caretSize: 6,
        caretPadding: 4,
        multiKeyBackground: "rgba(0,0,0,0)",
        callbacks: {
          title: (context) => {
            return formatTime(context[0].parsed.x + 1);
          },
          label: (context) => {
            return getLabelString(context);
          },
          labelTextColor: (context) => {
            return context.backgroundColor;
          },
          labelColor: (context) => {
            return {
              bodyColor: context.dataset.backgroundColor,
              borderColor: context.dataset.backgroundColor,
              backgroundColor: context.dataset.backgroundColor,
              borderWidth: 0,
              borderDash: [],
              borderRadius: 0,
            };
          },
        },
      },
    },
  };
  return (
    <div className={"container"}>
      <CustomLine data={data} options={options} />
      <style jsx>{`
        .container {
          position: relative;
          width: 100%;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}
