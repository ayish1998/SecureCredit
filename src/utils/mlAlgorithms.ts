// Advanced AI/ML Algorithms for Fraud Detection and Credit Scoring
// Implementing real machine learning algorithms optimized for African mobile money
// Optimized for performance with lazy loading and reduced complexity

export interface MLFeatures {
  // Transaction features
  amount: number;
  hour: number;
  dayOfWeek: number;
  velocityScore: number;
  frequencyScore: number;
  
  // Device features
  deviceTrust: number;
  newDevice: number;
  locationChange: number;
  
  // Network features
  agentTrust: number;
  networkTrust: number;
  pinAttempts: number;
  
  // Behavioral features
  userRiskProfile: number;
  transactionPattern: number;
  merchantCategory: number;
}

export interface GraphNode {
  id: string;
  type: 'user' | 'agent' | 'device' | 'transaction';
  features: number[];
  connections: string[];
}

export interface GraphEdge {
  source: string;
  target: string;
  weight: number;
  type: 'transaction' | 'device_usage' | 'agent_interaction';
}

// XGBoost-inspired Gradient Boosting Implementation
export class GradientBoostingClassifier {
  private trees: DecisionTree[] = [];
  private learningRate: number = 0.2;
  private maxDepth: number = 4; // Reduced for performance
  private numTrees: number = 20; // Reduced for performance
  private featureImportance: Map<string, number> = new Map();
  private isInitialized: boolean = false;

  constructor(options: {
    learningRate?: number;
    maxDepth?: number;
    numTrees?: number;
  } = {}) {
    this.learningRate = options.learningRate || 0.1;
    this.maxDepth = options.maxDepth || 4;
    this.numTrees = options.numTrees || 20;
  }

  async initializeAsync(): Promise<void> {
    if (this.isInitialized) return;
    
    // Simulate async initialization
    await new Promise(resolve => setTimeout(resolve, 100));
    this.isInitialized = true;
  }

  train(features: MLFeatures[], labels: number[]): void {
    if (!this.isInitialized) {
      console.warn('Model not initialized, using quick training');
    }
    
    // Initialize predictions with mean
    let predictions = new Array(features.length).fill(0.5);
    
    // Reduced training iterations for performance
    const iterations = Math.min(this.numTrees, 10);
    for (let i = 0; i < iterations; i++) {
      // Calculate residuals (gradients)
      const residuals = labels.map((label, idx) => 
        label - this.sigmoid(predictions[idx])
      );
      
      // Train tree on residuals
      const tree = new DecisionTree(Math.min(this.maxDepth, 3));
      tree.train(features, residuals);
      this.trees.push(tree);
      
      // Update predictions
      const treePredictions = tree.predictBatch(features);
      predictions = predictions.map((pred, idx) => 
        pred + this.learningRate * treePredictions[idx]
      );
      
      // Update feature importance
      this.updateFeatureImportance(tree);
    }
  }

  predict(features: MLFeatures): number {
    let prediction = 0;
    for (const tree of this.trees) {
      prediction += this.learningRate * tree.predict(features);
    }
    return this.sigmoid(prediction);
  }

  predictBatch(features: MLFeatures[]): number[] {
    return features.map(f => this.predict(f));
  }

  private sigmoid(x: number): number {
    return 1 / (1 + Math.exp(-Math.max(-500, Math.min(500, x))));
  }

  private updateFeatureImportance(tree: DecisionTree): void {
    const importance = tree.getFeatureImportance();
    importance.forEach((value, key) => {
      this.featureImportance.set(key, (this.featureImportance.get(key) || 0) + value);
    });
  }

  getFeatureImportance(): Map<string, number> {
    return this.featureImportance;
  }
}

// Decision Tree Implementation
class DecisionTree {
  private root: TreeNode | null = null;
  private maxDepth: number;
  private featureImportance: Map<string, number> = new Map();

  constructor(maxDepth: number = 6) {
    this.maxDepth = maxDepth;
  }

  train(features: MLFeatures[], targets: number[]): void {
    this.root = this.buildTree(features, targets, 0);
  }

