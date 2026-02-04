import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, LogOut, Bell, ChevronDown, MessageCircle, Settings, User } from "lucide-react";
import { useState, useEffect } from "react";

export default function DashboardLayout({ sidebarItems, title }) {
  const [open, setOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Detect mobile screen
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Get user info - Initialize once
  const [user, setUser] = useState(() => {
    const userData = localStorage.getItem('user');
    console.log('[DashboardLayout] Loading user from localStorage:', userData);
    const parsedUser = JSON.parse(userData || '{}');
    console.log('[DashboardLayout] Parsed user:', parsedUser);
    console.log('[DashboardLayout] User role:', parsedUser?.role);
    console.log('[DashboardLayout] Current path:', window.location.pathname);
    console.log('[DashboardLayout] Expected title:', title);
    return parsedUser;
  });
  
  // Profile form state
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    rollNo: user?.rollNo || '',
    department: user?.department || '',
    semester: user?.semester || ''
  });

  // Just the last part after /student/, /faculty/, /admin/
  const pathParts = location.pathname.split("/");
  const current = pathParts[pathParts.length - 1] || "dashboard";

  const handleLogout = () => {
    // Clear all auth data
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");

    navigate("/login");
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* DESKTOP SIDEBAR */}
      {!isMobile && (
        <div className="w-64 bg-white shadow-lg border-r border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-blue-600">
              {title}
            </h2>
          </div>

          <nav className="mt-4 px-3">
            {sidebarItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center px-4 py-3.5 text-sm font-medium rounded-xl mb-2 transition-all
                  ${
                    isActive
                      ? "bg-blue-500 text-white shadow-md"
                      : "text-gray-700 hover:bg-gray-100"
                  }`
                }
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      )}

      {/* MAIN AREA */}
      <div className="flex-1 flex flex-col">
        {/* TOP NAVBAR */}
        <header className="flex items-center justify-between bg-white shadow-sm px-4 sm:px-6 py-2.5 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <h1 className="text-lg sm:text-xl font-bold text-gray-800 capitalize">
              {current.replace("-", " ")}
            </h1>
          </div>

          {/* Right side - Notification + Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Notification Bell */}
            <button className="relative p-1.5 hover:bg-gray-100 rounded-full transition">
              <Bell className="w-5 h-5 text-gray-600" />
              <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {/* Profile Dropdown */}
            <div className="relative">
              <div 
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 px-2 py-1.5 rounded-lg transition"
              >
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                  {user?.name?.charAt(0) || 'U'}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-semibold text-gray-800">{user?.name || 'User'}</p>
                  <p className="text-xs text-gray-500">{user?.role || 'Role'}</p>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-600 hidden sm:block" />
              </div>

              {/* Profile Dropdown Menu */}
              {showProfileMenu && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setShowProfileMenu(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                    {/* Profile Header */}
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-semibold text-gray-800">{user?.name || 'User'}</p>
                      <p className="text-xs text-gray-500">{user?.email || 'user@example.com'}</p>
                    </div>

                    {/* Menu Items */}
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        setShowEditProfile(true);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition"
                    >
                      <User className="w-4 h-4" />
                      <span>Edit Profile</span>
                    </button>

                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        // Navigate to settings
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition"
                    >
                      <Settings className="w-4 h-4" />
                      <span>Settings</span>
                    </button>

                    <div className="border-t border-gray-100 mt-1 pt-1">
                      <button
                        onClick={() => {
                          setShowProfileMenu(false);
                          handleLogout();
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* CONTENT */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 pb-20 md:pb-6">
          <div className="max-w-full">
            <Outlet />
          </div>
        </main>

        {/* MOBILE BOTTOM NAV */}
        {isMobile && (
          <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
            <div className="flex justify-around items-center h-16">
              {sidebarItems.map((item) => {
                const isActive = location.pathname.includes(item.path);
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className="flex flex-col items-center justify-center flex-1 h-full transition-colors"
                  >
                    <item.icon 
                      className={`w-6 h-6 ${
                        isActive ? 'text-blue-500' : 'text-gray-500'
                      }`} 
                    />
                    <span 
                      className={`text-xs mt-1 font-medium ${
                        isActive ? 'text-blue-500' : 'text-gray-500'
                      }`}
                    >
                      {item.label}
                    </span>
                  </NavLink>
                );
              })}
            </div>
          </nav>
        )}

        {/* Floating Message Button */}
        <button
          onClick={() => setShowChat(!showChat)}
          className="fixed bottom-20 right-6 md:bottom-6 w-14 h-14 bg-blue-500 hover:bg-blue-600 rounded-full shadow-lg flex items-center justify-center z-50 transition-transform hover:scale-110"
        >
          <MessageCircle className="w-6 h-6 text-white" />
        </button>

        {/* Edit Profile Modal */}
        {showEditProfile && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowEditProfile(false)}>
            <div 
              className="bg-white w-full max-w-md rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-blue-500" />
                  </div>
                  <h3 className="text-white font-semibold text-lg">Edit Profile</h3>
                </div>
                <button 
                  onClick={() => setShowEditProfile(false)}
                  className="text-white hover:bg-white/20 rounded-full p-2 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Profile Form */}
              <div className="flex-1 overflow-y-auto p-6">
                {/* Profile Avatar */}
                <div className="flex flex-col items-center mb-6">
                  <div className="w-24 h-24 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-3xl mb-3">
                    {user?.name?.charAt(0) || 'U'}
                  </div>
                  <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                    Change Photo
                  </button>
                </div>

                {/* Form Fields */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      value={profileData.name}
                      onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {user?.role === 'student' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Roll Number</label>
                        <input
                          type="text"
                          value={profileData.rollNo}
                          onChange={(e) => setProfileData({...profileData, rollNo: e.target.value})}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                        <input
                          type="text"
                          value={profileData.department}
                          onChange={(e) => setProfileData({...profileData, department: e.target.value})}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
                        <input
                          type="text"
                          value={profileData.semester}
                          onChange={(e) => setProfileData({...profileData, semester: e.target.value})}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex gap-3">
                <button
                  onClick={() => setShowEditProfile(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-100 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    // Save profile logic here
                    const updatedUser = {...user, ...profileData};
                    localStorage.setItem('user', JSON.stringify(updatedUser));
                    setUser(updatedUser); // Update user state
                    setShowEditProfile(false);
                    // You can add API call here to update backend
                  }}
                  className="flex-1 px-4 py-2.5 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Chat Modal - iMessage Style */}
        {showChat && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center md:justify-center" onClick={() => setShowChat(false)}>
            <div 
              className="bg-white w-full md:w-96 md:rounded-2xl shadow-2xl flex flex-col" 
              style={{ height: isMobile ? '85vh' : '600px' }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Chat Header */}
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-4 flex items-center justify-between md:rounded-t-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                    <MessageCircle className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">Messages</h3>
                    <p className="text-white/80 text-xs">Faculty & Students</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowChat(false)}
                  className="text-white hover:bg-white/20 rounded-full p-2 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                <div className="space-y-4">
                  {/* Received Message */}
                  <div className="flex items-start gap-2">
                    <div className="w-8 h-8 bg-gray-300 rounded-full flex-shrink-0"></div>
                    <div>
                      <div className="bg-gray-200 rounded-2xl rounded-tl-sm px-4 py-2 max-w-xs">
                        <p className="text-sm text-gray-800">Hi! Don't forget about tomorrow's assignment deadline.</p>
                      </div>
                      <p className="text-xs text-gray-500 mt-1 ml-2">Faculty - 10:30 AM</p>
                    </div>
                  </div>

                  {/* Sent Message */}
                  <div className="flex items-start gap-2 justify-end">
                    <div>
                      <div className="bg-blue-500 rounded-2xl rounded-tr-sm px-4 py-2 max-w-xs">
                        <p className="text-sm text-white">Thank you! I'll submit it today.</p>
                      </div>
                      <p className="text-xs text-gray-500 mt-1 mr-2 text-right">10:32 AM</p>
                    </div>
                  </div>

                  {/* Received Message */}
                  <div className="flex items-start gap-2">
                    <div className="w-8 h-8 bg-emerald-300 rounded-full flex-shrink-0"></div>
                    <div>
                      <div className="bg-gray-200 rounded-2xl rounded-tl-sm px-4 py-2 max-w-xs">
                        <p className="text-sm text-gray-800">Can you share your notes from yesterday's class?</p>
                      </div>
                      <p className="text-xs text-gray-500 mt-1 ml-2">Student - 11:15 AM</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Chat Input */}
              <div className="p-4 bg-white border-t border-gray-200 md:rounded-b-2xl">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="iMessage"
                    className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center hover:bg-blue-600 transition">
                    <span className="text-white font-bold text-lg">↑</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

