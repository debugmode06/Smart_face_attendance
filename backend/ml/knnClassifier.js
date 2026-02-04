// backend/ml/knnClassifier.js

import { euclideanDistance, cosineDistance } from "./wifiDistance.js";
import { vectorizeDocument, getAllBSSIDs, vectorizeFingerprint } from "./vectorizeFingerprint.js";

/**
 * K-Nearest Neighbors (KNN) classifier for Wi-Fi fingerprint matching.
 * 
 * @param {Array<Object>} trainingFingerprints - Array of training fingerprint documents
 * @param {Object} testFingerprint - Test fingerprint (BSSID → RSSI map)
 * @param {number} k - Number of nearest neighbors (default: 3)
 * @param {string} distanceMetric - 'euclidean' or 'cosine' (default: 'euclidean')
 * @returns {Object} { predictedRoom, confidence, distances }
 */
export function knnClassify(
  trainingFingerprints,
  testFingerprint,
  k = 3,
  distanceMetric = "euclidean"
) {
  if (!trainingFingerprints || trainingFingerprints.length === 0) {
    throw new Error("Training fingerprints array is empty");
  }

  if (!testFingerprint) {
    throw new Error("Test fingerprint is required");
  }

  if (k < 1 || k > trainingFingerprints.length) {
    k = Math.min(k, trainingFingerprints.length);
  }

  // Get union of all BSSIDs from training data
  const allBSSIDs = getAllBSSIDs(trainingFingerprints);

  if (allBSSIDs.length === 0) {
    throw new Error("No BSSIDs found in training data");
  }

  // Vectorize test fingerprint
  const testVector = vectorizeFingerprint(testFingerprint, allBSSIDs);

  if (testVector.length === 0) {
    throw new Error("Failed to vectorize test fingerprint");
  }

  // Calculate distances to all training fingerprints
  const distances = trainingFingerprints.map((trainFp) => {
    const trainVector = vectorizeDocument(trainFp, allBSSIDs);

    let distance;
    if (distanceMetric === "cosine") {
      distance = cosineDistance(testVector, trainVector);
    } else {
      // Default: euclidean
      distance = euclideanDistance(testVector, trainVector);
    }

    return {
      roomId: trainFp.roomId,
      distance: distance,
      fingerprint: trainFp,
    };
  });

  // Sort by distance (ascending)
  distances.sort((a, b) => a.distance - b.distance);

  // Get k nearest neighbors
  const kNearest = distances.slice(0, k);

  // Majority voting: count occurrences of each roomId
  const roomVotes = {};
  kNearest.forEach((neighbor) => {
    const roomId = neighbor.roomId;
    roomVotes[roomId] = (roomVotes[roomId] || 0) + 1;
  });

  // Find room with most votes
  let predictedRoom = null;
  let maxVotes = 0;

  for (const [roomId, votes] of Object.entries(roomVotes)) {
    if (votes > maxVotes) {
      maxVotes = votes;
      predictedRoom = roomId;
    }
  }

  // Calculate confidence: percentage of k neighbors that voted for predicted room
  const confidence = (maxVotes / k) * 100;

  // Calculate average distance to k nearest neighbors (lower = better match)
  const avgDistance =
    kNearest.reduce((sum, n) => sum + n.distance, 0) / k;

  return {
    predictedRoom,
    confidence: Math.round(confidence * 100) / 100, // Round to 2 decimals
    avgDistance: Math.round(avgDistance * 10000) / 10000, // Round to 4 decimals
    kNearest: kNearest.map((n) => ({
      roomId: n.roomId,
      distance: Math.round(n.distance * 10000) / 10000,
    })),
  };
}




