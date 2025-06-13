import React, { useState, useEffect, useReducer, useCallback } from 'react';
import { Play, Pause, RotateCcw, Settings, Shuffle, Info } from 'lucide-react';

// Algorithm Engine - Pure logic separated from UI
class AlgorithmEngine {
  static bubbleSort(arr) {
    const ops = [];
    const temp = [...arr];
    
    for (let i = 0; i < temp.length - 1; i++) {
      for (let j = 0; j < temp.length - i - 1; j++) {
        ops.push({ 
          type: "compare", 
          indices: [j, j + 1], 
          values: [temp[j], temp[j + 1]],
          description: `Comparing elements at positions ${j} and ${j + 1}: ${temp[j]} vs ${temp[j + 1]}`,
          step: `Pass ${i + 1}: Compare ${temp[j]} and ${temp[j + 1]}`
        });
        
        if (temp[j] > temp[j + 1]) {
          [temp[j], temp[j + 1]] = [temp[j + 1], temp[j]];
          ops.push({ 
            type: "swap", 
            indices: [j, j + 1], 
            values: [temp[j], temp[j + 1]],
            description: `Swapping elements: ${temp[j + 1]} and ${temp[j]} (${temp[j + 1]} < ${temp[j]})`,
            step: `Pass ${i + 1}: Swap ${temp[j + 1]} ↔ ${temp[j]}`
          });
        }
      }
      ops.push({ 
        type: "markSorted", 
        index: temp.length - i - 1,
        description: `Element ${temp[temp.length - i - 1]} is now in its final sorted position`,
        step: `Pass ${i + 1}: Element ${temp[temp.length - i - 1]} is sorted`
      });
    }
    ops.push({ 
      type: "markSorted", 
      index: 0,
      description: "First element is now sorted - array is completely sorted!",
      step: "Complete: Array is fully sorted"
    });
    return ops;
  }

  static quickSort(arr) {
    const ops = [];
    const temp = [...arr];
    let passCount = 0;

    function partition(low, high) {
      const pivot = temp[high];
      ops.push({ 
        type: "pivot", 
        index: high, 
        value: pivot,
        description: `Selected pivot: ${pivot} at position ${high}`,
        step: `Partition: Choose pivot ${pivot}`
      });
      let i = low - 1;

      for (let j = low; j < high; j++) {
        ops.push({ 
          type: "compare", 
          indices: [j, high], 
          values: [temp[j], pivot],
          description: `Comparing ${temp[j]} with pivot ${pivot}`,
          step: `Compare ${temp[j]} with pivot ${pivot}`
        });
        
        if (temp[j] < pivot) {
          i++;
          if (i !== j) {
            [temp[i], temp[j]] = [temp[j], temp[i]];
            ops.push({ 
              type: "swap", 
              indices: [i, j], 
              values: [temp[i], temp[j]],
              description: `Moving ${temp[i]} to left partition (${temp[i]} < ${pivot})`,
              step: `Move ${temp[i]} to left partition`
            });
          }
        }
      }
      
      [temp[i + 1], temp[high]] = [temp[high], temp[i + 1]];
      ops.push({ 
        type: "swap", 
        indices: [i + 1, high], 
        values: [temp[i + 1], temp[high]],
        description: `Placing pivot ${temp[i + 1]} in its correct position`,
        step: `Place pivot ${temp[i + 1]} in correct position`
      });
      return i + 1;
    }

    function quickSortHelper(low, high) {
      if (low < high) {
        passCount++;
        const pi = partition(low, high);
        ops.push({ 
          type: "partitioned", 
          index: pi,
          description: `Partition complete. Pivot at position ${pi}`,
          step: `Partition ${passCount}: Pivot placed at position ${pi}`
        });
        quickSortHelper(low, pi - 1);
        quickSortHelper(pi + 1, high);
      }
    }

    quickSortHelper(0, temp.length - 1);
    
    // Mark all as sorted at the end
    for (let i = 0; i < temp.length; i++) {
      ops.push({ 
        type: "markSorted", 
        index: i,
        description: `Element ${temp[i]} is in final sorted position`,
        step: "Complete: All elements sorted"
      });
    }
    
    return ops;
  }

