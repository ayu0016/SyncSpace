import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  LayoutGrid, 
  Gamepad2, 
  Blocks, 
  User, 
  PlusCircle, 
  Rocket,
  ArrowRight,
  BarChart3,
  Dumbbell,
  BrainCircuit,
  Settings2,
  X
} from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.userData);

  useEffect(() => {
    if (user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  // Inject the custom font from Google Fonts to match your exact typography spec
  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white font-sans selection:bg-[#4a9eed] selection:text-white overflow-x-hidden relative">
      
      {/* ========================================================
        1. HERO SECTION 
        ========================================================
      */}
      <header className="max-w-[1440px] mx-auto px-4 sm:px-8 md:px-12 pt-10 sm:pt-16 md:pt-20 pb-10 sm:pb-15 md:pb-20">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          
          {/* Left Content */}
          <div className="w-full lg:w-[45%] flex flex-col items-start z-10">
            <div className="group relative inline-flex items-center gap-3 px-5 py-2 mb-6 rounded-full bg-[#1a1a20] border border-[#2d2d33] hover:border-[#4a9eed]/50 hover:bg-[#4a9eed]/5 hover:shadow-[0_0_15px_rgba(74,158,237,0.15)] transition-all duration-300 cursor-default">
              
              {/* Pulsing Live Dot */}
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#4a9eed] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#4a9eed]"></span>
              </span>
              
              {/* Text */}
              <span className="text-[#e2e2e8] text-sm font-semibold tracking-wide">
                Introducing <span className="text-[#4a9eed]">SyncSpace</span>
              </span>
              
            </div>
            <h1 className="text-[36px] md:text-[48px] font-bold leading-[1.2] mb-6 text-white">
              Your Life. All in <br className="hidden lg:block"/> One Widget.
            </h1>
            <p className="text-[16px] md:text-[20px] font-normal leading-[1.6] text-[#a1a1a6] mb-8 max-w-[600px]">
              <span className="text-[#e6edf3] font-semibold">Master every passion. Track every hobby.</span><br/>
              Consolidate your coding, fitness, learning, and all your diverse goals into one beautiful, unified dashboard. Replace your scattered apps with a single source of truth.
            </p>
            
            <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-4">
              <button 
                onClick={() => navigate("/login")}
                className="h-[48px] px-8 bg-[#4a9eed] text-white text-[16px] font-semibold rounded-[8px] transition-all duration-300 hover:bg-[#3a8edb] hover:-translate-y-[2px] hover:shadow-[0_10px_30px_rgba(74,158,237,0.3)] active:bg-[#2a7ecb] active:translate-y-0 w-full sm:w-auto"
              >
                Get Started
              </button>
              <button 
                onClick={() => scrollToSection('features')}
                className="h-[48px] px-8 bg-transparent border-2 border-[#4a9eed] text-[#4a9eed] text-[16px] font-semibold rounded-[8px] transition-all duration-300 hover:bg-[rgba(74,158,237,0.1)] hover:border-[#3a8edb] hover:text-white active:bg-[rgba(74,158,237,0.2)] active:border-[#2a7ecb] w-full sm:w-auto"
              >
                View Features
              </button>
            </div>
          </div>

          {/* Right Visual (Mockup) */}
          <div className="w-full lg:w-[55%] relative">
            <div className="absolute -inset-0.5 bg-gradient-to-tr from-[#4a9eed] to-[#8b5cf6] rounded-[14px] blur-2xl opacity-20 animate-pulse"></div>
            <div className="relative w-full aspect-[16/10] bg-[#1a1a20] border border-[#2d2d33] rounded-[12px] shadow-[0_20px_60px_rgba(74,158,237,0.15)] opacity-95 overflow-hidden flex flex-col">
              {/* Mockup Top Bar */}
              <div className="h-10 border-b border-[#2d2d33] flex items-center px-4 gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
              </div>
              
              {/* Mockup Dashboard Grid */}
              <div className="flex-1 p-4 grid grid-cols-3 gap-4">
                
                {/* Left Large Chart */}
                <div className="col-span-2 row-span-2 bg-background border border-[#2d2d33] rounded-lg p-4 flex flex-col gap-3 relative group overflow-hidden">
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:16px_16px]"></div>
                  
                  <div className="flex justify-between items-center z-10">
                    <span className="text-[11px] font-semibold text-[#8b949e] uppercase tracking-wider">Weekly Activity</span>
                    <div className="flex gap-1">
                      <div className="w-2 h-2 rounded-full bg-primary-container"></div>
                      <div className="w-2 h-2 rounded-full bg-[#2d2d33]"></div>
                      <div className="w-2 h-2 rounded-full bg-[#2d2d33]"></div>
                    </div>
                  </div>

                  <div className="flex-1 flex items-end gap-2 z-10">
                    {[40, 70, 45, 90, 65, 80, 50].map((h, i) => (
                      <div key={i} className="flex-1 bg-gradient-to-t from-[#4a9eed]/20 to-[#4a9eed]/80 rounded-t-sm relative transition-all duration-500 hover:from-[#4a9eed]/40" style={{ height: `${h}%` }}>
                        <div className="absolute top-0 left-0 w-full h-[2px] bg-[#4a9eed] shadow-[0_0_8px_#4a9eed]"></div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Top Right Progress Ring */}
                <div className="col-span-1 bg-[#0a0a0f] border border-[#2d2d33] rounded-lg p-4 flex flex-col justify-center items-center gap-2 relative group overflow-hidden">
                   <div className="absolute w-24 h-24 bg-[#8b5cf6]/10 blur-[20px] rounded-full group-hover:bg-[#8b5cf6]/20 transition-all duration-500"></div>
                   
                   <div className="relative w-14 h-14 flex items-center justify-center">
                     <svg className="absolute inset-0 w-full h-full -rotate-90">
                       <circle cx="50%" cy="50%" r="40%" className="stroke-[#2d2d33] fill-none stroke-[4px]" />
                       <circle 
                         cx="50%" cy="50%" r="40%" 
                         className="stroke-[#8b5cf6] fill-none stroke-[4px] drop-shadow-[0_0_8px_rgba(139,92,246,0.6)] transition-all duration-1000" 
                         pathLength="100"
                         strokeDasharray="100"
                         strokeDashoffset="25"
                         strokeLinecap="round"
                       />
                     </svg>
                     <span className="text-[13px] font-bold text-white relative z-10">75%</span>
                   </div>
                   <div className="text-[10px] font-semibold text-[#8b949e] uppercase tracking-wider mt-1 relative z-10">Daily Goal</div>
                </div>

                {/* Bottom Right Streaks */}
                <div className="col-span-1 bg-[#0a0a0f] border border-[#2d2d33] rounded-lg p-3 flex flex-col justify-between group relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-transparent to-[#22c55e]/5 opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                  
                  <div className="text-[10px] font-semibold text-[#8b949e] uppercase tracking-wider relative z-10">Active Streaks</div>
                  
                  <div className="flex flex-col gap-2 mt-2 relative z-10">
                    <div className="flex justify-between items-center bg-[#161b22] px-2 py-1.5 rounded border border-[#30363d]">
                      <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#4a9eed] shadow-[0_0_5px_#4a9eed]"></div>
                        <span className="text-[10px] text-[#e6edf3] font-semibold">DSA</span>
                      </div>
                      <span className="text-[10px] font-mono text-[#4a9eed] font-bold">12 🔥</span>
                    </div>
                    
                    <div className="flex justify-between items-center bg-[#161b22] px-2 py-1.5 rounded border border-[#30363d]">
                      <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#f59e0b] shadow-[0_0_5px_#f59e0b]"></div>
                        <span className="text-[10px] text-[#e6edf3] font-semibold">Gym</span>
                      </div>
                      <span className="text-[10px] font-mono text-[#f59e0b] font-bold">4 🔥</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
          
        </div>
      </header>

      {/* ========================================================
        2. VALUE PROPOSITION SECTION 
        ========================================================
      */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-8 md:px-12 py-10 sm:py-15 md:py-20">
        <h2 className="text-[28px] md:text-[36px] font-bold text-center text-white mb-12">
          Why Choose SyncSpace?
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="group relative bg-[#0a0a0f] border border-[#2d2d33] rounded-[16px] p-8 md:p-10 overflow-hidden transition-all duration-300 hover:bg-[#121217] hover:border-[#4a9eed]/50 hover:shadow-[0_10px_40px_rgba(74,158,237,0.1)] flex flex-col justify-between">
            <div className="absolute -top-6 -right-2 text-[140px] font-bold text-[#4a9eed] opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-500 pointer-events-none select-none leading-none">
              1
            </div>
            <div className="relative z-10 mb-12">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#4a9eed]/20 to-transparent flex items-center justify-center border border-[#4a9eed]/30 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
                <LayoutGrid className="w-6 h-6 text-[#4a9eed]" />
              </div>
            </div>
            <div className="relative z-10">
              <h3 className="text-[22px] font-bold text-white mb-3 group-hover:text-[#4a9eed] transition-colors duration-300">Unified Tracking</h3>
              <p className="text-[15px] text-[#8b949e] leading-[1.6]">
                Consolidate all your life trackers into one beautiful, unified interface. No more switching between apps.
              </p>
            </div>
          </div>

          {/* Card 2 */}
          <div className="group relative bg-[#0a0a0f] border border-[#2d2d33] rounded-[16px] p-8 md:p-10 overflow-hidden transition-all duration-300 hover:bg-[#121217] hover:border-[#8b5cf6]/50 hover:shadow-[0_10px_40px_rgba(139,92,246,0.1)] flex flex-col justify-between">
            <div className="absolute -top-6 -right-2 text-[140px] font-bold text-[#8b5cf6] opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-500 pointer-events-none select-none leading-none">
              2
            </div>
            <div className="relative z-10 mb-12">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#8b5cf6]/20 to-transparent flex items-center justify-center border border-[#8b5cf6]/30 group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-500">
                <Gamepad2 className="w-6 h-6 text-[#8b5cf6]" />
              </div>
            </div>
            <div className="relative z-10">
              <h3 className="text-[22px] font-bold text-white mb-3 group-hover:text-[#8b5cf6] transition-colors duration-300">Gamified Experience</h3>
              <p className="text-[15px] text-[#8b949e] leading-[1.6]">
                Sleek, motivating design inspired by gaming dashboards. Track streaks, level up, and stay engaged.
              </p>
            </div>
          </div>

          {/* Card 3 */}
          <div className="group relative bg-[#0a0a0f] border border-[#2d2d33] rounded-[16px] p-8 md:p-10 overflow-hidden transition-all duration-300 hover:bg-[#121217] hover:border-[#22c55e]/50 hover:shadow-[0_10px_40px_rgba(34,197,94,0.1)] flex flex-col justify-between">
            <div className="absolute -top-6 -right-2 text-[140px] font-bold text-[#22c55e] opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-500 pointer-events-none select-none leading-none">
              3
            </div>
            <div className="relative z-10 mb-12">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#22c55e]/20 to-transparent flex items-center justify-center border border-[#22c55e]/30 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
                <Blocks className="w-6 h-6 text-[#22c55e]" />
              </div>
            </div>
            <div className="relative z-10">
              <h3 className="text-[22px] font-bold text-white mb-3 group-hover:text-[#22c55e] transition-colors duration-300">Flexible & Extensible</h3>
              <p className="text-[15px] text-[#8b949e] leading-[1.6]">
                Add custom widgets and trackers as your needs evolve. Build your perfect productivity ecosystem.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
        3. FEATURES SHOWCASE SECTION 
        ========================================================
      */}
      <section id="features" className="border-t border-[#2d2d33] bg-[#0a0a0f]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 md:px-12 py-10 sm:py-15 md:py-20">
          <h2 className="text-[28px] md:text-[36px] font-bold text-center text-white mb-12">
            Powerful Tracking Features
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Feature 1: DSA Tracker */}
            <div className="bg-[#1a1a20] border border-[#2d2d33] rounded-[8px] overflow-hidden transition-all duration-300 hover:border-[#4a9eed] hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(74,158,237,0.15)] group flex flex-col">
              <div className="h-[150px] sm:h-[200px] w-full bg-[#0a0a0f] relative flex items-center justify-center overflow-hidden border-b border-[#2d2d33]">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:16px_16px]"></div>
                <div className="absolute w-32 h-32 bg-[#4a9eed]/20 blur-[50px] rounded-full"></div>
                <div className="relative z-10 bg-[#1a1a20] border border-[#2d2d33] rounded-lg p-4 shadow-xl flex flex-col gap-3 group-hover:scale-105 transition-transform duration-500">
                  <div className="flex items-center gap-2 mb-1">
                    <BarChart3 className="w-4 h-4 text-[#4a9eed]" />
                    <div className="w-16 h-2 bg-[#2d2d33] rounded-full"></div>
                  </div>
                  <div className="flex gap-1.5">
                    {[...Array(6)].map((_, col) => (
                      <div key={col} className="flex flex-col gap-1.5">
                        {[...Array(3)].map((_, row) => {
                          const opacities = [0.1, 0.4, 0.7, 1];
                          const randomOp = opacities[Math.floor(Math.random() * opacities.length)];
                          return (
                            <div key={row} className="w-3 h-3 rounded-[2px] bg-[#4a9eed] transition-all duration-700" style={{ opacity: randomOp }}></div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="p-6">
                <h4 className="text-[20px] font-semibold text-white mb-2">DSA Mastery Tracker</h4>
                <p className="text-[14px] text-[#a1a1a6] leading-[1.5] mb-4 flex-1">
                  Track LeetCode problems, contests, and progress with visual charts and quick-add modals.
                </p>
                <button onClick={() => navigate("/login")} className="text-[16px] font-semibold text-[#4a9eed] hover:underline decoration-[#4a9eed] transition-colors text-left w-fit">
                  Explore DSA →
                </button>
              </div>
            </div>

            {/* Feature 2: Gym Logger */}
            <div className="bg-[#1a1a20] border border-[#2d2d33] rounded-[8px] overflow-hidden transition-all duration-300 hover:border-[#f59e0b] hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(245,158,11,0.15)] group flex flex-col">
              <div className="h-[150px] sm:h-[200px] w-full bg-[#0a0a0f] relative flex items-center justify-center overflow-hidden border-b border-[#2d2d33]">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:16px_16px]"></div>
                <div className="absolute w-32 h-32 bg-[#f59e0b]/20 blur-[50px] rounded-full"></div>
                <div className="relative z-10 bg-[#1a1a20] border border-[#2d2d33] rounded-lg p-4 shadow-xl flex items-end gap-2 w-[200px] h-[100px] group-hover:scale-105 transition-transform duration-500">
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <Dumbbell className="w-4 h-4 text-[#f59e0b]" />
                    <div className="w-12 h-2 bg-[#2d2d33] rounded-full"></div>
                  </div>
                  {[40, 55, 45, 70, 65, 85, 100].map((height, i) => (
                    <div key={i} className="flex-1 bg-gradient-to-t from-[#f59e0b]/20 to-[#f59e0b] rounded-t-sm transition-all duration-700 delay-100 group-hover:from-[#f59e0b]/40" style={{ height: `${height}%` }}></div>
                  ))}
                </div>
              </div>
              <div className="p-6">
                <h4 className="text-[20px] font-semibold text-white mb-2">Gym Progress Logger</h4>
                <p className="text-[14px] text-[#a1a1a6] leading-[1.5] mb-4 flex-1">
                  Log workouts, track PRs, visualize strength gains, and maintain activity streaks.
                </p>
                <button onClick={() => navigate("/login")} className="text-[16px] font-semibold text-[#f59e0b] hover:underline decoration-[#f59e0b] transition-colors text-left w-fit">
                  Explore Gym →
                </button>
              </div>
            </div>

            {/* Feature 3: ML Learning */}
            <div className="bg-[#1a1a20] border border-[#2d2d33] rounded-[8px] overflow-hidden transition-all duration-300 hover:border-[#ec4899] hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(236,72,153,0.15)] group flex flex-col">
              <div className="h-[150px] sm:h-[200px] w-full bg-[#0a0a0f] relative flex items-center justify-center overflow-hidden border-b border-[#2d2d33]">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:16px_16px]"></div>
                <div className="absolute w-32 h-32 bg-[#ec4899]/20 blur-[50px] rounded-full"></div>
                <div className="relative z-10 bg-[#1a1a20] border border-[#2d2d33] rounded-lg p-4 shadow-xl flex items-center gap-4 group-hover:scale-105 transition-transform duration-500">
                  <div className="relative w-16 h-16 rounded-full border-[4px] border-[#2d2d33] flex items-center justify-center">
                    <svg className="absolute inset-0 w-full h-full -rotate-90">
                      <circle cx="50%" cy="50%" r="40%" className="stroke-[#ec4899] fill-none stroke-[4px] stroke-dasharray-[100] stroke-dashoffset-[35] transition-all duration-1000 group-hover:stroke-dashoffset-[15]" />
                    </svg>
                    <BrainCircuit className="w-6 h-6 text-[#ec4899]" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="w-20 h-3 bg-[#2d2d33] rounded-full"></div>
                    <div className="w-12 h-2 bg-[#2d2d33] rounded-full opacity-60"></div>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <h4 className="text-[20px] font-semibold text-white mb-2">ML Learning Tracker</h4>
                <p className="text-[14px] text-[#a1a1a6] leading-[1.5] mb-4 flex-1">
                  Track courses, research papers, and milestones with streak counters and dedicated dashboards.
                </p>
                <button onClick={() => navigate("/login")} className="text-[16px] font-semibold text-[#ec4899] hover:underline decoration-[#ec4899] transition-colors text-left w-fit">
                  Explore Learning →
                </button>
              </div>
            </div>

            {/* Feature 4: Custom Widgets */}
            <div className="bg-[#1a1a20] border border-[#2d2d33] rounded-[8px] overflow-hidden transition-all duration-300 hover:border-[#22c55e] hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(34,197,94,0.15)] group flex flex-col">
              <div className="h-[150px] sm:h-[200px] w-full bg-[#0a0a0f] relative flex items-center justify-center overflow-hidden border-b border-[#2d2d33]">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:16px_16px]"></div>
                <div className="absolute w-32 h-32 bg-[#22c55e]/20 blur-[50px] rounded-full"></div>
                <div className="relative z-10 flex items-center gap-3 group-hover:scale-105 transition-transform duration-500">
                  <div className="w-16 h-16 bg-[#22c55e]/10 border border-[#22c55e]/40 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(34,197,94,0.15)]">
                    <Settings2 className="w-7 h-7 text-[#22c55e]" />
                  </div>
                  <div className="w-16 h-16 bg-transparent border-2 border-dashed border-[#2d2d33] rounded-lg flex items-center justify-center transition-colors duration-500 group-hover:border-[#22c55e]/50">
                    <PlusCircle className="w-6 h-6 text-[#4a4a52] transition-colors duration-500 group-hover:text-[#22c55e]/70" />
                  </div>
                </div>
              </div>
              <div className="p-6">
                <h4 className="text-[20px] font-semibold text-white mb-2">Build Your Own</h4>
                <p className="text-[14px] text-[#a1a1a6] leading-[1.5] mb-4 flex-1">
                  Create custom JSON-based trackers for absolutely anything. The possibilities are limitless.
                </p>
                <button onClick={() => navigate("/login")} className="text-[16px] font-semibold text-[#22c55e] hover:underline decoration-[#22c55e] transition-colors text-left w-fit">
                  Coming Soon →
                </button>
              </div>
            </div>

          </div>

          {/* And Many More Indicator */}
          <div className="mt-12 md:mt-16 flex flex-col items-center justify-center text-center">
            <div className="flex gap-2 mb-4 opacity-60">
              <div className="w-2 h-2 rounded-full bg-[#4a9eed]"></div>
              <div className="w-2 h-2 rounded-full bg-[#8b5cf6]"></div>
              <div className="w-2 h-2 rounded-full bg-[#22c55e]"></div>
            </div>
            <h3 className="text-[18px] md:text-[22px] font-bold text-white mb-2">
              ...and many more widgets to track every side of you.
            </h3>
            <p className="text-[14px] text-[#a1a1a6] max-w-[400px]">
              Habit trackers, reading logs, finance dashboards, and specialized tools ready to drop into your grid.
            </p>
          </div>

        </div>
      </section>

      {/* ========================================================
        4. HOW IT WORKS SECTION 
        ========================================================
      */}
      <section className="border-t border-[#2d2d33] bg-gradient-to-b from-[#0a0a0f] to-[#1a1a20]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 md:px-12 py-10 sm:py-15 md:py-20 text-center">
          <h2 className="text-[28px] md:text-[36px] font-bold text-white mb-12 md:mb-16">
            Get Started in 3 Simple Steps
          </h2>

          <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-4 relative">
            <div className="flex flex-col items-center w-full md:w-1/3 z-10">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#4a9eed] to-[#0a0a0f] border border-[#4a9eed]/50 flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(74,158,237,0.2)]">
                <User className="w-8 h-8 text-[#ffffff]" />
              </div>
              <h3 className="text-[18px] font-bold text-white mb-2">Create Your Account</h3>
              <p className="text-[14px] text-[#a1a1a6] max-w-[250px]">
                Sign up with email or Google to establish your secure workspace.
              </p>
            </div>
            <div className="hidden md:flex items-center text-[#4a9eed] opacity-50">
              <div className="w-8 h-[2px] bg-[#4a9eed]"></div>
              <ArrowRight className="w-5 h-5 -ml-1" />
            </div>
            <div className="md:hidden w-[2px] h-8 bg-[#2d2d33]"></div>
            <div className="flex flex-col items-center w-full md:w-1/3 z-10">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#8b5cf6] to-[#0a0a0f] border border-[#8b5cf6]/50 flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(139,92,246,0.2)]">
                <PlusCircle className="w-8 h-8 text-[#ffffff]" />
              </div>
              <h3 className="text-[18px] font-bold text-white mb-2">Add Widgets</h3>
              <p className="text-[14px] text-[#a1a1a6] max-w-[250px]">
                Choose from pre-built DSA, Gym, or ML trackers to populate your board.
              </p>
            </div>
            <div className="hidden md:flex items-center text-[#8b5cf6] opacity-50">
              <div className="w-8 h-[2px] bg-[#8b5cf6]"></div>
              <ArrowRight className="w-5 h-5 -ml-1" />
            </div>
            <div className="md:hidden w-[2px] h-8 bg-[#2d2d33]"></div>
            <div className="flex flex-col items-center w-full md:w-1/3 z-10">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#22c55e] to-[#0a0a0f] border border-[#22c55e]/50 flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(34,197,94,0.2)]">
                <Rocket className="w-8 h-8 text-[#ffffff]" />
              </div>
              <h3 className="text-[18px] font-bold text-white mb-2">Start Tracking</h3>
              <p className="text-[14px] text-[#a1a1a6] max-w-[250px]">
                Log data daily, watch your progress charts soar, and achieve your goals.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
        6. CALL-TO-ACTION (CTA) SECTION 
        ========================================================
      */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-8 md:px-12 py-10 sm:py-15 md:py-20">
        <div className="relative overflow-hidden rounded-[12px] border border-[#2d2d33] px-6 py-12 md:py-16 text-center shadow-2xl">
          <div className="absolute inset-0 opacity-10 bg-gradient-to-br from-[#4a9eed] via-[#8b5cf6] to-[#4a9eed] animate-[gradient_8s_ease_infinite] bg-[length:200%_200%]"></div>
          
          <div className="relative z-10">
            <h2 className="text-[24px] md:text-[32px] font-bold text-white mb-4">
              Join the Beta Today
            </h2>
            <p className="text-[14px] md:text-[16px] font-normal text-[#a1a1a6] mb-8 max-w-[500px] mx-auto">
              Build your perfect productivity ecosystem. Limited beta spots are currently available for early adopters.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button 
                onClick={() => navigate("/login")}
                className="h-[48px] px-8 bg-[#4a9eed] text-white text-[16px] font-semibold rounded-[8px] transition-all duration-300 hover:bg-[#3a8edb] hover:-translate-y-[2px] hover:shadow-[0_10px_30px_rgba(74,158,237,0.3)] active:bg-[#2a7ecb] active:translate-y-0 w-full sm:w-auto"
              >
                Get Started
              </button>
              <button 
                onClick={() => scrollToSection('features')}
                className="h-[48px] px-8 bg-transparent border-2 border-[#4a9eed] text-[#4a9eed] text-[16px] font-semibold rounded-[8px] transition-all duration-300 hover:bg-[rgba(74,158,237,0.1)] hover:border-[#3a8edb] hover:text-white active:bg-[rgba(74,158,237,0.2)] active:border-[#2a7ecb] w-full sm:w-auto"
              >
                Learn More
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
        7. FOOTER 
        ========================================================
      */}
      <footer className="border-t border-[#2d2d33] bg-[#0a0a0f]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 md:px-12 py-8 sm:py-10 md:py-12">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 md:gap-16 mb-12">
            <div className="flex flex-col gap-3">
              <h4 className="text-[16px] font-semibold text-white mb-1 border-b border-[#2d2d33] pb-2 inline-block">Product</h4>
              <button onClick={() => scrollToSection('features')} className="text-[14px] text-[#a1a1a6] hover:text-white transition-colors duration-200 text-left">Widgets</button>
              <button className="text-[14px] text-[#a1a1a6] hover:text-white transition-colors duration-200 text-left">Roadmap</button>
              <button className="text-[14px] text-[#a1a1a6] hover:text-white transition-colors duration-200 text-left">Pricing</button>
            </div>
            <div className="flex flex-col gap-3">
              <h4 className="text-[16px] font-semibold text-white mb-1 border-b border-[#2d2d33] pb-2 inline-block">Company</h4>
              <button className="text-[14px] text-[#a1a1a6] hover:text-white transition-colors duration-200 text-left">About</button>
              <button className="text-[14px] text-[#a1a1a6] hover:text-white transition-colors duration-200 text-left">Blog</button>
              <button className="text-[14px] text-[#a1a1a6] hover:text-white transition-colors duration-200 text-left">Contact</button>
              <button className="text-[14px] text-[#a1a1a6] hover:text-white transition-colors duration-200 text-left">Careers</button>
            </div>
            <div className="flex flex-col gap-3">
              <h4 className="text-[16px] font-semibold text-white mb-1 border-b border-[#2d2d33] pb-2 inline-block">Legal</h4>
              <button className="text-[14px] text-[#a1a1a6] hover:text-white transition-colors duration-200 text-left">Privacy Policy</button>
              <button className="text-[14px] text-[#a1a1a6] hover:text-white transition-colors duration-200 text-left">Terms of Service</button>
              <button className="text-[14px] text-[#a1a1a6] hover:text-white transition-colors duration-200 text-left">Cookies</button>
            </div>
            <div className="flex flex-col gap-3">
              <h4 className="text-[16px] font-semibold text-white mb-1 border-b border-[#2d2d33] pb-2 inline-block">Social</h4>
            
            </div>
          </div>
          <div className="pt-6 border-t border-[#2d2d33] text-center">
            <p className="text-[12px] text-[#a1a1a6]">
              © 2026 SyncSpace (Modular Life OS). Built with React & Tailwind.
            </p>
          </div>
        </div>
      </footer>

      {/* ========================================================
        8. AUTH MODAL (Sign up / Log in) 
        ========================================================
     

      {/* Global Animation Styles */}
      <style>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        html { scroll-behavior: smooth; }
      `}</style>
    </div>
  );
}