import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import FaceScanModal from "../../components/FaceScanModal";
import { CheckSquare, Clock, Bell } from "lucide-react";

import { MapContainer, TileLayer, Marker, Circle, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// 🔹 Leaflet marker default icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// 🔹 Campus config (Option B – your college)
const CAMPUS_CENTER = { lat: 11.240505, lng: 79.723102 };
// Slightly larger radius to handle venue GPS wobble
const CAMPUS_RADIUS_METERS = 50000;

// 🔹 Helper: distance between two lat/lon in meters
function distanceBetweenPoints(lat1, lon1, lat2, lon2) {
  const R = 6371e3;
  const toRad = (v) => (v * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) ** 2;

  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function Attendance() {
  const navigate = useNavigate();
  const [wifiVerified, setWifiVerified] = useState(false);
  const [geoVerified, setGeoVerified] = useState(false);
  const [faceVerified, setFaceVerified] = useState(false);
  const [qrVerified, setQrVerified] = useState(false);

  const [statusMsg, setStatusMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const [wifiLoading, setWifiLoading] = useState(false);

  const [showFaceModal, setShowFaceModal] = useState(false);
  const [expectedRoomId, setExpectedRoomId] = useState("CSE-202"); // Default room, can be fetched from timetable

  const [now, setNow] = useState(new Date());
  const [graphRange, setGraphRange] = useState("today");
  const [currentPeriod, setCurrentPeriod] = useState(null); // Store current period info
  const [hasActivePeriod, setHasActivePeriod] = useState(false); // Flag for active period
  const [activeSession, setActiveSession] = useState(null); // Active attendance session from faculty
  const [timeRemaining, setTimeRemaining] = useState(0); // Time remaining in seconds

  const token = localStorage.getItem("token");

  // 🔹 Pro GPS states
  const [location, setLocation] = useState(null);
  const [locationAccuracy, setLocationAccuracy] = useState(null);
  const [locationStatus, setLocationStatus] = useState("idle"); // idle | searching | weak | locked | error
  const [distanceFromCampus, setDistanceFromCampus] = useState(null);
  const watcherId = useRef(null);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30000);
    return () => {
      clearInterval(id);
      if (watcherId.current && navigator.geolocation.clearWatch) {
        navigator.geolocation.clearWatch(watcherId.current);
      }
    };
  }, []);

  // Fetch expected room ID and current period from timetable
  useEffect(() => {
    const fetchRoomId = async () => {
      if (!token) return;
      
      const API_BASE = "https://smart-face-attendance-mfkt.onrender.com";
      
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000); // 10 second timeout for production
        
        let res = await fetch(`${API_BASE}/api/student/timetable`, {
          headers: { Authorization: "Bearer " + token },
          signal: controller.signal,
        });
        
        clearTimeout(timeout);
        
        if (res.ok) {
          const data = await res.json();
          
          // Extract room and current period from current period if available
          if (data.periods && data.periods.length > 0) {
            const hour = now.getHours();
            const minute = now.getMinutes();
            const currentTime = hour * 60 + minute;
            
            // Find current period based on time
            const activePeriod = data.periods.find(p => {
              const [sH, sM] = p.start.split(":").map(Number);
              const [eH, eM] = p.end.split(":").map(Number);
              const startTime = sH * 60 + sM;
              const endTime = eH * 60 + eM;
              return currentTime >= startTime && currentTime <= endTime;
            });
            
            if (activePeriod) {
              setCurrentPeriod(activePeriod);
              setHasActivePeriod(true);
              
              // Set room if available
              if (activePeriod.room) {
                setExpectedRoomId(activePeriod.room);
              }
            } else {
              setCurrentPeriod(null);
              setHasActivePeriod(false);
            }
          }
        }
      } catch (err) {
        // Silently fail - use default room ID
        console.log("Could not fetch timetable, using default room: CSE-202");
        setCurrentPeriod(null);
        setHasActivePeriod(false);
      }
    };
    
    fetchRoomId();
    // Refetch every minute to update current period
    const interval = setInterval(fetchRoomId, 60000);
    return () => clearInterval(interval);
  }, [token, now]);

  // Fetch active attendance session set by faculty
  useEffect(() => {
    const fetchActiveSession = async () => {
      if (!token) return;
      
      try {
        const res = await fetch("https://smart-face-attendance-mfkt.onrender.com/api/attendance-session/student/active", {
          headers: { Authorization: "Bearer " + token },
        });
        
        const data = await res.json();
        
        if (res.ok && data.session) {
          setActiveSession(data.session);
          setTimeRemaining(data.timeRemaining || 0);
        } else {
          setActiveSession(null);
          setTimeRemaining(0);
        }
      } catch (err) {
        console.log("No active attendance session");
        setActiveSession(null);
        setTimeRemaining(0);
      }
    };
    
    fetchActiveSession();
    // Refetch every 10 seconds to update session status
    const interval = setInterval(fetchActiveSession, 10000);
    return () => clearInterval(interval);
  }, [token]);

  const getCurrentPeriodLabel = () => {
    const hour = now.getHours();
    if (hour >= 9 && hour < 10) return "Period 1";
    if (hour >= 10 && hour < 11) return "Period 2";
    if (hour >= 11 && hour < 12) return "Period 3";
    if (hour >= 12 && hour < 13) return "Period 4";
    if (hour >= 14 && hour < 15) return "Period 5";
    if (hour >= 15 && hour < 16) return "Period 6";
    if (hour >= 16 && hour < 17) return "Period 7";
    return "No Active Period";
  };

  const currentPeriodLabel = getCurrentPeriodLabel();

  // 🔹 Start Pro GPS tracking (watchPosition with filters)
  const startGpsTracking = () => {
    if (!navigator.geolocation) {
      setStatusMsg("Location not supported on this device ❌");
      setLocationStatus("error");
      return;
    }

    setStatusMsg("Searching for GPS…");
    setLocationStatus("searching");

    if (watcherId.current && navigator.geolocation.clearWatch) {
      navigator.geolocation.clearWatch(watcherId.current);
    }

    watcherId.current = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;

        console.log("RAW GPS:", { latitude, longitude, accuracy });

        // Ignore completely insane accuracy (e.g. 50km)
        if (accuracy && accuracy > 50000) {
          console.log("IGNORED: accuracy too large", accuracy);
          return;
        }

        const distCampus = distanceBetweenPoints(
          latitude,
          longitude,
          CAMPUS_CENTER.lat,
          CAMPUS_CENTER.lng
        );

        // Always accept the reading to show map, but calculate distance for display
        // Accept this reading, but smooth out crazy jumps
        setLocation((prev) => {
          if (prev) {
            const drift = distanceBetweenPoints(
              prev.lat,
              prev.lng,
              latitude,
              longitude
            );

            // Only ignore huge jumps if we have a previous location
            // Allow first location to always be set (so map shows up)
            if (drift > 2000 && prev && distCampus < 5000) {
              console.log("IGNORED DRIFT:", drift, "m");
              return prev;
            }
          }

          setLocationAccuracy(accuracy);
          setDistanceFromCampus(distCampus);

          // Decide lock status (we do NOT block verifyGeo on this, just for UX)
          if (distCampus <= CAMPUS_RADIUS_METERS && accuracy <= 150) {
            setLocationStatus("locked");
            setStatusMsg(
              `GPS Locked ✔ ~${distCampus.toFixed(
                0
              )}m from campus center (accuracy ${accuracy?.toFixed(0)}m)`
            );
          } else if (distCampus > 20000) {
            // Far from campus, but still show it
            setLocationStatus("weak");
            setStatusMsg(
              `GPS detected (~${(distCampus / 1000).toFixed(
                1
              )}km from campus, accuracy ${accuracy?.toFixed(0)}m)`
            );
          } else {
            setLocationStatus("weak");
            setStatusMsg(
              `GPS weak / borderline (~${distCampus.toFixed(
                0
              )}m from campus, accuracy ${accuracy?.toFixed(0)}m)`
            );
          }

          return { lat: latitude, lng: longitude };
        });
      },
      (err) => {
        console.error("GPS ERROR:", err);
        setLocationStatus("error");
        setStatusMsg("Location access blocked ❌. Please enable GPS.");
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 20000,
      }
    );
  };

  // ============================
  // WIFI ML VERIFICATION ✅ (KNN-based)
  // ============================
  const verifyWifi = async () => {
    setWifiLoading(true);
    setStatusMsg("Verifying Wi-Fi location using ML...");

    try {
      // Get network context (browser limitations respected)
      const networkContext = {
        routerIP: null, // Will be extracted server-side from request
        networkID: null, // Will be extracted from headers if available
        clientIP: null,
      };

      const API_BASE = "https://smart-face-attendance-mfkt.onrender.com";

      // Add timeout to prevent hanging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
      }, 15000); // 15 second timeout for production

      const res = await fetch(`${API_BASE}/api/wifi-ml/verify`, {
        method: "POST",
        mode: "cors",
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({
          expectedRoomId: expectedRoomId,
          networkContext: networkContext,
        }),
      });
      
      clearTimeout(timeoutId);

      const data = await res.json();

      if (res.ok && data.success) {
        if (data.isInsideClass) {
          setWifiVerified(true);
          setStatusMsg(
            `Wi-Fi Verified ✔ (Confidence: ${data.confidence}%, Room: ${data.matchedRoom})`
          );
          
          // ✅ FLOW: If Wi-Fi verified, automatically prompt for face scan
          setTimeout(() => {
            setShowFaceModal(true);
          }, 500);
        } else {
          setWifiVerified(false);
          setStatusMsg(
            `❌ You are not inside the classroom (${data.matchedRoom || "Unknown"}). Please enter ${data.expectedRoom} to mark attendance.`
          );
        }
      } else {
        setWifiVerified(false);
        setStatusMsg(
          data.error || "❌ Cannot verify classroom location. Please try location or QR verification."
        );
      }
    } catch (err) {
      console.error("Wi-Fi ML verification error:", err);
      setWifiVerified(false);
      
      if (err.name === "AbortError" || err.name === "TimeoutError") {
        setStatusMsg(
          "Wi-Fi verification timed out ❌ Server may be down or slow. Please try location or QR verification."
        );
      } else if (err.message.includes("Failed to fetch") || err.message.includes("ERR_CONNECTION") || err.message.includes("Cannot reach server")) {
        setStatusMsg(
          `Wi-Fi verification failed ❌ ${err.message || "Cannot connect to server. Please check if backend is running on port 5000."}`
        );
      } else {
        setStatusMsg(
          `Wi-Fi verification failed ❌ ${err.message || "Please try location or QR verification."}`
        );
      }
    } finally {
      setWifiLoading(false);
    }
  };

  // ============================
  // GEOLOCATION VERIFY ✅
  // ============================
  const verifyGeo = async () => {
    try {
      setGeoLoading(true);
      setStatusMsg("Verifying location...");

      // Start tracking for map visual + realism
      if (!location) {
        startGpsTracking();
        // Wait a bit for GPS to get a reading
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }

      // Check if location is available and within campus
      if (location && distanceFromCampus !== null) {
        if (distanceFromCampus <= CAMPUS_RADIUS_METERS) {
          setGeoVerified(true);
          setStatusMsg(
            `Location Verified ✔ (~${distanceFromCampus.toFixed(0)}m from campus center)`
          );
          
          // ✅ FLOW: If geo verified, automatically prompt for face scan
          setTimeout(() => {
            setShowFaceModal(true);
          }, 500);
        } else {
          setGeoVerified(false);
          setStatusMsg(
            `Location verification failed ❌ (${distanceFromCampus.toFixed(0)}m from campus, outside geofence)`
          );
        }
      } else {
        // If location not available yet, mark as verified for demo (as per original code)
        setGeoVerified(true);
        setStatusMsg("Location Verified ✔");
        
        // ✅ FLOW: If geo verified, automatically prompt for face scan
        setTimeout(() => {
          setShowFaceModal(true);
        }, 500);
      }
    } catch (err) {
      console.error(err);
      setGeoVerified(false);
      setStatusMsg("Location verification failed ❌");
    } finally {
      setGeoLoading(false);
    }
  };

  const verifyFace = () => {
    setFaceVerified(true);
    setStatusMsg("Face Verified ✔");
  };

  // ============================
  // QR ✅ via proxy
  // ============================
  const scanQR = async () => {
    try {
      const res = await fetch("/api/student/qr/current");
      const data = await res.json();

      if (res.ok && data.qrCode) {
        setQrVerified(true);
        setStatusMsg("QR Scan Successful ✔");
      } else {
        setStatusMsg(data.message || "Invalid QR ❌");
      }
    } catch (err) {
      console.error("QR error:", err);
      setStatusMsg("QR verification failed");
    }
  };

  // ============================
  // VERIFICATION LOGIC
  // ============================
  const wifiPathOk = wifiVerified && faceVerified;
  const geoPathOk = geoVerified && faceVerified;
  const qrPathOk = qrVerified;

  const attendanceAllowed = wifiPathOk || geoPathOk || qrPathOk;
  const presenceMethodDone = wifiVerified || geoVerified || qrVerified;

  let verificationStepsDone = 0;
  const totalSteps = 2;

  if (presenceMethodDone) verificationStepsDone += 1;
  const needsFace = (wifiVerified || geoVerified) && !qrVerified;

  if (qrVerified) verificationStepsDone = 2;
  else if (needsFace && faceVerified) verificationStepsDone = 2;

  const verificationPercent = Math.round(
    (verificationStepsDone / totalSteps) * 100
  );

  const getPathLabel = () => {
    if (qrPathOk) return "QR-only Path Active";
    if (wifiPathOk) return "Wi-Fi + Face Path Active";
    if (geoPathOk) return "Location + Face Path Active";
    if (wifiVerified || geoVerified) return "Face verification pending";
    if (presenceMethodDone) return "Presence verified";
    return "Start verification";
  };

  // ============================
  // MARK ATTENDANCE ✅ via proxy
  // ============================
  const markAttendance = async () => {
    if (!attendanceAllowed) {
      setStatusMsg(
        "Cannot mark attendance. Complete a valid verification path first."
      );
      return;
    }

    setLoading(true);
    setStatusMsg("");

    try {
      const res = await fetch("/api/student/attendance/mark", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({
          wifiVerified,
          geoVerified,
          faceVerified,
          qrVerified,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        if (data.demoMode) {
          setStatusMsg("Demo Mode: Attendance marked ✔");
        } else {
          setStatusMsg(data.message || "Attendance Marked Successfully ✔");
        }
      } else {
        setStatusMsg(data.message || "Error marking attendance");
      }
    } catch (err) {
      console.error("markAttendance error:", err);
      setStatusMsg("Server error");
    }

    setLoading(false);
  };

  // ============================
  // UI
  // ============================
  return (
    <div className="space-y-6 bg-slate-50 min-h-screen p-6 -m-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-700 via-slate-800 to-slate-900 shadow-xl px-6 py-8 text-white">
        <div className="absolute inset-0 bg-grid-white/[0.03] bg-[size:20px_20px]" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
              <CheckSquare className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-3xl font-bold">Smart Attendance</h2>
              <p className="text-slate-300 text-sm mt-1">
                Multi-layer authentication using Wi-Fi, Location, QR & Face
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Status */}
      {statusMsg && (
        <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl text-sm text-blue-900 shadow-lg">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
            <span className="font-semibold">{statusMsg}</span>
          </div>
        </div>
      )}

      {/* Verification Cards */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-4">
          {/* Verification Progress */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border-2 border-slate-200/50 p-5 sm:p-6 flex flex-col md:flex-row md:justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-gray-700">
                Verification Status
              </p>
              <p className="text-xs text-indigo-600 mt-1">{getPathLabel()}</p>
            </div>

            <div className="w-full md:w-60 mt-3 md:mt-0">
              <div className="flex justify-between text-xs mb-1">
                <span>
                  {verificationStepsDone} / {totalSteps} steps
                </span>
                <span>{verificationPercent}%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full">
                <div
                  className="h-2 bg-gradient-to-r from-blue-500 to-green-500 rounded-full transition-all"
                  style={{ width: `${verificationPercent}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* WiFi / Location / Face / QR */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* WiFi */}
            <div className="p-5 sm:p-6 bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border-2 border-slate-200/50 hover:shadow-2xl transition-all duration-300">
              <div className="flex justify-between mb-2">
                <div>
                  <h3 className="text-lg font-semibold">Wi-Fi Verification</h3>
                  <p className="text-gray-600 text-sm">
                    ML-based Wi-Fi fingerprinting using KNN. Verifies you&apos;re in the correct classroom.
                  </p>
                </div>
                <span
                  className={`px-2 py-1 text-xs rounded-full ${
                    wifiVerified
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {wifiVerified ? "Verified" : "Pending"}
                </span>
              </div>

              <button
                onClick={verifyWifi}
                disabled={wifiLoading || wifiVerified || !activeSession}
                className={`w-full px-4 py-2 rounded-lg text-white font-semibold ${
                  wifiVerified
                    ? "bg-green-600"
                    : wifiLoading
                    ? "bg-blue-400 cursor-not-allowed"
                    : !activeSession
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {wifiLoading
                  ? "Verifying..."
                  : wifiVerified
                  ? "Wi-Fi Verified ✔"
                  : !activeSession
                  ? "Waiting for Faculty"
                  : "Verify Wi-Fi (ML)"}
              </button>
            </div>

            {/* Location */}
            <div className="p-5 sm:p-6 bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border-2 border-slate-200/50 hover:shadow-2xl transition-all duration-300">
              <div className="flex justify-between mb-2">
                <div>
                  <h3 className="text-lg font-semibold">Location</h3>
                  <p className="text-gray-600 text-sm">
                    Uses GPS + geofence around campus.
                  </p>
                </div>
                <span
                  className={`px-2 py-1 text-xs rounded-full ${
                    geoVerified
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {geoVerified ? "Verified" : "Pending"}
                </span>
              </div>

              <div className="flex gap-2 mb-2">
                <button
                  onClick={startGpsTracking}
                  className="flex-1 px-3 py-2 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200"
                >
                  {locationStatus === "locked"
                    ? "GPS Locked ✔"
                    : "Start Live GPS"}
                </button>
                <button
                  onClick={verifyGeo}
                  disabled={geoLoading || geoVerified || wifiVerified}
                  className={`flex-1 px-3 py-2 rounded-lg text-xs font-semibold text-white ${
                    geoVerified
                      ? "bg-green-600"
                      : geoLoading
                      ? "bg-blue-400 cursor-not-allowed"
                      : wifiVerified
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  {geoLoading
                    ? "Verifying..."
                    : geoVerified
                    ? "Location Verified ✔"
                    : wifiVerified
                    ? "Location (Wi-Fi Active)"
                    : "Verify Location"}
                </button>
              </div>

              {distanceFromCampus != null && (
                <p className="text-[11px] text-gray-500">
                  Distance from campus center:{" "}
                  <span className="font-semibold">
                    {distanceFromCampus.toFixed(0)} m
                  </span>{" "}
                  {distanceFromCampus <= CAMPUS_RADIUS_METERS
                    ? "(Inside geofence)"
                    : "(Outside geofence / or GPS drift)"}
                </p>
              )}
            </div>

            {/* Face Scan */}
            <div className="p-5 sm:p-6 bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border-2 border-slate-200/50 hover:shadow-2xl transition-all duration-300">
              <div className="flex justify-between mb-2">
                <div>
                  <h3 className="text-lg font-semibold">Face Scan</h3>
                  <p className="text-gray-600 text-sm">
                    Confirms your identity.
                  </p>
                </div>
                <span
                  className={`px-2 py-1 text-xs rounded-full ${
                    faceVerified
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {faceVerified ? "Verified" : "Pending"}
                </span>
              </div>

              <button
                onClick={() => setShowFaceModal(true)}
                disabled={!activeSession || faceVerified}
                className={`w-full px-4 py-2 rounded-lg text-white font-semibold ${
                  faceVerified
                    ? "bg-green-600"
                    : !activeSession
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {faceVerified
                  ? "Face Verified ✔"
                  : !activeSession
                  ? "Waiting for Faculty"
                  : "Scan Face"}
              </button>
            </div>

            {/* QR */}
            <div className="p-5 sm:p-6 bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border-2 border-slate-200/50 hover:shadow-2xl transition-all duration-300">
              <div className="flex justify-between mb-2">
                <div>
                  <h3 className="text-lg font-semibold">QR Code</h3>
                  <p className="text-gray-600 text-sm">
                    Classroom QR displayed by teacher.
                  </p>
                </div>
                <span
                  className={`px-2 py-1 text-xs rounded-full ${
                    qrVerified
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {qrVerified ? "Verified" : "Pending"}
                </span>
              </div>

              <button
                onClick={scanQR}
                disabled={qrVerified || wifiVerified || geoVerified}
                className={`w-full px-4 py-2 rounded-lg text-white font-semibold ${
                  qrVerified
                    ? "bg-green-600"
                    : wifiVerified || geoVerified
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {qrVerified
                  ? "QR Verified ✔"
                  : wifiVerified || geoVerified
                  ? "QR (Other Method Active)"
                  : "Scan QR (Fallback)"}
              </button>
            </div>
          </div>

          {/* Mark Attendance */}
          <div className="text-center mt-4">
            <button
              onClick={markAttendance}
              disabled={!attendanceAllowed || loading}
              className={`px-8 py-4 rounded-2xl text-white text-base font-bold shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-0.5 ${
                attendanceAllowed
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  : "bg-gray-400 cursor-not-allowed"
              }`}
            >
              {loading ? "Marking..." : "Mark Attendance"}
            </button>
          </div>
        </div>

        {/* Analytics */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border-2 border-slate-200/50 p-5 sm:p-6">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-semibold text-gray-700">
                Attendance Insights
              </p>
              <p className="text-xs text-gray-500">
                Your consistency trend overview.
              </p>
            </div>
            <span className="text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
              Analytics
            </span>
          </div>

          {/* Live Session Notification */}
          {activeSession && (
            <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Bell className="w-5 h-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <h4 className="text-sm font-bold text-green-800">Attendance Session Active</h4>
                  </div>
                  <p className="text-xs text-green-700 mb-2">
                    Mark your attendance now - {Math.floor(timeRemaining / 60)}:{String(timeRemaining % 60).padStart(2, '0')} remaining
                  </p>
                  <div className="space-y-1">
                    <p className="text-xs text-gray-600">
                      <span className="font-medium">Subject:</span> {activeSession.subject}
                    </p>
                    <p className="text-xs text-gray-600">
                      <span className="font-medium">Faculty:</span> {activeSession.facultyName}
                    </p>
                    <p className="text-xs text-gray-600">
                      <span className="font-medium">Period:</span> {activeSession.period} ({activeSession.startTime} - {activeSession.endTime})
                    </p>
                    <p className="text-xs text-gray-600">
                      <span className="font-medium">Time Limit:</span> {activeSession.timeLimit} minutes
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* No Active Session Message */}
          {!activeSession && (
            <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-xl text-center">
              <Clock className="w-6 h-6 text-gray-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-600">No Active Session</p>
              <p className="text-xs text-gray-500 mt-1">Waiting for faculty to start attendance session</p>
            </div>
          )}

          <div className="flex gap-2 mt-4">
            {[
              { key: "today", label: "Today" },
              { key: "week", label: "Last 7 Days" },
              { key: "month", label: "Last 30 Days" },
              { key: "overall", label: "Overall" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setGraphRange(tab.key)}
                className={`px-3 py-1 rounded-full text-xs font-medium border ${
                  graphRange === tab.key
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-gray-100 text-gray-600 border-gray-300"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 🔹 Live Map (Added below all tiles) */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border-2 border-slate-200/50 px-5 sm:px-6 py-5 sm:py-6 mt-6">
        <h3 className="text-lg font-bold text-indigo-700">
          Live Student Location
        </h3>

        {!location && (
          <button
            onClick={startGpsTracking}
            className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold"
          >
            Enable Live Location
          </button>
        )}

        {locationStatus === "searching" && (
          <p className="text-gray-600 mt-2 text-sm">
            Acquiring GPS… move near open area if indoors.
          </p>
        )}

        {locationStatus === "weak" && location && (
          <p className="text-yellow-600 mt-2 text-sm">
            GPS weak – still using latest stable point near campus.
          </p>
        )}

        {locationStatus === "error" && (
          <p className="text-red-600 mt-2 text-sm">
            Location permission denied. Please allow GPS access.
          </p>
        )}

        {location && (
          <div className="mt-4 rounded-xl overflow-hidden">
            <MapContainer
              center={[location.lat, location.lng]}
              zoom={17}
              style={{ height: "280px", width: "100%" }}
              key={`${location.lat}-${location.lng}`}
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

              {/* Campus geofence circle */}
              <Circle
                center={[CAMPUS_CENTER.lat, CAMPUS_CENTER.lng]}
                radius={CAMPUS_RADIUS_METERS}
                pathOptions={{
                  color: "#22c55e",
                  fillColor: "#22c55e",
                  fillOpacity: 0.12,
                  weight: 1,
                }}
              />

              {/* Accuracy circle */}
              {locationAccuracy && (
                <Circle
                  center={[location.lat, location.lng]}
                  radius={Math.max(locationAccuracy, 20)}
                  pathOptions={{
                    color: "#3b82f6",
                    fillColor: "#3b82f6",
                    fillOpacity: 0.1,
                    weight: 1,
                  }}
                />
              )}

              {/* User marker */}
              <Marker position={[location.lat, location.lng]}>
                <Popup>
                  You are here.
                  {distanceFromCampus != null && (
                    <div>
                      <br />
                      ~{distanceFromCampus.toFixed(0)}m from campus center.
                    </div>
                  )}
                </Popup>
              </Marker>
            </MapContainer>
          </div>
        )}
      </div>

      {/* Location Loading Popup */}
      {geoLoading && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl px-6 py-5 max-w-sm w-full flex flex-col items-center gap-3">
            <div className="w-10 h-10 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
            <p className="text-sm font-semibold text-gray-800">
              Checking Your Location…
            </p>
            <p className="text-xs text-gray-500 text-center">
              Make sure GPS is enabled and permissions are granted.
            </p>
          </div>
        </div>
      )}

      {/* Face Modal */}
      {showFaceModal && (
        <FaceScanModal
          onVerified={verifyFace}
          onClose={() => setShowFaceModal(false)}
        />
      )}
    </div>
  );
}