  static mergeSort(arr) {
    const ops = [];
    const temp = [...arr];
    let mergeCount = 0;

    function merge(left, mid, right) {
      mergeCount++;
      const leftArr = temp.slice(left, mid + 1);
      const rightArr = temp.slice(mid + 1, right + 1);
      
      ops.push({
        type: "merge_start",
        description: `Merging subarrays [${leftArr.join(', ')}] and [${rightArr.join(', ')}]`,
        step: `Merge ${mergeCount}: Combining two sorted subarrays`
      });
      
      let i = 0, j = 0, k = left;

      while (i < leftArr.length && j < rightArr.length) {
        ops.push({ 
          type: "compare", 
          indices: [left + i, mid + 1 + j], 
          values: [leftArr[i], rightArr[j]],
          description: `Comparing ${leftArr[i]} from left array with ${rightArr[j]} from right array`,
          step: `Compare ${leftArr[i]} vs ${rightArr[j]}`
        });
        
        if (leftArr[i] <= rightArr[j]) {
          temp[k] = leftArr[i];
          ops.push({ 
            type: "assign", 
            index: k, 
            value: leftArr[i],
            description: `Placing ${leftArr[i]} from left array into merged position ${k}`,
            step: `Place ${leftArr[i]} from left array`
          });
          i++;
        } else {
          temp[k] = rightArr[j];
          ops.push({ 
            type: "assign", 
            index: k, 
            value: rightArr[j],
            description: `Placing ${rightArr[j]} from right array into merged position ${k}`,
            step: `Place ${rightArr[j]} from right array`
          });
          j++;
        }
        k++;
      }

      while (i < leftArr.length) {
        temp[k] = leftArr[i];
        ops.push({ 
          type: "assign", 
          index: k, 
          value: leftArr[i],
          description: `Copying remaining element ${leftArr[i]} from left array`,
          step: `Copy remaining ${leftArr[i]}`
        });
        i++;
        k++;
      }

      while (j < rightArr.length) {
        temp[k] = rightArr[j];
        ops.push({ 
          type: "assign", 
          index: k, 
          value: rightArr[j],
          description: `Copying remaining element ${rightArr[j]} from right array`,
          step: `Copy remaining ${rightArr[j]}`
        });
        j++;
        k++;
      }
    }

    function mergeSortHelper(left, right) {
      if (left < right) {
        const mid = Math.floor((left + right) / 2);
        mergeSortHelper(left, mid);
        mergeSortHelper(mid + 1, right);
        merge(left, mid, right);
      }
    }

    mergeSortHelper(0, temp.length - 1);
    
    // Mark all as sorted
    for (let i = 0; i < temp.length; i++) {
      ops.push({ 
        type: "markSorted", 
        index: i,
        description: `Element ${temp[i]} is in final sorted position`,
        step: "Complete: Array is fully sorted"
      });
    }
    
    return ops;
  }

  static selectionSort(arr) {
    const ops = [];
    const temp = [...arr];

    for (let i = 0; i < temp.length - 1; i++) {
      let minIdx = i;
      ops.push({ 
        type: "selectMin", 
        index: i,
        description: `Starting pass ${i + 1}: Looking for minimum element from position ${i}`,
        step: `Pass ${i + 1}: Find minimum from position ${i}`
      });

      for (let j = i + 1; j < temp.length; j++) {
        ops.push({ 
          type: "compare", 
          indices: [j, minIdx], 
          values: [temp[j], temp[minIdx]],
          description: `Comparing ${temp[j]} with current minimum ${temp[minIdx]}`,
          step: `Compare ${temp[j]} with current min ${temp[minIdx]}`
        });
        if (temp[j] < temp[minIdx]) {
          minIdx = j;
          ops.push({ 
            type: "newMin", 
            index: minIdx,
            description: `Found new minimum: ${temp[minIdx]} at position ${minIdx}`,
            step: `New minimum found: ${temp[minIdx]}`
          });
        }
      }

      if (minIdx !== i) {
        [temp[i], temp[minIdx]] = [temp[minIdx], temp[i]];
        ops.push({ 
          type: "swap", 
          indices: [i, minIdx], 
          values: [temp[i], temp[minIdx]],
          description: `Swapping minimum ${temp[i]} with element at position ${i}`,
          step: `Swap minimum ${temp[i]} to position ${i}`
        });
      }
      
      ops.push({ 
        type: "markSorted", 
        index: i,
        description: `Element ${temp[i]} is now in its final sorted position`,
        step: `Pass ${i + 1}: Element ${temp[i]} is sorted`
      });
    }
    ops.push({ 
      type: "markSorted", 
      index: temp.length - 1,
      description: "Last element is now sorted - array is completely sorted!",
      step: "Complete: Array is fully sorted"
    });
    return ops;
  }
}