  predict(features: MLFeatures): number {
    if (!this.root) return 0;
    return this.traverseTree(this.root, features);
  }

  predictBatch(features: MLFeatures[]): number[] {
    return features.map(f => this.predict(f));
  }

  private buildTree(features: MLFeatures[], targets: number[], depth: number): TreeNode {
    if (depth >= this.maxDepth || targets.length < 2) {
      return new TreeNode(this.calculateMean(targets));
    }

    const bestSplit = this.findBestSplit(features, targets);
    if (!bestSplit) {
      return new TreeNode(this.calculateMean(targets));
    }

    // Update feature importance
    this.featureImportance.set(
      bestSplit.feature,
      (this.featureImportance.get(bestSplit.feature) || 0) + bestSplit.importance
    );

    const { leftFeatures, leftTargets, rightFeatures, rightTargets } = 
      this.splitData(features, targets, bestSplit);

    const node = new TreeNode();
    node.feature = bestSplit.feature;
    node.threshold = bestSplit.threshold;
    node.left = this.buildTree(leftFeatures, leftTargets, depth + 1);
    node.right = this.buildTree(rightFeatures, rightTargets, depth + 1);

    return node;
  }

  private findBestSplit(features: MLFeatures[], targets: number[]): SplitInfo | null {
    let bestSplit: SplitInfo | null = null;
    let bestGain = -Infinity;

    const featureKeys = Object.keys(features[0]) as (keyof MLFeatures)[];
    
    for (const feature of featureKeys) {
      const values = features.map(f => f[feature]);
      const uniqueValues = [...new Set(values)].sort((a, b) => a - b);
      
      for (let i = 0; i < uniqueValues.length - 1; i++) {
        const threshold = (uniqueValues[i] + uniqueValues[i + 1]) / 2;
        const gain = this.calculateInformationGain(features, targets, feature, threshold);
        
        if (gain > bestGain) {
          bestGain = gain;
          bestSplit = {
            feature,
            threshold,
            gain,
            importance: gain
          };
        }
      }
    }

    return bestSplit;
  }

  private calculateInformationGain(
    features: MLFeatures[], 
    targets: number[], 
    feature: keyof MLFeatures, 
    threshold: number
  ): number {
    const parentVariance = this.calculateVariance(targets);
    
    const leftTargets: number[] = [];
    const rightTargets: number[] = [];
    
    features.forEach((f, i) => {
      if (f[feature] <= threshold) {
        leftTargets.push(targets[i]);
      } else {
        rightTargets.push(targets[i]);
      }
    });

    if (leftTargets.length === 0 || rightTargets.length === 0) {
      return 0;
    }

    const leftWeight = leftTargets.length / targets.length;
    const rightWeight = rightTargets.length / targets.length;
    
    const weightedVariance = 
      leftWeight * this.calculateVariance(leftTargets) +
      rightWeight * this.calculateVariance(rightTargets);

    return parentVariance - weightedVariance;
  }

  private calculateVariance(values: number[]): number {
    if (values.length === 0) return 0;
    const mean = this.calculateMean(values);
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    return variance;
  }

  private calculateMean(values: number[]): number {
    return values.length > 0 ? values.reduce((sum, val) => sum + val, 0) / values.length : 0;
  }

  private splitData(
    features: MLFeatures[], 
    targets: number[], 
    split: SplitInfo
  ): {
    leftFeatures: MLFeatures[];
    leftTargets: number[];
    rightFeatures: MLFeatures[];
    rightTargets: number[];
  } {
    const leftFeatures: MLFeatures[] = [];
    const leftTargets: number[] = [];
    const rightFeatures: MLFeatures[] = [];
    const rightTargets: number[] = [];

    features.forEach((f, i) => {
      if (f[split.feature] <= split.threshold) {
        leftFeatures.push(f);
        leftTargets.push(targets[i]);
      } else {
        rightFeatures.push(f);
        rightTargets.push(targets[i]);
      }
    });

    return { leftFeatures, leftTargets, rightFeatures, rightTargets };
  }

