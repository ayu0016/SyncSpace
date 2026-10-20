import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setActiveWidget, toggleTodo } from "../store/uiSlice";

// logout → clears state.auth.status and state.auth.userData
import { logout } from "../store/authSlice";

// ── Supabase auth service → signs out the Supabase session ──
import { authService } from "../supabase/auth";

export default function Navbar() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // ── Read user data from Redux auth state ──
  const userData = useSelector((state) => state.auth.userData);
  const isTodoOpen = useSelector((state) => state.ui.isTodoOpen);
  const isDesktopTodoOpen = useSelector((state) => state.ui.isDesktopTodoOpen ?? true);
  const activeTodoCount = useSelector((state) =>
    state.todos?.todos ? state.todos.todos.filter((t) => !t.completed).length : 0
  );

  const username =
    userData?.user_metadata?.full_name ||
    userData?.user_metadata?.name ||
    userData?.email?.split("@")[0] ||
    "User";

  // ── Derive initials from username for the avatar circle ──
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
    dispatch(setActiveWidget(null));
  }

  // ── Add New Tracker button → tracker creation page ──
  function handleAddTracker() {
    navigate("/add-tracker");
  }

  // ── Profile → navigate to /profile page ──
  function handleProfile() {
    setDropdownOpen(false);
    navigate("/profile");
  }

  async function handleLogout() {
    setDropdownOpen(false);
    await authService.logout();
    dispatch(logout());
    navigate("/");
  }

  return (
    <nav className="navbar-glass sticky top-0 left-0 right-0 z-50 w-full h-13 flex items-center px-4 sm:px-6 justify-between bg-[#1b1b20]/80 backdrop-blur-xl border-b border-white/5 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] font-sans">
      {/* ── LEFT: SyncSpace Logo ── */}
      <button
        onClick={handleLogoClick}
        className="flex flex-col items-start group focus:outline-none shrink-0 cursor-pointer"
      >
        <span
          className="text-primary-container font-bold text-2xl tracking-wide leading-none glow-text font-sans"
        >
          SyncSpace
        </span>
        {/* Blue underline accent — brightens on hover */}
        <span className="mt-1 h-px w-12 bg-primary-container mx-auto" />
      </button>

      {/* ── CENTER: Welcome message ── */}
      <p
        className="hidden sm:block text-sm text-white/60
          absolute left-1/2 -translate-x-1/2
          select-none pointer-events-none whitespace-nowrap font-sans"
      >
        Welcome back,{" "}
        <span className="text-primary-container font-semibold">{username}!</span>
      </p>

      {/* ── RIGHT: Todo Toggle + Add Tracker button + Avatar dropdown ── */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Todo Toggle button */}
        <button
          onClick={() => dispatch(toggleTodo())}
          className={`flex items-center gap-2 px-3 sm:px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200 focus:outline-none cursor-pointer active:scale-95 font-sans ${
            isDesktopTodoOpen || isTodoOpen
              ? "bg-[#4a9eed]/15 border border-[#4a9eed]/60 text-[#4a9eed] shadow-[0_0_12px_rgba(74,158,237,0.2)]"
              : "border border-white/10 text-white/60 hover:text-white hover:border-white/20 hover:bg-white/5"
          }`}
          title={isDesktopTodoOpen ? "Hide Tasks Panel" : "Show Tasks Panel"}
        >
          <svg width="16" height="16" viewBox="0 0 18 18" fill="none" className="shrink-0">
            <rect x="2" y="3" width="14" height="12" rx="2" stroke="currentColor" strokeWidth="1.4"/>
            <path d="M5 7h8M5 11h5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
          </svg>
          <span className="hidden sm:inline">Tasks</span>
          {activeTodoCount > 0 && (
            <span className="min-w-4.5 h-4.5 px-1 rounded-full bg-[#4a9eed] text-[#0a0a0f] text-[10px] font-black flex items-center justify-center shrink-0 font-mono">
              {activeTodoCount > 9 ? "9+" : activeTodoCount}
            </span>
          )}
        </button>

        {/* Add New Tracker button */}
        <button
          onClick={handleAddTracker}
          className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg
            border border-[#4a9eed]/50 text-[#4a9eed] text-sm font-medium
            hover:bg-[#4a9eed]/10 hover:border-[#4a9eed]
            active:scale-95 transition-all duration-200 focus:outline-none cursor-pointer font-sans"
        >
          <span className="text-base leading-none font-bold">+</span>
          <span className="hidden sm:inline">Add New Tracker</span>
        </button>

        {/* ── Avatar circle + Dropdown ── */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen((prev) => !prev)}
            className="w-9 h-9 rounded-full flex items-center justify-center
              border border-[#4a9eed]/60 bg-white/5 backdrop-blur-sm
              text-white text-sm font-semibold
              hover:border-[#4a9eed] hover:bg-white/10
              active:scale-95 transition-all duration-200
              select-none focus:outline-none cursor-pointer font-sans"
          >
            {initials}
          </button>

          {dropdownOpen && (
            <div
              className="absolute right-0 mt-2 w-40 rounded-xl overflow-hidden
                border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)] font-sans"
              style={{
                background: "rgba(15, 15, 25, 0.85)",
                WebkitBackdropFilter: "blur(16px)",
                backdropFilter: "blur(16px)",
              }}
            >
              <button
                onClick={handleProfile}
                className="w-full text-left px-4 py-3 text-sm text-white/80
                  hover:bg-white/10 hover:text-white
                  transition-colors duration-150 focus:outline-none cursor-pointer"
              >
                👤 Profile
              </button>

              <div className="h-px bg-white/10 mx-3" />

              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-3 text-sm text-red-400
                  hover:bg-red-500/10 hover:text-red-300
                  transition-colors duration-150 focus:outline-none cursor-pointer"
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