// State management
const initialState = {
  array: [],
  originalArray: [],
  operations: [],
  currentOperation: -1,
  isRunning: false,
  isPaused: false,
  highlightedIndices: [],
  sortedIndices: [],
  algorithm: 'bubbleSort',
  arraySize: 50,
  animationSpeed: 2000, // Changed to 2 seconds default (2000ms)
  pivotIndex: -1,
  minIndex: -1,
  currentStep: null,
  showSteps: true
};

function visualizerReducer(state, action) {
  switch (action.type) {
    case 'SET_ARRAY':
      return {
        ...state,
        array: action.payload,
        originalArray: [...action.payload],
        operations: [],
        currentOperation: -1,
        highlightedIndices: [],
        sortedIndices: [],
        pivotIndex: -1,
        minIndex: -1,
        currentStep: null
      };
    case 'SET_OPERATIONS':
      return { ...state, operations: action.payload, currentOperation: -1 };
    case 'START_VISUALIZATION':
      return { ...state, isRunning: true, isPaused: false };
    case 'PAUSE_VISUALIZATION':
      return { ...state, isRunning: false, isPaused: true };
    case 'RESET_VISUALIZATION':
      return {
        ...state,
        array: [...state.originalArray],
        isRunning: false,
        isPaused: false,
        currentOperation: -1,
        highlightedIndices: [],
        sortedIndices: [],
        pivotIndex: -1,
        minIndex: -1,
        currentStep: null
      };
    case 'STEP_FORWARD':
      return { ...state, currentOperation: action.payload };
    case 'UPDATE_HIGHLIGHTS':
      return {
        ...state,
        highlightedIndices: action.payload.highlighted || [],
        sortedIndices: action.payload.sorted || state.sortedIndices,
        pivotIndex: action.payload.pivot !== undefined ? action.payload.pivot : state.pivotIndex,
        minIndex: action.payload.min !== undefined ? action.payload.min : state.minIndex
      };
    case 'UPDATE_ARRAY':
      return { ...state, array: action.payload };
    case 'SET_CONFIG':
      return { ...state, ...action.payload };
    case 'SET_CURRENT_STEP':
      return { ...state, currentStep: action.payload };
    default:
      return state;
  }
}

// Array Bar Component
function ArrayBar({ value, index, isHighlighted, isSorted, isPivot, isMin, maxValue, arraySize }) {
  const height = Math.max((value / maxValue) * 300, 3);
  const width = Math.max(Math.floor(800 / arraySize) - 2, 2);
  
  let bgColor = 'bg-blue-500';
  if (isSorted) bgColor = 'bg-green-500';
  else if (isPivot) bgColor = 'bg-purple-500';
  else if (isMin) bgColor = 'bg-orange-500';
  else if (isHighlighted) bgColor = 'bg-red-500';

  return (
    <div
      className={`${bgColor} transition-all duration-300 ease-in-out flex items-end justify-center rounded-t`}
      style={{
        height: `${height}px`,
        width: `${width}px`,
        minWidth: '2px'
      }}
    >
      {arraySize <= 20 && (
        <span className="text-white text-xs font-bold mb-1">{value}</span>
      )}
    </div>
  );
}

