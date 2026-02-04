import { useState, useEffect } from "react";
import { Settings as SettingsIcon, User, Lock, Save, Wifi, Upload, Trash2, AlertCircle } from "lucide-react";

export default function AdminSettings() {
  const [profile, setProfile] = useState({ name: "", email: "" });
  const [password, setPassword] = useState({ old: "", new: "" });
  const [fingerprints, setFingerprints] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");
  const token = localStorage.getItem("token");

  useEffect(() => {
    loadFingerprints();
  }, []);

  const loadFingerprints = async () => {
    try {
      const res = await fetch("https://smart-face-attendance-mfkt.onrender.com/api/admin/wifi-fingerprints", {
        headers: { Authorization: "Bearer " + token },
      });
      const data = await res.json();
      if (data.success) {
        setFingerprints(data.fingerprints);
      }
    } catch (err) {
      console.error("Load fingerprints error:", err);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      setUploading(true);
      setUploadStatus("");

      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const jsonData = JSON.parse(e.target.result);
          
          const res = await fetch("https://smart-face-attendance-mfkt.onrender.com/api/admin/wifi-fingerprints/upload", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer " + token,
            },
            body: JSON.stringify(jsonData),
          });

          const data = await res.json();
          if (data.success) {
            setUploadStatus(`✅ ${data.message}`);
            loadFingerprints();
          } else {
            setUploadStatus(`❌ ${data.message}`);
          }
        } catch (err) {
          setUploadStatus(`❌ Upload failed: ${err.message}`);
        } finally {
          setUploading(false);
        }
      };
      reader.readAsText(file);
    } catch (err) {
      setUploadStatus(`❌ Error reading file: ${err.message}`);
      setUploading(false);
    }
  };

  const deleteFingerprint = async (roomId) => {
    if (!window.confirm(`Delete fingerprint for ${roomId}?`)) return;

    try {
      const res = await fetch(`https://smart-face-attendance-mfkt.onrender.com/api/admin/wifi-fingerprints/${roomId}`, {
        method: "DELETE",
        headers: { Authorization: "Bearer " + token },
      });
      const data = await res.json();
      if (data.success) {
        setUploadStatus(`✅ ${data.message}`);
        loadFingerprints();
      }
    } catch (err) {
      setUploadStatus(`❌ Delete failed: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-700 via-slate-800 to-slate-900 shadow-xl px-6 py-8 text-white">
        <div className="absolute inset-0 bg-grid-white/[0.03] bg-[size:20px_20px]" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-slate-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
              <SettingsIcon className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-3xl font-bold">Admin Settings</h2>
              <p className="text-slate-300 text-sm mt-1">Manage your account and preferences</p>
            </div>
          </div>
        </div>
      </div>

      {/* WiFi Fingerprint Training Section */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200/60 overflow-hidden">
        <div className="bg-gradient-to-r from-slate-50 to-white px-6 py-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Wifi className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">WiFi Fingerprint Management</h3>
              <p className="text-sm text-slate-600">Upload classroom WiFi fingerprints for location verification</p>
            </div>
          </div>
        </div>
        <div className="p-6 space-y-4">
          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-900">
                <p className="font-semibold mb-2">How to train WiFi fingerprints:</p>
                <ol className="list-decimal list-inside space-y-1 text-blue-800">
                  <li>Run <code className="bg-blue-100 px-1 rounded">python wifi_fingerprint_trainer.py</code> in project root</li>
                  <li>Enter classroom ID (e.g., CSE-201)</li>
                  <li>Wait for scanning to complete (20-30 scans recommended)</li>
                  <li>Upload the generated JSON file below</li>
                  <li>Minimum 3 access points required for accuracy</li>
                </ol>
              </div>
            </div>
          </div>

          {/* Upload Section */}
          <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center">
            <input
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="hidden"
              id="wifi-upload"
              disabled={uploading}
            />
            <label
              htmlFor="wifi-upload"
              className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 cursor-pointer transition-colors disabled:opacity-50"
            >
              <Upload className="w-5 h-5" />
              {uploading ? "Uploading..." : "Upload Fingerprint JSON"}
            </label>
            {uploadStatus && (
              <p className="mt-3 text-sm font-medium">{uploadStatus}</p>
            )}
          </div>

          {/* Fingerprints List */}
          {fingerprints.length > 0 && (
            <div>
              <h4 className="font-semibold text-slate-800 mb-3">Uploaded Fingerprints</h4>
              <div className="space-y-2">
                {fingerprints.map((fp) => (
                  <div
                    key={fp.roomId}
                    className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200"
                  >
                    <div>
                      <p className="font-medium text-slate-800">{fp.roomId}</p>
                      <p className="text-sm text-slate-600">
                        {fp.numAPs} APs | Updated: {new Date(fp.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={() => deleteFingerprint(fp.roomId)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete fingerprint"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Profile Section */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200/60 overflow-hidden">
        <div className="bg-gradient-to-r from-slate-50 to-white px-6 py-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <User className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">Update Profile</h3>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name</label>
            <input
              type="text"
              placeholder="Enter your full name"
              className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={profile.email}
              onChange={(e) => setProfile({ ...profile, email: e.target.value })}
            />
          </div>
          <button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 font-medium shadow-lg transition-all duration-200 flex items-center justify-center gap-2">
            <Save className="w-4 h-4" /> Save Changes
          </button>
        </div>
      </div>

      {/* Password Section */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200/60 overflow-hidden">
        <div className="bg-gradient-to-r from-slate-50 to-white px-6 py-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <Lock className="w-5 h-5 text-red-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">Change Password</h3>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Old Password</label>
            <input
              type="password"
              placeholder="Enter current password"
              className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              value={password.old}
              onChange={(e) => setPassword({ ...password, old: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">New Password</label>
            <input
              type="password"
              placeholder="Enter new password"
              className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              value={password.new}
              onChange={(e) => setPassword({ ...password, new: e.target.value })}
            />
          </div>
          <button className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white py-3 rounded-xl hover:from-red-700 hover:to-red-800 font-medium shadow-lg transition-all duration-200 flex items-center justify-center gap-2">
            <Lock className="w-4 h-4" /> Update Password
          </button>
        </div>
      </div>
    </div>
  );
}