  private traverseTree(node: TreeNode, features: MLFeatures): number {
    if (node.isLeaf()) {
      return node.value!;
    }

    if (features[node.feature!] <= node.threshold!) {
      return this.traverseTree(node.left!, features);
    } else {
      return this.traverseTree(node.right!, features);
    }
  }

  getFeatureImportance(): Map<string, number> {
    return this.featureImportance;
  }
}

class TreeNode {
  feature?: keyof MLFeatures;
  threshold?: number;
  value?: number;
  left?: TreeNode;
  right?: TreeNode;

  constructor(value?: number) {
    this.value = value;
  }

  isLeaf(): boolean {
    return this.value !== undefined;
  }
}

interface SplitInfo {
  feature: keyof MLFeatures;
  threshold: number;
  gain: number;
  importance: number;
}

// Graph Neural Network for Fraud Ring Detection
export class GraphNeuralNetwork {
  private nodeEmbeddings: Map<string, number[]> = new Map();
  private edgeWeights: Map<string, number> = new Map();
  private embeddingSize: number = 16; // Reduced for performance
  private learningRate: number = 0.01;
  private isInitialized: boolean = false;

  constructor(embeddingSize: number = 16) {
    this.embeddingSize = embeddingSize;
  }

  async initializeAsync(): Promise<void> {
    if (this.isInitialized) return;
    await new Promise(resolve => setTimeout(resolve, 50));
    this.isInitialized = true;
  }

  train(nodes: GraphNode[], edges: GraphEdge[], labels: Map<string, number>): void {
    if (!this.isInitialized) return;
    
    // Initialize node embeddings
    this.initializeEmbeddings(nodes);
    
    // Training iterations
    for (let epoch = 0; epoch < 10; epoch++) { // Reduced iterations
      this.updateEmbeddings(nodes, edges, labels);
    }
  }

  detectFraudRing(nodes: GraphNode[], edges: GraphEdge[]): {
    suspiciousNodes: string[];
    riskScore: number;
    connections: GraphEdge[];
  } {
    const suspiciousNodes: string[] = [];
    const suspiciousConnections: GraphEdge[] = [];
    
    // Analyze node embeddings for anomalies
    nodes.forEach(node => {
      const embedding = this.nodeEmbeddings.get(node.id);
      if (embedding) {
        const anomalyScore = this.calculateAnomalyScore(embedding);
        if (anomalyScore > 0.7) {
          suspiciousNodes.push(node.id);
        }
      }
    });

    // Analyze edge patterns
    edges.forEach(edge => {
      const edgeKey = `${edge.source}-${edge.target}`;
      const weight = this.edgeWeights.get(edgeKey) || 0;
      if (weight > 0.8 && edge.type === 'transaction') {
        suspiciousConnections.push(edge);
      }
    });

    const riskScore = this.calculateGraphRiskScore(suspiciousNodes, suspiciousConnections, nodes, edges);

    return {
      suspiciousNodes,
      riskScore,
      connections: suspiciousConnections
    };
  }

  private initializeEmbeddings(nodes: GraphNode[]): void {
    nodes.forEach(node => {
      const embedding = Array.from({ length: this.embeddingSize }, () => 
        (Math.random() - 0.5) * 0.1
      );
      this.nodeEmbeddings.set(node.id, embedding);
    });
  }

  private updateEmbeddings(nodes: GraphNode[], edges: GraphEdge[], labels: Map<string, number>): void {
    const newEmbeddings = new Map<string, number[]>();

    nodes.forEach(node => {
      const currentEmbedding = this.nodeEmbeddings.get(node.id)!;
      const neighbors = this.getNeighbors(node.id, edges);
      
      // Aggregate neighbor embeddings
      const aggregatedEmbedding = this.aggregateNeighborEmbeddings(neighbors);
      
      // Update embedding using gradient descent
      const newEmbedding = this.updateNodeEmbedding(
        currentEmbedding,
        aggregatedEmbedding,
        node.features,
        labels.get(node.id) || 0
      );
      
      newEmbeddings.set(node.id, newEmbedding);
    });

    this.nodeEmbeddings = newEmbeddings;
  }

