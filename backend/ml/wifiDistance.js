// backend/ml/wifiDistance.js

/**
 * Calculate Euclidean distance between two feature vectors.
 * 
 * @param {Array<number>} vec1 - First feature vector
 * @param {Array<number>} vec2 - Second feature vector
 * @returns {number} Euclidean distance
 */
export function euclideanDistance(vec1, vec2) {
  if (!vec1 || !vec2 || vec1.length !== vec2.length) {
    throw new Error("Vectors must have the same length");
  }

  let sumSquaredDiff = 0;
  for (let i = 0; i < vec1.length; i++) {
    const diff = vec1[i] - vec2[i];
    sumSquaredDiff += diff * diff;
  }

  return Math.sqrt(sumSquaredDiff);
}

/**
 * Calculate Cosine similarity between two feature vectors.
 * Returns value in [0, 1] where 1 = identical, 0 = orthogonal.
 * 
 * @param {Array<number>} vec1 - First feature vector
 * @param {Array<number>} vec2 - Second feature vector
 * @returns {number} Cosine similarity (0 to 1)
 */
export function cosineSimilarity(vec1, vec2) {
  if (!vec1 || !vec2 || vec1.length !== vec2.length) {
    throw new Error("Vectors must have the same length");
  }

  let dotProduct = 0;
  let norm1 = 0;
  let norm2 = 0;

  for (let i = 0; i < vec1.length; i++) {
    dotProduct += vec1[i] * vec2[i];
    norm1 += vec1[i] * vec1[i];
    norm2 += vec2[i] * vec2[i];
  }

  const magnitude = Math.sqrt(norm1) * Math.sqrt(norm2);
  
  if (magnitude === 0) {
    return 0; // Avoid division by zero
  }

  return dotProduct / magnitude;
}

/**
 * Calculate Cosine distance (1 - similarity).
 * Returns value in [0, 1] where 0 = identical, 1 = orthogonal.
 * 
 * @param {Array<number>} vec1 - First feature vector
 * @param {Array<number>} vec2 - Second feature vector
 * @returns {number} Cosine distance (0 to 1)
 */
export function cosineDistance(vec1, vec2) {
  return 1 - cosineSimilarity(vec1, vec2);
}

/**
 * Calculate Manhattan (L1) distance between two feature vectors.
 * 
 * @param {Array<number>} vec1 - First feature vector
 * @param {Array<number>} vec2 - Second feature vector
 * @returns {number} Manhattan distance
 */
export function manhattanDistance(vec1, vec2) {
  if (!vec1 || !vec2 || vec1.length !== vec2.length) {
    throw new Error("Vectors must have the same length");
  }

  let sumAbsDiff = 0;
  for (let i = 0; i < vec1.length; i++) {
    sumAbsDiff += Math.abs(vec1[i] - vec2[i]);
  }

  return sumAbsDiff;
}



