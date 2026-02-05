import { useState, useEffect } from "react";
import FaceScanModal from "../../components/FaceScanModal";
import { CheckCircle, Clock, Wifi, MapPin, QrCode, Camera, AlertCircle, CheckSquare } from "lucide-react";

export default function AttendanceNew() {
  const [activeSession, setActiveSession] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [statusMsg, setStatusMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [showFaceModal, setShowFaceModal] = useState(false);
  const [faceVerified, setFaceVerified] = useState(false);
  const [attendanceMarked, setAttendanceMarked] = useState(false);

  const token = localStorage.getItem("token");

  // Fetch active attendance session
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
          
          // Check if already marked
          if (data.studentRecord && data.studentRecord.status === "present") {
            setAttendanceMarked(true);
            setFaceVerified(true);
          }
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
    const interval = setInterval(fetchActiveSession, 10000);
    return () => clearInterval(interval);
  }, [token]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleMarkAttendance = () => {
    if (attendanceMarked) {
      setStatusMsg("Attendance already marked ✓");
      return;
    }
    
    // Open face scan modal
    setShowFaceModal(true);
  };

  const handleFaceVerified = () => {
    setFaceVerified(true);
    setAttendanceMarked(true);
    setStatusMsg("Attendance marked successfully ✓");
    setShowFaceModal(false);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f5f7fa' }}>
      <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
        
        {/* Hero Header - iOS Style */}
        <div 
          className="rounded-3xl p-8 relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            boxShadow: '0 20px 60px rgba(102, 126, 234, 0.3)'
          }}
        >
          <div className="absolute top-0 right-0 w-40 h-40 rounded-full"
               style={{ background: 'rgba(255, 255, 255, 0.1)', transform: 'translate(30%, -30%)' }} />
          <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full"
               style={{ background: 'rgba(255, 255, 255, 0.08)', transform: 'translate(-20%, 20%)' }} />
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                   style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', backdropFilter: 'blur(10px)' }}>
                <CheckSquare className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white" style={{ letterSpacing: '-0.5px' }}>
                  Attendance
                </h1>
                <p className="text-white/80 text-sm font-medium">
                  Face Recognition System
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Status Message */}
        {statusMsg && (
          <div 
            className="rounded-2xl p-4 flex items-center gap-3"
            style={{
              backgroundColor: attendanceMarked ? '#e6f7ed' : '#e3f2fd',
              border: `2px solid ${attendanceMarked ? '#4caf50' : '#2196f3'}`,
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
            }}
          >
            <div className="w-8 h-8 rounded-full flex items-center justify-center"
                 style={{ backgroundColor: attendanceMarked ? '#4caf50' : '#2196f3' }}>
              <CheckCircle className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold" style={{ color: attendanceMarked ? '#2e7d32' : '#1976d2' }}>
              {statusMsg}
            </span>
          </div>
        )}

        {/* Session Card */}
        {activeSession ? (
          <div className="space-y-4">
            {/* Active Session Info */}
            <div 
              className="rounded-3xl p-6"
              style={{
                backgroundColor: '#ffffff',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
                border: '1px solid rgba(0, 0, 0, 0.05)'
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold" style={{ color: '#1a1a1a', letterSpacing: '-0.3px' }}>
                  Active Session
                </h2>
                {timeRemaining > 0 && (
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full"
                       style={{ backgroundColor: '#fff3e0', border: '1px solid #ffb74d' }}>
                    <Clock className="w-4 h-4" style={{ color: '#f57c00' }} />
                    <span className="font-bold text-sm" style={{ color: '#e65100' }}>
                      {formatTime(timeRemaining)}
                    </span>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center py-3 border-b" style={{ borderColor: '#f0f0f0' }}>
                  <span className="text-sm font-medium" style={{ color: '#757575' }}>Subject</span>
                  <span className="font-semibold" style={{ color: '#1a1a1a' }}>{activeSession.subject}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b" style={{ borderColor: '#f0f0f0' }}>
                  <span className="text-sm font-medium" style={{ color: '#757575' }}>Period</span>
                  <span className="font-semibold" style={{ color: '#1a1a1a' }}>{activeSession.period}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b" style={{ borderColor: '#f0f0f0' }}>
                  <span className="text-sm font-medium" style={{ color: '#757575' }}>Class</span>
                  <span className="font-semibold" style={{ color: '#1a1a1a' }}>{activeSession.className}</span>
                </div>
                <div className="flex justify-between items-center py-3">
                  <span className="text-sm font-medium" style={{ color: '#757575' }}>Time</span>
                  <span className="font-semibold" style={{ color: '#1a1a1a' }}>
                    {activeSession.startTime} - {activeSession.endTime}
                  </span>
                </div>
              </div>
            </div>

            {/* Mark Attendance Card */}
            <div 
              className="rounded-3xl p-8 text-center"
              style={{
                backgroundColor: '#ffffff',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
                border: '1px solid rgba(0, 0, 0, 0.05)'
              }}
            >
              {attendanceMarked ? (
                <div className="space-y-4">
                  <div className="w-20 h-20 rounded-full mx-auto flex items-center justify-center"
                       style={{ backgroundColor: '#e8f5e9' }}>
                    <CheckCircle className="w-10 h-10" style={{ color: '#4caf50' }} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold mb-2" style={{ color: '#2e7d32', letterSpacing: '-0.5px' }}>
                      Attendance Marked
                    </h3>
                    <p className="text-sm" style={{ color: '#757575' }}>
                      You have successfully marked your attendance for this session
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div>
                    <div className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center"
                         style={{ backgroundColor: '#e3f2fd' }}>
                      <Camera className="w-10 h-10" style={{ color: '#2196f3' }} />
                    </div>
                    <h3 className="text-2xl font-bold mb-2" style={{ color: '#1a1a1a', letterSpacing: '-0.5px' }}>
                      Mark Your Attendance
                    </h3>
                    <p className="text-sm mb-6" style={{ color: '#757575' }}>
                      Use face recognition to verify and mark your attendance
                    </p>
                  </div>

                  <button
                    onClick={handleMarkAttendance}
                    disabled={loading || timeRemaining === 0}
                    className="w-full py-4 rounded-2xl font-bold text-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      background: timeRemaining === 0 ? '#e0e0e0' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: '#ffffff',
                      boxShadow: timeRemaining === 0 ? 'none' : '0 8px 24px rgba(102, 126, 234, 0.4)',
                      transform: 'scale(1)',
                    }}
                    onMouseEnter={(e) => {
                      if (timeRemaining > 0) {
                        e.currentTarget.style.transform = 'scale(1.02)';
                        e.currentTarget.style.boxShadow = '0 12px 32px rgba(102, 126, 234, 0.5)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                      e.currentTarget.style.boxShadow = timeRemaining === 0 ? 'none' : '0 8px 24px rgba(102, 126, 234, 0.4)';
                    }}
                  >
                    {loading ? 'Processing...' : timeRemaining === 0 ? 'Session Expired' : 'Start Face Verification'}
                  </button>
                  
                  {timeRemaining === 0 && (
                    <div className="flex items-center justify-center gap-2 text-sm" style={{ color: '#f44336' }}>
                      <AlertCircle className="w-4 h-4" />
                      <span>Time limit expired for this session</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Verification Method Info */}
            <div 
              className="rounded-3xl p-6"
              style={{
                backgroundColor: '#ffffff',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
                border: '1px solid rgba(0, 0, 0, 0.05)'
              }}
            >
              <h3 className="text-lg font-bold mb-4" style={{ color: '#1a1a1a', letterSpacing: '-0.3px' }}>
                Verification Process
              </h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                       style={{ backgroundColor: '#e3f2fd' }}>
                    <Camera className="w-5 h-5" style={{ color: '#2196f3' }} />
                  </div>
                  <div>
                    <p className="font-semibold text-sm mb-1" style={{ color: '#1a1a1a' }}>Face Recognition</p>
                    <p className="text-xs" style={{ color: '#757575' }}>
                      Position your face in the camera frame for verification
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                       style={{ backgroundColor: '#e8f5e9' }}>
                    <CheckCircle className="w-5 h-5" style={{ color: '#4caf50' }} />
                  </div>
                  <div>
                    <p className="font-semibold text-sm mb-1" style={{ color: '#1a1a1a' }}>Auto Verification</p>
                    <p className="text-xs" style={{ color: '#757575' }}>
                      Your attendance will be marked automatically after successful face match
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* No Active Session */
          <div 
            className="rounded-3xl p-12 text-center"
            style={{
              backgroundColor: '#ffffff',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
              border: '1px solid rgba(0, 0, 0, 0.05)'
            }}
          >
            <div className="w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center"
                 style={{ backgroundColor: '#f5f5f5' }}>
              <Clock className="w-12 h-12" style={{ color: '#9e9e9e' }} />
            </div>
            <h3 className="text-2xl font-bold mb-3" style={{ color: '#1a1a1a', letterSpacing: '-0.5px' }}>
              No Active Session
            </h3>
            <p className="text-sm" style={{ color: '#757575', maxWidth: '400px', margin: '0 auto' }}>
              There is no active attendance session at the moment. Your faculty will start a session when it's time to mark attendance.
            </p>
          </div>
        )}
      </div>

      {/* Face Scan Modal */}
      {showFaceModal && (
        <FaceScanModal 
          onVerified={handleFaceVerified}
          onClose={() => setShowFaceModal(false)}
        />
      )}
    </div>
  );
}