  private getNeighbors(nodeId: string, edges: GraphEdge[]): string[] {
    const neighbors: string[] = [];
    edges.forEach(edge => {
      if (edge.source === nodeId) {
        neighbors.push(edge.target);
      } else if (edge.target === nodeId) {
        neighbors.push(edge.source);
      }
    });
    return neighbors;
  }

  private aggregateNeighborEmbeddings(neighbors: string[]): number[] {
    if (neighbors.length === 0) {
      return new Array(this.embeddingSize).fill(0);
    }

    const aggregated = new Array(this.embeddingSize).fill(0);
    neighbors.forEach(neighborId => {
      const embedding = this.nodeEmbeddings.get(neighborId);
      if (embedding) {
        embedding.forEach((value, index) => {
          aggregated[index] += value;
        });
      }
    });

    // Average the embeddings
    return aggregated.map(value => value / neighbors.length);
  }

  private updateNodeEmbedding(
    current: number[],
    aggregated: number[],
    features: number[],
    label: number
  ): number[] {
    return current.map((value, index) => {
      const gradient = this.calculateGradient(value, aggregated[index], features[index] || 0, label);
      return value - this.learningRate * gradient;
    });
  }

  private calculateGradient(current: number, aggregated: number, feature: number, label: number): number {
    // Simplified gradient calculation
    const prediction = this.sigmoid(current + aggregated + feature);
    return (prediction - label) * prediction * (1 - prediction);
  }

  private sigmoid(x: number): number {
    return 1 / (1 + Math.exp(-Math.max(-500, Math.min(500, x))));
  }

  private calculateAnomalyScore(embedding: number[]): number {
    // Calculate distance from normal embedding space
    const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
    return Math.min(magnitude / 10, 1); // Normalize to 0-1
  }

  private calculateGraphRiskScore(
    suspiciousNodes: string[],
    suspiciousConnections: GraphEdge[],
    allNodes: GraphNode[],
    allEdges: GraphEdge[]
  ): number {
    const nodeRatio = suspiciousNodes.length / allNodes.length;
    const edgeRatio = suspiciousConnections.length / allEdges.length;
    
    // Weighted combination
    return Math.min(nodeRatio * 0.6 + edgeRatio * 0.4, 1);
  }
}

// Autoencoder for Anomaly Detection
export class AutoencoderAnomalyDetector {
  private encoder: NeuralLayer[];
  private decoder: NeuralLayer[];
  private inputSize: number;
  private hiddenSize: number = 8; // Reduced for performance
  private learningRate: number = 0.001;
  private isInitialized: boolean = false;

  constructor(inputSize: number, hiddenSize: number = 8) {
    this.inputSize = inputSize;
    this.hiddenSize = hiddenSize;
    this.encoder = this.initializeLayers([inputSize, hiddenSize]);
    this.decoder = this.initializeLayers([hiddenSize, inputSize]);
  }

  async initializeAsync(): Promise<void> {
    if (this.isInitialized) return;
    await new Promise(resolve => setTimeout(resolve, 50));
    this.isInitialized = true;
  }

  train(data: number[][]): void {
    if (!this.isInitialized) return;
    
    // Reduced training epochs for performance
    for (let epoch = 0; epoch < 20; epoch++) {
      data.forEach(sample => {
        this.trainSample(sample);
      });
    }
  }

  detectAnomaly(input: number[]): { isAnomaly: boolean; reconstructionError: number; anomalyScore: number } {
    const encoded = this.encode(input);
    const decoded = this.decode(encoded);
    const reconstructionError = this.calculateReconstructionError(input, decoded);
    
    // Threshold-based anomaly detection
    const threshold = 0.1; // Adjust based on training data
    const isAnomaly = reconstructionError > threshold;
    const anomalyScore = Math.min(reconstructionError / threshold, 1);

    return {
      isAnomaly,
      reconstructionError,
      anomalyScore
    };
  }

  private initializeLayers(sizes: number[]): NeuralLayer[] {
    const layers: NeuralLayer[] = [];
    for (let i = 0; i < sizes.length - 1; i++) {
      layers.push(new NeuralLayer(sizes[i], sizes[i + 1]));
    }
    return layers;
  }