// Step Display Component
function StepDisplay({ currentStep, currentOperation, totalOperations }) {
  if (!currentStep) return null;

  return (
    <div className="bg-gray-800 rounded-lg p-4 mb-6 border-l-4 border-blue-500">
      <div className="flex items-start gap-3">
        <Info className="text-blue-400 mt-1 flex-shrink-0" size={20} />
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-blue-400">Current Step</h3>
            <span className="text-sm text-gray-400">
              Step {currentOperation + 1} of {totalOperations}
            </span>
          </div>
          <div className="space-y-2">
            <p className="text-white font-medium">{currentStep.step}</p>
            <p className="text-gray-300 text-sm">{currentStep.description}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main Visualizer Component
export default function AlgorithmVisualizer() {
  const [state, dispatch] = useReducer(visualizerReducer, initialState);
  const [showSettings, setShowSettings] = useState(false);

  // Generate random array
  const generateArray = useCallback(() => {
    const newArray = Array.from({ length: state.arraySize }, () => 
      Math.floor(Math.random() * 300) + 5
    );
    dispatch({ type: 'SET_ARRAY', payload: newArray });
  }, [state.arraySize]);

  // Initialize array on mount and size change
  useEffect(() => {
    generateArray();
  }, [generateArray]);

  // Animation loop
  useEffect(() => {
    if (!state.isRunning || state.currentOperation >= state.operations.length - 1) {
      if (state.currentOperation >= state.operations.length - 1 && state.operations.length > 0) {
        dispatch({ type: 'PAUSE_VISUALIZATION' });
      }
      return;
    }

    const timer = setTimeout(() => {
      const nextOp = state.currentOperation + 1;
      const operation = state.operations[nextOp];
      
      if (operation) {
        executeOperation(operation);
        dispatch({ type: 'STEP_FORWARD', payload: nextOp });
        dispatch({ type: 'SET_CURRENT_STEP', payload: operation });
      }
    }, state.animationSpeed);

    return () => clearTimeout(timer);
  }, [state.isRunning, state.currentOperation, state.operations, state.animationSpeed]);

  // Execute individual operation
  const executeOperation = (operation) => {
    const newArray = [...state.array];
    let highlights = { highlighted: [], sorted: [...state.sortedIndices] };

    switch (operation.type) {
      case 'compare':
        highlights.highlighted = operation.indices;
        break;
      case 'swap':
        [newArray[operation.indices[0]], newArray[operation.indices[1]]] = 
        [newArray[operation.indices[1]], newArray[operation.indices[0]]];
        highlights.highlighted = operation.indices;
        dispatch({ type: 'UPDATE_ARRAY', payload: newArray });
        break;
      case 'assign':
        newArray[operation.index] = operation.value;
        highlights.highlighted = [operation.index];
        dispatch({ type: 'UPDATE_ARRAY', payload: newArray });
        break;
      case 'markSorted':
        highlights.sorted = [...state.sortedIndices, operation.index];
        break;
      case 'pivot':
        highlights.pivot = operation.index;
        break;
      case 'selectMin':
      case 'newMin':
        highlights.min = operation.index;
        break;
      case 'partitioned':
        highlights.highlighted = [operation.index];
        break;
      case 'merge_start':
        // Visual indicator for merge start
        break;
    }

    dispatch({ type: 'UPDATE_HIGHLIGHTS', payload: highlights });
  };

  // Start visualization
  const startVisualization = () => {
    if (state.operations.length === 0) {
      const ops = AlgorithmEngine[state.algorithm](state.array);
      dispatch({ type: 'SET_OPERATIONS', payload: ops });
    }
    dispatch({ type: 'START_VISUALIZATION' });
  };

  // Control handlers
  const handlePlayPause = () => {
    if (state.isRunning) {
      dispatch({ type: 'PAUSE_VISUALIZATION' });
    } else {
      startVisualization();
    }
  };

  const handleReset = () => {
    dispatch({ type: 'RESET_VISUALIZATION' });
  };

  const handleAlgorithmChange = (algorithm) => {
    dispatch({ type: 'SET_CONFIG', payload: { algorithm } });
    handleReset();
  };

  const handleSpeedChange = (speed) => {
    // Convert slider value (1-10) to milliseconds (3000-1500)
    // Higher slider value = faster animation = lower delay
    const speedInMs = 4500 - (speed * 300); // Range: 4200ms to 1500ms
    dispatch({ type: 'SET_CONFIG', payload: { animationSpeed: speedInMs } });
  };

  const handleSizeChange = (size) => {
    dispatch({ type: 'SET_CONFIG', payload: { arraySize: size } });
  };

  const algorithms = [
    { key: 'bubbleSort', name: 'Bubble Sort', complexity: 'O(n²)' },
    { key: 'quickSort', name: 'Quick Sort', complexity: 'O(n log n)' },
    { key: 'mergeSort', name: 'Merge Sort', complexity: 'O(n log n)' },
    { key: 'selectionSort', name: 'Selection Sort', complexity: 'O(n²)' }
  ];

  const maxValue = Math.max(...state.array);
  const progress = state.operations.length > 0 ? 
    ((state.currentOperation + 1) / state.operations.length) * 100 : 0;

  // Convert current speed back to slider value for display
  const currentSpeedSliderValue = Math.round((4500 - state.animationSpeed) / 300);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Algorithm Visualizer
          </h1>
          <p className="text-gray-400">
            Interactive visualization of sorting algorithms with step-by-step explanations
          </p>
        </div>

        {/* Controls */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Algorithm Selection */}
            <div className="flex items-center gap-4">
              <select
                value={state.algorithm}
                onChange={(e) => handleAlgorithmChange(e.target.value)}
                className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={state.isRunning}
              >
                {algorithms.map(alg => (
                  <option key={alg.key} value={alg.key}>
                    {alg.name} - {alg.complexity}
                  </option>
                ))}
              </select>
            </div>

            {/* Control Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={handlePlayPause}
                className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded flex items-center gap-2 transition-colors"
              >
                {state.isRunning ? <Pause size={20} /> : <Play size={20} />}
                {state.isRunning ? 'Pause' : 'Start'}
              </button>
              
              <button
                onClick={handleReset}
                className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded flex items-center gap-2 transition-colors"
                disabled={state.isRunning}
              >
                <RotateCcw size={20} />
                Reset
              </button>
              
              <button
                onClick={generateArray}
                className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded flex items-center gap-2 transition-colors"
                disabled={state.isRunning}
              >
                <Shuffle size={20} />
                New Array
              </button>
              
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded flex items-center gap-2 transition-colors"
              >
                <Settings size={20} />
                Settings
              </button>
            </div>
          </div>

          {/* Settings Panel */}
          {showSettings && (
            <div className="mt-4 pt-4 border-t border-gray-600">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Array Size: {state.arraySize}
                  </label>
                  <input
                    type="range"
                    min="5"
                    max="100"
                    value={state.arraySize}
                    onChange={(e) => handleSizeChange(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                    disabled={state.isRunning}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Animation Speed: {(state.animationSpeed / 1000).toFixed(1)}s per step
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={currentSpeedSliderValue}
                    onChange={(e) => handleSpeedChange(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>Slow (4.2s)</span>
                    <span>Fast (1.5s)</span>
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={state.showSteps}
                      onChange={(e) => dispatch({ type: 'SET_CONFIG', payload: { showSteps: e.target.checked } })}
                      className="rounded"
                    />
                    <span className="text-sm font-medium">Show Step Details</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Progress Bar */}
          {state.operations.length > 0 && (
            <div className="mt-4">
              <div className="flex justify-between text-sm text-gray-400 mb-1">
                <span>Progress</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-200"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>

        {/* Step Display */}
        {state.showSteps && state.currentStep && (
          <StepDisplay 
            currentStep={state.currentStep}
            currentOperation={state.currentOperation}
            totalOperations={state.operations.length}
          />
        )}

        {/* Legend */}
        <div className="bg-gray-800 rounded-lg p-4 mb-6">
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded"></div>
              <span>Unsorted</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded"></div>
              <span>Comparing</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-purple-500 rounded"></div>
              <span>Pivot</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-orange-500 rounded"></div>
              <span>Minimum</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span>Sorted</span>
            </div>
          </div>
        </div>

        {/* Visualization Area */}
        <div className="bg-gray-800 rounded-lg p-6">
          <div 
            className="flex items-end justify-center gap-1 mx-auto"
            style={{ 
              width: 'fit-content',
              minHeight: '350px'
            }}
          >
            {state.array.map((value, index) => (
              <ArrayBar
                key={index}
                value={value}
                index={index}
                isHighlighted={state.highlightedIndices.includes(index)}
                isSorted={state.sortedIndices.includes(index)}
                isPivot={state.pivotIndex === index}
                isMin={state.minIndex === index}
                maxValue={maxValue}
                arraySize={state.arraySize}
              />
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="mt-6 text-center text-gray-400">
          <p>
            Operations: {state.currentOperation + 1} / {state.operations.length} | 
            Array Size: {state.array.length} | 
            Algorithm: {algorithms.find(a => a.key === state.algorithm)?.name}
          </p>
        </div>
      </div>
    </div>
  );
}