// backend/ml/vectorizeFingerprint.js

/**
 * Convert Wi-Fi fingerprint (BSSID → RSSI map) into a feature vector.
 * 
 * Since browsers cannot scan Wi-Fi, we use network context (router IP, network ID)
 * combined with stored fingerprints to create comparable vectors.
 * 
 * @param {Map|Object} fingerprint - BSSID → RSSI mapping
 * @param {Array<string>} allBSSIDs - Union of all BSSIDs from training data
 * @returns {Array<number>} Feature vector (normalized RSSI values)
 */
export function vectorizeFingerprint(fingerprint, allBSSIDs) {
  if (!fingerprint || !allBSSIDs || allBSSIDs.length === 0) {
    return [];
  }

  // Convert Map to Object if needed
  const fingerprintObj = fingerprint instanceof Map 
    ? Object.fromEntries(fingerprint) 
    : fingerprint;

  // Create vector: one dimension per BSSID
  const vector = allBSSIDs.map((bssid) => {
    // Normalize BSSID (lowercase, consistent format)
    const normalizedBSSID = bssid.toLowerCase().trim();
    
    // Get RSSI value (or -100 if missing - represents very weak/no signal)
    const rssi = fingerprintObj[normalizedBSSID] ?? -100;
    
    // Normalize RSSI to [0, 1] range
    // RSSI typically ranges from -100 (weak) to -30 (strong)
    // Formula: (rssi + 100) / 70
    const normalized = Math.max(0, Math.min(1, (rssi + 100) / 70));
    
    return normalized;
  });

  return vector;
}

/**
 * Get union of all BSSIDs from multiple fingerprints.
 * 
 * @param {Array<Object>} fingerprints - Array of fingerprint objects
 * @returns {Array<string>} Sorted array of unique BSSIDs
 */
export function getAllBSSIDs(fingerprints) {
  const bssidSet = new Set();

  fingerprints.forEach((fp) => {
    const fingerprint = fp.fingerprint instanceof Map
      ? Object.fromEntries(fp.fingerprint)
      : fp.fingerprint;

    Object.keys(fingerprint).forEach((bssid) => {
      bssidSet.add(bssid.toLowerCase().trim());
    });
  });

  return Array.from(bssidSet).sort();
}

/**
 * Convert fingerprint from MongoDB document format to vector.
 * 
 * @param {Object} fingerprintDoc - MongoDB document with fingerprint field
 * @param {Array<string>} allBSSIDs - Union of all BSSIDs
 * @returns {Array<number>} Feature vector
 */
export function vectorizeDocument(fingerprintDoc, allBSSIDs) {
  if (!fingerprintDoc || !fingerprintDoc.fingerprint) {
    return [];
  }

  return vectorizeFingerprint(fingerprintDoc.fingerprint, allBSSIDs);
}