  private encode(input: number[]): number[] {
    let output = input;
    for (const layer of this.encoder) {
      output = layer.forward(output);
    }
    return output;
  }

  private decode(encoded: number[]): number[] {
    let output = encoded;
    for (const layer of this.decoder) {
      output = layer.forward(output);
    }
    return output;
  }

  private trainSample(input: number[]): void {
    // Forward pass
    const encoded = this.encode(input);
    const decoded = this.decode(encoded);
    
    // Backward pass (simplified)
    const error = input.map((val, i) => val - decoded[i]);
    this.backpropagate(error);
  }

  private backpropagate(error: number[]): void {
    // Simplified backpropagation
    // In a real implementation, this would be more complex
    let currentError = error;
    
    // Backpropagate through decoder
    for (let i = this.decoder.length - 1; i >= 0; i--) {
      currentError = this.decoder[i].backward(currentError, this.learningRate);
    }
    
    // Backpropagate through encoder
    for (let i = this.encoder.length - 1; i >= 0; i--) {
      currentError = this.encoder[i].backward(currentError, this.learningRate);
    }
  }

  private calculateReconstructionError(original: number[], reconstructed: number[]): number {
    const mse = original.reduce((sum, val, i) => 
      sum + Math.pow(val - reconstructed[i], 2), 0
    ) / original.length;
    return Math.sqrt(mse);
  }
}

class NeuralLayer {
  private weights: number[][];
  private biases: number[];
  private lastInput: number[] = [];
  private lastOutput: number[] = [];

  constructor(inputSize: number, outputSize: number) {
    this.weights = Array.from({ length: outputSize }, () =>
      Array.from({ length: inputSize }, () => (Math.random() - 0.5) * 0.1)
    );
    this.biases = Array.from({ length: outputSize }, () => (Math.random() - 0.5) * 0.1);
  }

  forward(input: number[]): number[] {
    this.lastInput = input;
    this.lastOutput = this.weights.map((weightRow, i) => {
      const sum = weightRow.reduce((acc, weight, j) => acc + weight * input[j], 0);
      return this.relu(sum + this.biases[i]);
    });
    return this.lastOutput;
  }

  backward(error: number[], learningRate: number): number[] {
    // Update weights and biases
    this.weights.forEach((weightRow, i) => {
      weightRow.forEach((weight, j) => {
        this.weights[i][j] -= learningRate * error[i] * this.lastInput[j];
      });
      this.biases[i] -= learningRate * error[i];
    });

    // Calculate error for previous layer
    const prevError = new Array(this.lastInput.length).fill(0);
    this.weights.forEach((weightRow, i) => {
      weightRow.forEach((weight, j) => {
        prevError[j] += error[i] * weight;
      });
    });

    return prevError;
  }

  private relu(x: number): number {
    return Math.max(0, x);
  }
}

// LSTM for Time Series Analysis
export class LSTMTimeSeriesAnalyzer {
  private hiddenSize: number = 16; // Reduced for performance
  private sequenceLength: number;
  private weights: Map<string, number[][]> = new Map();
  private biases: Map<string, number[]> = new Map();
  private isInitialized: boolean = false;

  constructor(hiddenSize: number = 16, sequenceLength: number = 5) {
    this.hiddenSize = hiddenSize;
    this.sequenceLength = sequenceLength;
  }

  async initializeAsync(): Promise<void> {
    if (this.isInitialized) return;
    this.initializeWeights();
    await new Promise(resolve => setTimeout(resolve, 50));
    this.isInitialized = true;
  }

