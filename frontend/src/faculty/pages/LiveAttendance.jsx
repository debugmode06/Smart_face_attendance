// src/faculty/pages/LiveAttendance.jsx
import { useState, useEffect } from "react";
import {
  Clock,
  Users,
  Play,
  CheckCircle,
  XCircle,
  Download,
  Plus,
  AlertCircle,
  Wifi,
  Camera,
} from "lucide-react";

export default function LiveAttendance() {
  const [activeSession, setActiveSession] = useState(null);
  const [loading, setLoading] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [showStartForm, setShowStartForm] = useState(false);
  const [facultyProfile, setFacultyProfile] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    className: "",
    subject: "",
    period: "",
    startTime: "",
    endTime: "",
    timeLimit: 10, // default 10 minutes
  });

  const [extendMinutes, setExtendMinutes] = useState(5);

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  // Fetch faculty profile for auto-population
  const fetchFacultyProfile = async () => {
    try {
      const res = await fetch("https://smart-face-attendance-mfkt.onrender.com/api/faculty/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setFacultyProfile(data);
        // Auto-populate subject and class
        if (data.subject) {
          setFormData(prev => ({ ...prev, subject: data.subject }));
        }
        if (data.className) {
          setFormData(prev => ({ ...prev, className: data.className }));
        }
      }
    } catch (error) {
      console.error("Error fetching faculty profile:", error);
    }
  };

  // Auto-populate current time and calculate end time
  const autoPopulateTime = () => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const startTime = `${hours}:${minutes}`;
    
    setFormData(prev => {
      const endTime = calculateEndTime(startTime, prev.timeLimit);
      return { ...prev, startTime, endTime };
    });
  };

  // Calculate end time based on start time + time limit
  const calculateEndTime = (start, limitMinutes) => {
    if (!start || !limitMinutes) return "";
    const [hours, minutes] = start.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes + parseInt(limitMinutes));
    return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  };

  // Update end time when start time or time limit changes
  useEffect(() => {
    if (formData.startTime && formData.timeLimit) {
      const endTime = calculateEndTime(formData.startTime, formData.timeLimit);
      setFormData(prev => ({ ...prev, endTime }));
    }
  }, [formData.startTime, formData.timeLimit]);

  // Fetch active session
  const fetchActiveSession = async () => {
    try {
      const res = await fetch("https://smart-face-attendance-mfkt.onrender.com/api/attendance-session/faculty/active", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setActiveSession(data.session);
        setShowStartForm(false);
      } else {
        setActiveSession(null);
        setShowStartForm(true);
      }
    } catch (error) {
      console.error("Error fetching active session:", error);
    }
  };

  // Start new session
  const handleStartSession = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("https://smart-face-attendance-mfkt.onrender.com/api/attendance-session/faculty/start", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        alert("Attendance session started successfully!");
        fetchActiveSession();
        setFormData({
          className: "",
          subject: "",
          period: "",
          startTime: "",
          endTime: "",
          timeLimit: 10,
        });
      } else {
        alert(data.message || "Failed to start session");
      }
    } catch (error) {
      console.error("Error starting session:", error);
      alert("Error starting session");
    } finally {
      setLoading(false);
    }
  };

  // Extend time
  const handleExtendTime = async () => {
    if (!extendMinutes || extendMinutes < 1) {
      alert("Please enter valid minutes");
      return;
    }

    try {
      const res = await fetch("https://smart-face-attendance-mfkt.onrender.com/api/attendance-session/faculty/extend-time", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          sessionId: activeSession._id,
          additionalMinutes: parseInt(extendMinutes),
        }),
      });

      const data = await res.json();

      if (res.ok) {
        alert(`Time extended by ${extendMinutes} minutes`);
        fetchActiveSession();
      } else {
        alert(data.message || "Failed to extend time");
      }
    } catch (error) {
      console.error("Error extending time:", error);
      alert("Error extending time");
    }
  };

  // Confirm session
  const handleConfirmSession = async () => {
    const confirmed = window.confirm(
      "Are you sure? All remaining students will be marked absent."
    );

    if (!confirmed) return;

    try {
      const res = await fetch("https://smart-face-attendance-mfkt.onrender.com/api/attendance-session/faculty/confirm", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ sessionId: activeSession._id }),
      });

      const data = await res.json();

      if (res.ok) {
        alert("Session confirmed and completed!");
        fetchActiveSession();
      } else {
        alert(data.message || "Failed to confirm session");
      }
    } catch (error) {
      console.error("Error confirming session:", error);
      alert("Error confirming session");
    }
  };

  // Download Excel
  const handleDownloadExcel = async () => {
    try {
      const res = await fetch(
        `https://smart-face-attendance-mfkt.onrender.com/api/attendance-session/faculty/excel/${activeSession._id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `Attendance_${activeSession.className}_${activeSession.subject}_${new Date(activeSession.date).toISOString().split("T")[0]}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        alert("Failed to download Excel");
      }
    } catch (error) {
      console.error("Error downloading Excel:", error);
      alert("Error downloading Excel");
    }
  };

  // Update countdown timer
  useEffect(() => {
    if (activeSession && activeSession.status === "active") {
      const interval = setInterval(() => {
        const remaining = Math.max(
          0,
          Math.floor((new Date(activeSession.expiresAt) - new Date()) / 1000)
        );
        setTimeRemaining(remaining);

        if (remaining === 0) {
          fetchActiveSession(); // Refresh to get expired status
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [activeSession]);

  // Initial fetch
  useEffect(() => {
    fetchFacultyProfile(); // Fetch profile for auto-population
    fetchActiveSession();
    const interval = setInterval(fetchActiveSession, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, []);

  // Format time
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6 mb-4 sm:mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Live Attendance System</h1>
          <p className="text-sm sm:text-base text-gray-600">Real-time attendance marking with WiFi and Face verification</p>
        </div>

        {/* Start Session Form */}
        {showStartForm && !activeSession && (
          <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6 mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Play className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              Start Attendance Session
            </h2>

            <form onSubmit={handleStartSession} className="space-y-4">
              {/* Auto-fill Button */}
              <div className="flex justify-end mb-4">
                <button
                  type="button"
                  onClick={autoPopulateTime}
                  className="px-3 py-2 sm:px-4 sm:py-2 bg-green-600 hover:bg-green-700 text-white text-xs sm:text-sm font-semibold rounded-lg flex items-center gap-2"
                >
                  <Clock className="w-4 h-4" />
                  <span className="hidden sm:inline">Auto-Fill Current Time</span>
                  <span className="sm:hidden">Auto-Fill</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Class Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.className}
                    onChange={(e) => setFormData({ ...formData, className: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., CSE A"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                  <input
                    type="text"
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Data Structures"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Period</label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="8"
                    value={formData.period}
                    onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="1-8"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Time Limit (minutes)
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="60"
                    value={formData.timeLimit}
                    onChange={(e) => setFormData({ ...formData, timeLimit: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="10"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Time
                  </label>
                  <input
                    type="time"
                    required
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">End Time</label>
                  <input
                    type="time"
                    required
                    value={formData.endTime}
                    readOnly
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Auto-calculated"
                  />
                  <p className="text-xs text-gray-500 mt-1">Auto-calculated from start time + time limit</p>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Play className="w-5 h-5" />
                {loading ? "Starting..." : "Start Attendance Session"}
              </button>
            </form>
          </div>
        )}

        {/* Active Session Display */}
        {activeSession && (
          <>
            {/* Session Info & Timer */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-4 sm:mb-6">
              {/* Session Details */}
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg p-4 sm:p-6 text-white">
                <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Session Details</h3>
                <div className="space-y-2 text-xs sm:text-sm">
                  <p><strong>Class:</strong> {activeSession.className}</p>
                  <p><strong>Subject:</strong> {activeSession.subject}</p>
                  <p><strong>Period:</strong> {activeSession.period}</p>
                  <p><strong>Time:</strong> {activeSession.startTime} - {activeSession.endTime}</p>
                  <p><strong>Day:</strong> {activeSession.day}</p>
                  <p><strong>Date:</strong> {new Date(activeSession.date).toLocaleDateString()}</p>
                </div>
              </div>

              {/* Live Timer */}
              <div className={`rounded-2xl shadow-lg p-4 sm:p-6 text-white ${
                activeSession.status === "expired" || timeRemaining === 0
                  ? "bg-gradient-to-br from-red-500 to-red-600"
                  : timeRemaining < 120
                  ? "bg-gradient-to-br from-amber-500 to-amber-600"
                  : "bg-gradient-to-br from-green-500 to-green-600"
              }`}>
                <h3 className="text-base sm:text-lg font-semibold mb-2 flex items-center gap-2">
                  <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
                  Time Remaining
                </h3>
                <div className="text-4xl sm:text-5xl font-bold text-center my-3 sm:my-4">
                  {formatTime(timeRemaining)}
                </div>
                <p className="text-center text-sm opacity-90">
                  {activeSession.status === "expired" || timeRemaining === 0
                    ? "Session Expired"
                    : timeRemaining < 120
                    ? "Hurry! Time running out"
                    : "Students can mark attendance"}
                </p>
              </div>

              {/* Statistics */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-gray-700" />
                  Statistics
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Students</span>
                    <span className="font-bold text-xl">{activeSession.totalStudents}</span>
                  </div>
                  <div className="flex justify-between items-center text-green-600">
                    <span>Present</span>
                    <span className="font-bold text-xl">{activeSession.presentCount}</span>
                  </div>
                  <div className="flex justify-between items-center text-amber-600">
                    <span>Late</span>
                    <span className="font-bold text-xl">{activeSession.lateCount}</span>
                  </div>
                  <div className="flex justify-between items-center text-red-600">
                    <span>Absent</span>
                    <span className="font-bold text-xl">{activeSession.absentCount}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            {activeSession.status !== "confirmed" && activeSession.status !== "completed" && (
              <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
                <div className="flex flex-wrap gap-4">
                  {/* Extend Time */}
                  <div className="flex-1 min-w-[250px]">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Add Excuse Time (minutes)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        min="1"
                        max="30"
                        value={extendMinutes}
                        onChange={(e) => setExtendMinutes(e.target.value)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="5"
                      />
                      <button
                        onClick={handleExtendTime}
                        className="px-6 py-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-lg flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Extend
                      </button>
                    </div>
                  </div>

                  {/* Confirm Button */}
                  <button
                    onClick={handleConfirmSession}
                    className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg flex items-center gap-2"
                  >
                    <CheckCircle className="w-5 h-5" />
                    Confirm & Complete
                  </button>

                  {/* Download Excel */}
                  {activeSession.status === "confirmed" && (
                    <button
                      onClick={handleDownloadExcel}
                      className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg flex items-center gap-2"
                    >
                      <Download className="w-5 h-5" />
                      Download Excel
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Download Button for Confirmed Sessions */}
            {(activeSession.status === "confirmed" || activeSession.status === "completed") && (
              <div className="bg-green-50 border border-green-200 rounded-2xl p-6 mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                    <div>
                      <h3 className="text-lg font-semibold text-green-900">Session Completed</h3>
                      <p className="text-sm text-green-700">
                        Attendance has been recorded for all students
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleDownloadExcel}
                    className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg flex items-center gap-2"
                  >
                    <Download className="w-5 h-5" />
                    Download Excel Report
                  </button>
                </div>
              </div>
            )}

            {/* Student List */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Student Attendance Status</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                        #
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                        Name
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                        Register No
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                        Timestamp
                      </th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                        WiFi
                      </th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                        Face
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {activeSession.studentsMarked.map((student, index) => (
                      <tr key={student.studentId} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-700">{index + 1}</td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          {student.studentName}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          {student.registerNo}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              student.status === "present"
                                ? "bg-green-100 text-green-700"
                                : student.status === "late"
                                ? "bg-amber-100 text-amber-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {student.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {student.markedAt
                            ? new Date(student.markedAt).toLocaleTimeString()
                            : "N/A"}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {student.wifiVerified ? (
                            <Wifi className="w-5 h-5 text-green-600 mx-auto" />
                          ) : (
                            <XCircle className="w-5 h-5 text-gray-300 mx-auto" />
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {student.faceVerified ? (
                            <Camera className="w-5 h-5 text-green-600 mx-auto" />
                          ) : (
                            <XCircle className="w-5 h-5 text-gray-300 mx-auto" />
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}


