import React, { useState, useMemo, useCallback } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, Legend } from 'recharts';
import { Slider } from './ui/slider';
import {
  TOTAL_POPULATION,
  generateData,
  calculateMetrics,
  calculatePerformanceMetrics
} from '../utils/math';


const SliderControl = React.memo(({ label, value, onChange, min, max, step = 1 }) => (
  <div className="space-y-1">
    <label className="text-sm font-medium">{label}: {value.toFixed(2)}</label>
    <Slider value={[value]} onValueChange={([v]) => onChange(v)} min={min} max={max} step={step} />
  </div>
));
SliderControl.displayName = 'SliderControl';

const MetricDisplay = React.memo(({ name, formula, calculation, value }) => (
  <div className="border p-2 rounded text-sm">
    <h4 className="font-bold">{name}</h4>
    <p className="font-mono text-xs">Formula: {formula}</p>
    <p className="font-mono text-xs">Calculation: {calculation}</p>
    <p className="font-semibold">Value: {value.toFixed(4)}</p>
  </div>
));
MetricDisplay.displayName = 'MetricDisplay';

const ClassificationDemo = React.memo(() => {
  const [prevalence, setPrevalence] = useState(0.3);
  const [positiveMean, setPositiveMean] = useState(60);
  const [positiveSd, setPositiveSd] = useState(10);
  const [negativeMean, setNegativeMean] = useState(40);
  const [negativeSd, setNegativeSd] = useState(10);
  const [operatingPoint, setOperatingPoint] = useState(50);

  const data = useMemo(() => {
    return generateData({
      prevalence,
      positiveMean,
      positiveSd,
      negativeMean,
      negativeSd
    });
  }, [prevalence, positiveMean, positiveSd, negativeMean, negativeSd]);

  const metrics = useMemo(() => {
    return calculateMetrics(data, operatingPoint);
  }, [data, operatingPoint]);

  const { tp, fn, fp, tn } = metrics;

  const performanceMetrics = useMemo(() => {
    return calculatePerformanceMetrics(metrics);
  }, [metrics]);

  const { sensitivity, specificity, ppv, npv, accuracy } = performanceMetrics;

  const CustomizedLegend = () => (
    <div className="flex justify-center items-center space-x-4 text-sm">
      <div className="flex items-center">
        <div className="w-4 h-4 bg-purple-500 mr-1"></div>
        <span>Population with Condition</span>
      </div>
      <div className="flex items-center">
        <div className="w-4 h-4 bg-green-500 mr-1"></div>
        <span>Population without Condition</span>
      </div>
      <div className="flex items-center">
        <div className="w-4 h-0.5 bg-red-500 mr-1"></div>
        <span>Operating Point</span>
      </div>
    </div>
  );

  const tooltipData = useMemo(() => {
    const totalPositive = Math.round(data.reduce((sum, d) => sum + d.positiveY, 0) * TOTAL_POPULATION);
    const totalNegative = Math.round(data.reduce((sum, d) => sum + d.negativeY, 0) * TOTAL_POPULATION);
    return { totalPositive, totalNegative };
  }, [data]);

  const CustomTooltip = useCallback(({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-gray-300 p-2 shadow-md">
          <p className="text-purple-500">Population with Condition: {tooltipData.totalPositive.toLocaleString()}</p>
          <p className="text-green-500">Population without Condition: {tooltipData.totalNegative.toLocaleString()}</p>
        </div>
      );
    }
    return null;
  }, [tooltipData]);

  return (
    <div className="p-4 space-y-6 bg-white">
      <h2 className="text-2xl font-bold">Interactive Classification Demo</h2>
      <p className="text-lg font-semibold">Total Population: {TOTAL_POPULATION.toLocaleString()}</p>

      <div className="flex space-x-4">
        <div className="w-2/3 h-96">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <XAxis dataKey="x" />
              <YAxis hide={true} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="positiveY" stroke="#8884d8" dot={false} name="Population with Condition" />
              <Line type="monotone" dataKey="negativeY" stroke="#82ca9d" dot={false} name="Population without Condition" />
              <ReferenceLine x={operatingPoint} stroke="red" strokeDasharray="3 3" />
              <Legend content={<CustomizedLegend />} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="w-1/3 border-2 border-gray-300 rounded-lg p-4 space-y-4 h-96 overflow-y-auto">
          <SliderControl label="Prevalence" value={prevalence} onChange={setPrevalence} min={0} max={1} step={0.01} />

          <div className="space-y-2">
            <h3 className="font-semibold">Population with Condition</h3>
            <div className="ml-4 space-y-2">
              <SliderControl label="Mean" value={positiveMean} onChange={setPositiveMean} min={0} max={100} />
              <SliderControl label="Standard Deviation" value={positiveSd} onChange={setPositiveSd} min={1} max={20} />
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">Population without Condition</h3>
            <div className="ml-4 space-y-2">
              <SliderControl label="Mean" value={negativeMean} onChange={setNegativeMean} min={0} max={100} />
              <SliderControl label="Standard Deviation" value={negativeSd} onChange={setNegativeSd} min={1} max={20} />
            </div>
          </div>

          <SliderControl label="Operating Point" value={operatingPoint} onChange={setOperatingPoint} min={0} max={100} />
        </div>
      </div>

      <div className="mt-8 flex space-x-4">
        <div className="w-1/2">
          <h3 className="text-xl font-bold mb-4">Confusion Matrix</h3>
          <div className="flex items-end">
            <div className="w-16"></div>
            <div className="flex-1">
              <div className="text-center font-bold mb-2">Predicted</div>
              <div className="grid grid-cols-2 gap-2">
                <div className="text-center font-semibold">Positive</div>
                <div className="text-center font-semibold">Negative</div>
              </div>
            </div>
          </div>
          <div className="flex">
            <div className="w-16 flex flex-col items-center justify-center">
              <div className="transform -rotate-90 font-bold whitespace-nowrap">Actual</div>
            </div>
            <div className="flex-1">
              <div className="flex">
                <div className="w-16 font-semibold flex items-center justify-end pr-2">
                  Positive
                </div>
                <div className="flex-1 grid grid-cols-2 gap-2">
                  <div className="bg-green-100 p-2 flex flex-col justify-center items-center">
                    <div className="font-bold">True Positive (TP)</div>
                    <div>{tp.toLocaleString()}</div>
                  </div>
                  <div className="bg-red-100 p-2 flex flex-col justify-center items-center">
                    <div className="font-bold">False Negative (FN)</div>
                    <div>{fn.toLocaleString()}</div>
                  </div>
                </div>
              </div>
              <div className="flex mt-2">
                <div className="w-16 font-semibold flex items-center justify-end pr-2">
                  Negative
                </div>
                <div className="flex-1 grid grid-cols-2 gap-2">
                  <div className="bg-red-100 p-2 flex flex-col justify-center items-center">
                    <div className="font-bold">False Positive (FP)</div>
                    <div>{fp.toLocaleString()}</div>
                  </div>
                  <div className="bg-green-100 p-2 flex flex-col justify-center items-center">
                    <div className="font-bold">True Negative (TN)</div>
                    <div>{tn.toLocaleString()}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="w-1/2">
          <h3 className="text-xl font-bold mb-4">Performance Metrics</h3>
          <div className="grid grid-cols-1 gap-4">
            <MetricDisplay
              name="Sensitivity (True Positive Rate)"
              formula="TP / (TP + FN)"
              calculation={`${tp} / (${tp} + ${fn})`}
              value={sensitivity}
            />
            <MetricDisplay
              name="Specificity (True Negative Rate)"
              formula="TN / (TN + FP)"
              calculation={`${tn} / (${tn} + ${fp})`}
              value={specificity}
            />
            <MetricDisplay
              name="Positive Predictive Value (Precision)"
              formula="TP / (TP + FP)"
              calculation={`${tp} / (${tp} + ${fp})`}
              value={ppv}
            />
            <MetricDisplay
              name="Negative Predictive Value"
              formula="TN / (TN + FN)"
              calculation={`${tn} / (${tn} + ${fn})`}
              value={npv}
            />
            <MetricDisplay
              name="Accuracy"
              formula="(TP + TN) / (TP + TN + FP + FN)"
              calculation={`(${tp} + ${tn}) / (${tp} + ${tn} + ${fp} + ${fn})`}
              value={accuracy}
            />
          </div>
        </div>
      </div>
    </div>
  );
});
ClassificationDemo.displayName = 'ClassificationDemo';

export default ClassificationDemo;