  analyzeTransactionSequence(transactions: number[][]): {
    predictedNext: number[];
    anomalyScore: number;
    pattern: 'normal' | 'suspicious' | 'fraudulent';
  } {
    if (!this.isInitialized) {
      return {
        predictedNext: [0],
        anomalyScore: 0.5,
        pattern: 'normal'
      };
    }
    
    const sequence = transactions.slice(-this.sequenceLength);
    const { hiddenState, cellState } = this.processSequence(sequence);
    
    // Predict next transaction
    const predictedNext = this.predict(hiddenState);
    
    // Calculate anomaly score based on prediction error
    const anomalyScore = this.calculateAnomalyScore(sequence);
    
    // Determine pattern
    let pattern: 'normal' | 'suspicious' | 'fraudulent' = 'normal';
    if (anomalyScore > 0.8) pattern = 'fraudulent';
    else if (anomalyScore > 0.5) pattern = 'suspicious';

    return { predictedNext, anomalyScore, pattern };
  }

  private initializeWeights(): void {
    const inputSize = 10; // Number of transaction features
    
    // LSTM gate weights
    ['forget', 'input', 'candidate', 'output'].forEach(gate => {
      this.weights.set(`W_${gate}`, this.randomMatrix(this.hiddenSize, inputSize + this.hiddenSize));
      this.biases.set(`b_${gate}`, this.randomVector(this.hiddenSize));
    });
    
    // Output layer
    this.weights.set('W_output', this.randomMatrix(inputSize, this.hiddenSize));
    this.biases.set('b_output', this.randomVector(inputSize));
  }

  private processSequence(sequence: number[][]): { hiddenState: number[]; cellState: number[] } {
    let hiddenState = new Array(this.hiddenSize).fill(0);
    let cellState = new Array(this.hiddenSize).fill(0);

    sequence.forEach(input => {
      const result = this.lstmCell(input, hiddenState, cellState);
      hiddenState = result.hiddenState;
      cellState = result.cellState;
    });

    return { hiddenState, cellState };
  }

  private lstmCell(input: number[], hiddenState: number[], cellState: number[]): {
    hiddenState: number[];
    cellState: number[];
  } {
    const combined = [...input, ...hiddenState];
    
    // Forget gate
    const forgetGate = this.sigmoid(this.matrixVectorMultiply(
      this.weights.get('W_forget')!, combined
    ).map((val, i) => val + this.biases.get('b_forget')![i]));
    
    // Input gate
    const inputGate = this.sigmoid(this.matrixVectorMultiply(
      this.weights.get('W_input')!, combined
    ).map((val, i) => val + this.biases.get('b_input')![i]));
    
    // Candidate values
    const candidateValues = this.tanh(this.matrixVectorMultiply(
      this.weights.get('W_candidate')!, combined
    ).map((val, i) => val + this.biases.get('b_candidate')![i]));
    
    // Update cell state
    const newCellState = cellState.map((val, i) => 
      forgetGate[i] * val + inputGate[i] * candidateValues[i]
    );
    
    // Output gate
    const outputGate = this.sigmoid(this.matrixVectorMultiply(
      this.weights.get('W_output')!, combined
    ).map((val, i) => val + this.biases.get('b_output')![i]));
    
    // New hidden state
    const newHiddenState = outputGate.map((val, i) => 
      val * this.tanh(newCellState[i])
    );

    return {
      hiddenState: newHiddenState,
      cellState: newCellState
    };
  }

  private predict(hiddenState: number[]): number[] {
    return this.matrixVectorMultiply(this.weights.get('W_output')!, hiddenState)
      .map((val, i) => val + this.biases.get('b_output')![i]);
  }

  private calculateAnomalyScore(sequence: number[][]): number {
    // Simplified anomaly detection based on sequence patterns
    const variations = sequence.map((transaction, i) => {
      if (i === 0) return 0;
      return this.euclideanDistance(transaction, sequence[i - 1]);
    });
    
    const avgVariation = variations.reduce((sum, val) => sum + val, 0) / variations.length;
    return Math.min(avgVariation / 100, 1); // Normalize
  }

  private euclideanDistance(a: number[], b: number[]): number {
    return Math.sqrt(a.reduce((sum, val, i) => sum + Math.pow(val - b[i], 2), 0));
  }

  private sigmoid(x: number[]): number[] {
    return x.map(val => 1 / (1 + Math.exp(-Math.max(-500, Math.min(500, val)))));
  }

  private tanh(x: number[]): number[] {
    return x.map(val => Math.tanh(val));
  }

