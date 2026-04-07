import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

// ── Redux actions ──
// openModal("addWidget") → triggers the add-widget modal via uiSlice
import { openModal } from "../store/uiSlice";

// logout → clears state.auth.status and state.auth.userData
import { logout } from "../store/authSlice";

// ── Supabase auth service → signs out the Supabase session ──
import { authService } from "../supabase/auth";

export default function Navbar() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // ── Read user data from Redux auth state ──
  // authSlice stores the Supabase user object in state.auth.userData
  // after a successful login() dispatch.
  //
  // Username priority:
  //   1. full_name  → set by Google OAuth
  //   2. name       → set by some OAuth providers
  //   3. email prefix → e.g. "ayush@gmail.com" → "ayush"
  //   4. "User"     → absolute fallback
  const userData = useSelector((state) => state.auth.userData);
  const username =
    userData?.user_metadata?.full_name ||
    userData?.user_metadata?.name ||
    userData?.email?.split("@")[0] ||
    "User";

  // ── Derive initials from username for the avatar circle ──
  // "Ayush Kumar" → "AK" | "Ayush" → "AY" | "User" → "US"
  const initials = username
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  // ── Local UI state: controls avatar dropdown visibility ──
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // ── Close dropdown when clicking anywhere outside the avatar area ──
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ── Logo click → navigate to dashboard ──
  function handleLogoClick() {
    navigate("/dashboard");
  }

  // ── Add New Tracker button → open add-widget modal ──
  // uiSlice.modalType will be set to "addWidget"
  // Your modal renderer should check: modalType === "addWidget"
  function handleAddTracker() {
    navigate('/add-tracker')
  }
  // ── Profile → navigate to /profile page ──
  // 📌 ROUTE CHECK: make sure /profile exists in your router
  function handleProfile() {
    setDropdownOpen(false);
    navigate("/profile");
  }

  async function handleLogout() {
    setDropdownOpen(false);
    await authService.signOut();     // clears Supabase session
    dispatch(logout());              // clears Redux auth state
    navigate("/");                   // redirect to landing
  }

  return (
    <nav 
    className="navbar-glass sticky top-0 left-0 right-0 z-50 w-full h-13 flex items-center px-4 sm:px-6 justify-between bg-[#1b1b20]/80 backdrop-blur-xl border-b border-white/5 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)]"
    >

      {/* ── LEFT: SyncSpace Logo ── */}
      <button
        onClick={handleLogoClick}
        className="flex flex-col items-start group focus:outline-none shrink-0 "
      >
        <span
          className="text-primary-container font-bold text-2xl tracking-wide leading-none glow-text"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          SyncSpace
        </span>
        {/* Blue underline accent — brightens on hover */}
        <span
         className="mt-1 h-px w-12 bg-primary-container mx-auto"

        />
                  
      </button>

      {/* ── CENTER: Welcome message ──
          Hidden on mobile (hidden) → visible from sm breakpoint (sm:block)
          Absolutely centered so it doesn't affect flex layout */}
      <p
        className="hidden sm:block text-sm text-white/60
          absolute left-1/2 -translate-x-1/2
          select-none pointer-events-none whitespace-nowrap"
        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
      >
        Welcome back,{" "}
        <span className="text-primary-container font-semibold">{username}!</span>
      </p>

      {/* ── RIGHT: Add Tracker button + Avatar dropdown ── */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">

        {/* Add New Tracker button
            On mobile: shows only "+" icon (text hidden)
            On sm+: shows full "Add New Tracker" text */}
        <button
          onClick={handleAddTracker}
          className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg
            border border-[#4a9eed]/50 text-[#4a9eed] text-sm font-medium
            hover:bg-[#4a9eed]/10 hover:border-[#4a9eed]
            active:scale-95 transition-all duration-200 focus:outline-none"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          {/* "+" always visible */}
          <span className="text-base leading-none font-bold">+</span>
          {/* Text hidden on mobile, shown on sm+ */}
          <span className="hidden sm:inline">Add New Tracker</span>
        </button>

        {/* ── Avatar circle + Dropdown ── */}
        <div className="relative" ref={dropdownRef}>

          {/* Avatar button — shows user initials */}
          <button
            onClick={() => setDropdownOpen((prev) => !prev)}
            className="w-9 h-9 rounded-full flex items-center justify-center
              border border-[#4a9eed]/60 bg-white/5 backdrop-blur-sm
              text-white text-sm font-semibold
              hover:border-[#4a9eed] hover:bg-white/10
              active:scale-95 transition-all duration-200
              select-none focus:outline-none"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            {initials}
          </button>

          {/* Dropdown — renders only when dropdownOpen is true */}
          {dropdownOpen && (
            <div
              className="absolute right-0 mt-2 w-40 rounded-xl overflow-hidden
                border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
              style={{
                background: "rgba(15, 15, 25, 0.85)",
                WebkitBackdropFilter: "blur(16px)",
                backdropFilter: "blur(16px)",
              }}
            >
              {/* Profile */}
              <button
                onClick={handleProfile}
                className="w-full text-left px-4 py-3 text-sm text-white/80
                  hover:bg-white/10 hover:text-white
                  transition-colors duration-150 focus:outline-none"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                👤 Profile
              </button>

              {/* Divider */}
              <div className="h-px bg-white/10 mx-3" />

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-3 text-sm text-red-400
                  hover:bg-red-500/10 hover:text-red-300
                  transition-colors duration-150 focus:outline-none"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                🚪 Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}