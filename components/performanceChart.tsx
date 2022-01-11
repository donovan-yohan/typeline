import React, {
  useContext,
  useState,
  useEffect,
  useRef,
  MouseEvent,
} from "react";
import Context from "./context";
import { defaults } from "react-chartjs-2";
import { formatTime } from "../utils/formatTime";
import CustomLine from "./customLine";
import { ChartStat } from "pages";
import { Chart, LegendItem, TooltipItem } from "chart.js";

interface Props {
  rawStats: ChartStat[];
}

const AVERAGING_SAMPLES = 2;
const MAIN_DATA_WEIGHT = 0.85;

const weightedAverage = (
  array: number[],
  i: number,
  totalSamples: number,
  weight: number
) => {
  let value = 0;

  let remainingWeight = 1;
  let nextWeight = weight;

  for (let k = 1; k <= totalSamples; k++) {
    if (i - k >= 0) {
      value += array[i - k + 1] * nextWeight;
      remainingWeight -= nextWeight;
      nextWeight = remainingWeight * weight;
    }
  }
  value += remainingWeight * (array[i - totalSamples] || array[0]);
  return value;
};

const parseStats = (rawStats: ChartStat[]) => {
  let rawArray = rawStats.map((s) => s.raw);
  return rawStats.map((stat, i) => {
    let raw = weightedAverage(rawArray, i, AVERAGING_SAMPLES, MAIN_DATA_WEIGHT);

    return {
      wpm: stat.wpm,
      raw: Math.floor(raw),
      correctInInterval: stat.correctInInterval,
      incorrectInInterval: stat.incorrectInInterval,
      correctedInInterval: stat.correctedInInterval,
      time: stat.time,
      correctToTime: stat.correctToTime,
      incorrectToTime: stat.incorrectToTime,
      correctedToTime: stat.correctedToTime,
    };
  });
};

const getLabelString = (context: TooltipItem<"line">) => {
  let value = `${context.parsed.y}`;
  if (!context.dataset.label) return value;
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

function PerformanceChartComponent({ rawStats }: Props) {
  const theme = useContext(Context);
  const chartParentRef = useRef<HTMLDivElement>(null);

  defaults.font.family = "Nunito";
  defaults.font.size = 14;
  defaults.font.lineHeight = 1.5;
  defaults.font.weight = "700";

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
        pointHoverRadius: 8,
        borderWidth: 3,
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
        pointRadius: 3,
        pointHitRadius: 12,
        pointHoverRadius: 6,
        borderWidth: 2,
      },
    ],
  };

  const hasLowWPM = stats.some((s) => s.wpm < 10 || s.raw < 10);
  const needsMinHeight = stats.every((s) => s.wpm < 47 && s.raw < 47);

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
        min: hasLowWPM ? -0.99 : 0,
        max: needsMinHeight ? 50 : null,
        suggstedMin: 0,
        grace: "5%",
        ticks: {
          font: {
            weight: 400,
          },
          callback: function (val: number) {
            return val > 0 ? val : Math.ceil(val);
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
          callback: (tick: number) => {
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
          generateLabels: (chart: Chart<"line">) => {
            let data = chart.data.datasets;
            return data.map((l) => {
              return {
                text: l.label?.toLowerCase() || "",
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
        onClick: function (e: MouseEvent, legendItem: LegendItem) {
          // do nothing
        },
      },
      tooltip: {
        titleColor: theme.values.main,
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
          title: (context: TooltipItem<"line">[]) => {
            return formatTime(context[0].parsed.x + 1);
          },
          label: (context: TooltipItem<"line">) => {
            return getLabelString(context);
          },
          labelTextColor: (context: TooltipItem<"line">) => {
            return context.dataset.backgroundColor;
          },
          labelColor: (context: TooltipItem<"line">) => {
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
    <div ref={chartParentRef} className={"container"}>
      <CustomLine
        data={data}
        options={options}
        chartHeight={chartParentRef.current?.parentElement?.clientHeight}
      />
      <style jsx>{`
        .container {
          position: relative;
          width: 100%;
          height: 100%;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}

export default React.memo(PerformanceChartComponent);