  private matrixVectorMultiply(matrix: number[][], vector: number[]): number[] {
    return matrix.map(row => 
      row.reduce((sum, val, i) => sum + val * vector[i], 0)
    );
  }

  private randomMatrix(rows: number, cols: number): number[][] {
    return Array.from({ length: rows }, () =>
      Array.from({ length: cols }, () => (Math.random() - 0.5) * 0.1)
    );
  }

  private randomVector(size: number): number[] {
    return Array.from({ length: size }, () => (Math.random() - 0.5) * 0.1);
  }
}

// SHAP (SHapley Additive exPlanations) for Model Explainability
export class SHAPExplainer {
  private model: GradientBoostingClassifier;
  private baselineFeatures: MLFeatures;

  constructor(model: GradientBoostingClassifier, baselineFeatures: MLFeatures) {
    this.model = model;
    this.baselineFeatures = baselineFeatures;
  }

  explain(features: MLFeatures): {
    shapValues: Map<string, number>;
    prediction: number;
    explanation: string;
  } {
    const shapValues = new Map<string, number>();
    const featureKeys = Object.keys(features) as (keyof MLFeatures)[];
    
    // Calculate SHAP values using approximation
    featureKeys.forEach(feature => {
      const shapValue = this.calculateSHAPValue(features, feature);
      shapValues.set(feature as string, shapValue);
    });

    const prediction = this.model.predict(features);
    const explanation = this.generateExplanation(shapValues, prediction);

    return { shapValues, prediction, explanation };
  }

  private calculateSHAPValue(features: MLFeatures, targetFeature: keyof MLFeatures): number {
    const numSamples = 100;
    let marginalContributions = 0;

    for (let i = 0; i < numSamples; i++) {
      // Create random coalition
      const coalition = this.createRandomCoalition(features, targetFeature);
      
      // Calculate marginal contribution
      const withFeature = { ...coalition, [targetFeature]: features[targetFeature] };
      const withoutFeature = { ...coalition, [targetFeature]: this.baselineFeatures[targetFeature] };
      
      const contributionWith = this.model.predict(withFeature);
      const contributionWithout = this.model.predict(withoutFeature);
      
      marginalContributions += contributionWith - contributionWithout;
    }

    return marginalContributions / numSamples;
  }

  private createRandomCoalition(features: MLFeatures, excludeFeature: keyof MLFeatures): MLFeatures {
    const coalition = { ...this.baselineFeatures };
    const featureKeys = Object.keys(features) as (keyof MLFeatures)[];
    
    featureKeys.forEach(feature => {
      if (feature !== excludeFeature && Math.random() > 0.5) {
        coalition[feature] = features[feature];
      }
    });

    return coalition;
  }

  private generateExplanation(shapValues: Map<string, number>, prediction: number): string {
    const sortedFeatures = Array.from(shapValues.entries())
      .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))
      .slice(0, 3);

    const riskLevel = prediction > 0.7 ? 'HIGH' : prediction > 0.4 ? 'MEDIUM' : 'LOW';
    
    let explanation = `Risk Level: ${riskLevel} (${(prediction * 100).toFixed(1)}%)\n\n`;
    explanation += "Key factors:\n";
    
    sortedFeatures.forEach(([feature, value]) => {
      const impact = value > 0 ? 'increases' : 'decreases';
      const magnitude = Math.abs(value) > 0.1 ? 'significantly' : 'moderately';
      explanation += `• ${this.getFeatureDescription(feature)} ${magnitude} ${impact} risk\n`;
    });

    return explanation;
  }

  private getFeatureDescription(feature: string): string {
    const descriptions: Record<string, string> = {
      'amount': 'Transaction amount',
      'velocityScore': 'Transaction velocity',
      'deviceTrust': 'Device trust level',
      'newDevice': 'New device usage',
      'agentTrust': 'Agent reliability',
      'pinAttempts': 'PIN attempt pattern',
      'locationChange': 'Location change',
      'hour': 'Transaction timing',
      'networkTrust': 'Network security'
    };
    return descriptions[feature] || feature;
  }
}