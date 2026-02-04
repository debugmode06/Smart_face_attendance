import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";
import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import L from "leaflet";

/* MUI */
import {
  Box,
  Grid,
  Paper,
  Typography,
  Button,
  Chip,
  Stack,
  Avatar,
  IconButton,
  Divider,
  LinearProgress,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import LocationOnOutlined from "@mui/icons-material/LocationOnOutlined";
import QrCode2Icon from "@mui/icons-material/QrCode2";
import ClassIcon from "@mui/icons-material/Class";
import GroupsIcon from "@mui/icons-material/Groups";
import AccessTimeIcon from "@mui/icons-material/AccessTime";

/* Fix leaflet marker asset paths */
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

export default function FacultyAttendance() {
  const navigate = useNavigate();
  // --- Original state & logic
  const [qrCode, setQrCode] = useState("");
  const [expiresIn, setExpiresIn] = useState(30);
  const [className, setClassName] = useState("");
  const [periods, setPeriods] = useState([]);
  const token = localStorage.getItem("token");

  // --- Location
  const [location, setLocation] = useState(null);
  const [locationStatus, setLocationStatus] = useState("idle");
  const locationWatcher = useRef(null);

  // fetch QR
  const fetchQR = async () => {
    try {
      const res = await fetch("https://smart-face-attendance-mfkt.onrender.com/api/student/qr/current");
      const data = await res.json();
      setQrCode(data.qrCode);
      setExpiresIn(data.expiresIn);
    } catch {}
  };

  // fetch attendance data
  const fetchAttendanceData = async () => {
    try {
      const res = await fetch(
        "https://smart-face-attendance-mfkt.onrender.com/api/faculty/attendance/day",
        {
          headers: { Authorization: "Bearer " + token },
        }
      );
      const data = await res.json();
      setClassName(data.className || "");
      setPeriods(data.periods || []);
    } catch {}
  };

  // start watching location
  const requestLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus("denied");
      return;
    }
    setLocationStatus("loading");
    locationWatcher.current = navigator.geolocation.watchPosition(
      (pos) => {
        setLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        });
        setLocationStatus("success");
      },
      () => setLocationStatus("denied"),
      { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
    );
  };

  useEffect(() => {
    fetchQR();
    fetchAttendanceData();

    const interval = setInterval(() => {
      fetchQR();
      fetchAttendanceData();
    }, 2000);

    return () => {
      clearInterval(interval);
      if (locationWatcher.current)
        navigator.geolocation.clearWatch(locationWatcher.current);
    };
  }, []);

  // --- Style
  const cardStyle = {
    background: "#ffffff",
    border: "1px solid rgba(15, 23, 42, 0.04)",
  };

  return (
    <Box sx={{ minHeight: "100vh", p: { xs: 2, md: 4 }, bgcolor: "#f8fafc" }}>
      {/* Header */}
      <Stack
        direction={{ xs: "column", md: "row" }}
        justifyContent="space-between"
        alignItems="center"
        mb={3}
        spacing={2}
      >
        <Box>
          <Typography variant="h4" sx={{ color: "#0f172a", fontWeight: 800 }}>
            Faculty Attendance
          </Typography>
          <Typography variant="body2" sx={{ color: "#334155", mt: 0.5 }}>
            Real-time classroom monitoring — map, QR and attendance overview
          </Typography>
        </Box>

        <Stack direction="row" spacing={1}>
          {/* Live Attendance Button */}
          <Button
            variant="contained"
            onClick={() => navigate("/faculty/live-attendance")}
            startIcon={<AccessTimeIcon />}
            sx={{
              background: "linear-gradient(90deg,#10b981,#059669)",
              boxShadow: "0 6px 18px rgba(16,185,129,0.3)",
              textTransform: "none",
              fontWeight: 700,
              px: 3,
              "&:hover": {
                background: "linear-gradient(90deg,#059669,#047857)",
              },
            }}
          >
            Start Live Session
          </Button>

          <Paper
            sx={{
              ...cardStyle,
              px: 2,
              py: 1,
              display: "flex",
              alignItems: "center",
              boxShadow: 2,
            }}
          >
            <Avatar sx={{ mr: 1, bgcolor: "#eef2ff", color: "#3730a3" }}>
              <QrCode2Icon />
            </Avatar>
            <Box>
              <Typography variant="caption" sx={{ color: "#64748b" }}>
                QR Refresh
              </Typography>
              <Typography sx={{ fontWeight: 700, color: "#0f172a" }}>
                {expiresIn}s
              </Typography>
            </Box>
          </Paper>

          <Paper
            sx={{
              ...cardStyle,
              px: 2,
              py: 1,
              display: "flex",
              alignItems: "center",
              boxShadow: 2,
            }}
          >
            <Avatar sx={{ mr: 1, bgcolor: "#eef2ff", color: "#3730a3" }}>
              <ClassIcon />
            </Avatar>
            <Box>
              <Typography variant="caption" sx={{ color: "#64748b" }}>
                Teaching Class
              </Typography>
              <Typography sx={{ fontWeight: 700, color: "#0f172a" }}>
                {className || "Loading..."}
              </Typography>
            </Box>
          </Paper>
        </Stack>
      </Stack>

      {/* Main layout */}
      <Grid container spacing={3}>
        {/* Left side: MAP + QR */}
        <Grid item xs={12} md={8}>
          <Stack spacing={3}>
            {/* MAP CARD */}
            <Paper sx={{ borderRadius: 3, overflow: "hidden", ...cardStyle, p: 2, boxShadow: 2 }}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                mb={1}
              >
                <Stack direction="row" spacing={1} alignItems="center">
                  <LocationOnOutlined sx={{ color: "#0ea5a4" }} />
                  <Typography sx={{ color: "#0f172a", fontWeight: 700 }}>
                    Live Faculty Map
                  </Typography>
                  <Chip
                    size="small"
                    label={
                      locationStatus === "idle"
                        ? "Disabled"
                        : locationStatus === "loading"
                        ? "Locating…"
                        : locationStatus === "denied"
                        ? "Permission Denied"
                        : "Live"
                    }
                    sx={{
                      ml: 1,
                      bgcolor:
                        locationStatus === "success"
                          ? "rgba(16,185,129,0.12)"
                          : locationStatus === "denied"
                          ? "rgba(239,68,68,0.08)"
                          : "rgba(249,115,22,0.06)",
                      color: "#0f172a",
                      fontWeight: 700,
                      px: 1,
                    }}
                  />
                </Stack>

                <Stack direction="row" spacing={1}>
                  <Button
                    variant="contained"
                    onClick={requestLocation}
                    sx={{
                      background: "linear-gradient(90deg,#06b6d4,#7c3aed)",
                      boxShadow: "0 6px 18px rgba(124,58,237,0.12)",
                      textTransform: "none",
                    }}
                  >
                    Enable Location
                  </Button>
                  <IconButton
                    onClick={() => {
                      fetchAttendanceData();
                      fetchQR();
                    }}
                    sx={{ bgcolor: "#f1f5f9" }}
                  >
                    <RefreshIcon sx={{ color: "#0f172a" }} />
                  </IconButton>
                </Stack>
              </Stack>

              <Divider sx={{ borderColor: "rgba(15,23,42,0.06)", mb: 2 }} />

              {locationStatus === "success" && location ? (
                <Box sx={{ height: { xs: 260, md: 420 }, borderRadius: 2, overflow: "hidden" }}>
                  <MapContainer
                    center={[location.lat, location.lng]}
                    zoom={17}
                    key={`${location.lat}-${location.lng}`}
                    style={{ height: "100%", width: "100%" }}
                  >
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <Circle
                      center={[location.lat, location.lng]}
                      radius={30}
                      pathOptions={{
                        color: "#06b6d4",
                        fillColor: "#06b6d4",
                        fillOpacity: 0.12,
                      }}
                    />
                    <Marker position={[location.lat, location.lng]}>
                      <Popup>
                        Faculty Current Position <br />
                        Accuracy: {Math.round(location.accuracy ?? 0)} m
                      </Popup>
                    </Marker>
                  </MapContainer>
                </Box>
              ) : (
                <Box
                  sx={{
                    height: { xs: 260, md: 420 },
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#64748b",
                    bgcolor: "#ffffff",
                    borderRadius: 2,
                  }}
                >
                  <Typography>
                    Map inactive — click Enable Location to show live position.
                  </Typography>
                </Box>
              )}
            </Paper>

            {/* QR CARD */}
            <Paper
              sx={{
                p: 2,
                borderRadius: 3,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                ...cardStyle,
                boxShadow: 2,
              }}
            >
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar
                  sx={{
                    bgcolor: "#eef2ff",
                    color: "#3730a3",
                    width: 64,
                    height: 64,
                  }}
                >
                  <QrCode2Icon />
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ color: "#0f172a", fontWeight: 700 }}>
                    Live QR (Student Scan)
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#64748b" }}>
                    Students scan this to mark attendance.
                  </Typography>
                </Box>
              </Stack>

              <Stack alignItems="center" spacing={1}>
                <QRCodeCanvas value={qrCode || "loading"} size={120} />
                <LinearProgress
                  variant="determinate"
                  value={(expiresIn / 30) * 100}
                  sx={{ width: 140, mt: 1, bgcolor: "#f1f5f9" }}
                />
                <Typography variant="caption" sx={{ color: "#64748b" }}>
                  Refreshes in {expiresIn}s
                </Typography>
              </Stack>
            </Paper>
          </Stack>
        </Grid>

        {/* Right section: Summary + Period list */}
        <Grid item xs={12} md={4}>
          <Stack spacing={2}>
            {/* SUMMARY CARD */}
            <Paper sx={{ p: 2, borderRadius: 3, ...cardStyle, boxShadow: 2 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="caption" sx={{ color: "#64748b" }}>
                    Today
                  </Typography>
                  <Typography variant="h6" sx={{ color: "#0f172a", fontWeight: 700 }}>
                    {className || "Loading..."}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: "#eef2ff", color: "#3730a3" }}>
                  <ClassIcon />
                </Avatar>
              </Stack>

              <Divider sx={{ my: 2, borderColor: "rgba(15,23,42,0.06)" }} />

              <Grid container spacing={1}>
                <Grid item xs={6}>
                  <Paper sx={{ p: 1, textAlign: "center", borderRadius: 2, background: "#f8fafc" }}>
                    <Typography variant="caption" sx={{ color: "#64748b" }}>
                      Periods
                    </Typography>
                    <Typography sx={{ fontWeight: 700, color: "#0f172a" }}>
                      {periods.length}
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </Paper>

            {/* PERIOD LIST CARD */}
            <Paper
              sx={{
                p: 2,
                borderRadius: 3,
                maxHeight: 520,
                overflowY: "auto",
                ...cardStyle,
                boxShadow: 2,
              }}
            >
              <Typography sx={{ color: "#0f172a", fontWeight: 700, mb: 1 }}>
                Periods
              </Typography>

              <Stack spacing={2}>
                {periods.length === 0 ? (
                  <Typography sx={{ color: "#64748b" }}>No periods scheduled today.</Typography>
                ) : (
                  periods.map((p, idx) => (
                    <Paper
                      key={idx}
                      sx={{
                        p: 2,
                        borderRadius: 3,
                        backgroundColor: "#f8fafc",
                        border: "1px solid rgba(15,23,42,0.04)",
                      }}
                    >
                      <Typography sx={{ fontWeight: 700, color: "#0f172a" }}>
                        Period {p.period}: {p.subject}
                      </Typography>
                      <Typography sx={{ color: "#64748b", fontSize: "0.8rem" }}>
                        {p.start} - {p.end}
                      </Typography>

                      <Divider sx={{ my: 1 }} />

                      <Stack direction="row" spacing={2}>
                        <Chip
                          label={`Present: ${p.presentCount}`}
                          sx={{
                            bgcolor: "rgba(16,185,129,0.12)",
                            color: "#10b981",
                            fontWeight: 700,
                          }}
                        />
                        <Chip
                          label={`Absent: ${p.absentCount}`}
                          sx={{
                            bgcolor: "rgba(239,68,68,0.12)",
                            color: "#ef4444",
                            fontWeight: 700,
                          }}
                        />
                      </Stack>

                      {/* Present Students */}
                      <Typography sx={{ mt: 1, color: "#0f172a", fontWeight: 600 }}>
                        Present Students
                      </Typography>
                      <Stack spacing={1}>
                        {p.presentStudents.length === 0 ? (
                          <Typography sx={{ fontSize: "0.8rem", color: "#64748b" }}>
                            No one present
                          </Typography>
                        ) : (
                          p.presentStudents.map((std, i2) => (
                            <Typography key={i2} sx={{ fontSize: "0.85rem" }}>
                              • {std.name} {std.roll && `(${std.roll})`}
                            </Typography>
                          ))
                        )}
                      </Stack>

                      {/* Absent Students */}
                      <Typography sx={{ mt: 1.5, color: "#0f172a", fontWeight: 600 }}>
                        Absent Students
                      </Typography>
                      <Stack spacing={1}>
                        {p.absentStudents.length === 0 ? (
                          <Typography sx={{ fontSize: "0.8rem", color: "#64748b" }}>
                            No one absent
                          </Typography>
                        ) : (
                          p.absentStudents.map((std, i3) => (
                            <Typography key={i3} sx={{ fontSize: "0.85rem" }}>
                              • {std.name} {std.roll && `(${std.roll})`}
                            </Typography>
                          ))
                        )}
                      </Stack>
                    </Paper>
                  ))
                )}
              </Stack>
            </Paper>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
}


