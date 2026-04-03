    // DSACardContent.jsx — stat content inside the DSA widget card
    // Props:
    //   entries → array of today's DSA entries from supabase for this widget
    //   accent  → widget.color passed down from parent for pill/tag coloring


    // entries ko via useselector mangvana he 
export default function DSACardContent({ entries, accent }) {

    // TODO: compute these from entries array
    const today = new Date().toISOString().split('T')[0]
    const solvedToday= entries.filter(e=> e.date===today).length

    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().split('T')[0]
    const solvedYesterday = entries.filter(e => e.date === yesterdayStr).length
    const vsYesterday = solvedToday - solvedYesterday    

    const streakDays = 0           // consecutive days with at least 1 entry — compute from all entries
    const totalSolved = entries.length 
    // 7 day before logic         // total entry count all time
    const thisWeek = new date()  
    thisWeek.setDate(thisWeek.getDate()-7)   
    const thisWeekstr=thisWeek.toISOString().split('T')[0]
    const SolvedThisWeek=entries.filter(e=>e.date > thisWeek).length        // count of entries in current week (Mon–today)

    // TODO: get last entry from entries array (entries[entries.length - 1])
    const lastProblemTitle = '—'   // last entry's payload.problem_title
    const lastDifficulty = '—'     // last entry's payload.difficulty → 'easy' | 'medium' | 'hard'
    const topTopic = '—'           // most frequent payload.topic across all entries

    // TODO: difficulty badge color helper
    // easy → green, medium → amber, hard → red
    const difficultyColor = {
        easy:   { bg: 'rgba(34,197,94,0.15)',  text: '#22c55e' },
        medium: { bg: 'rgba(245,158,11,0.15)', text: '#f59e0b' },
        hard:   { bg: 'rgba(239,68,68,0.15)',  text: '#ef4444' },
    }
    const diff = difficultyColor[lastDifficulty] ?? difficultyColor.easy

    return (
        <>
        {/* Stat grid — 2x2 */}
        <div className="grid grid-cols-2 gap-1.75 mb-3">

            <div className="bg-white/4 rounded-[9px] p-2.5">
            <div className="text-[9px] text-slate-500 font-semibold uppercase tracking-widest mb-1">Solved today</div>
            <div className="text-[19px] font-bold leading-none" style={{ color: accent }}>{solvedToday}</div>
            {/* show +N vs yesterday, or -N, or "same as yesterday" */}
            <div className="text-[9px] text-slate-500 mt-0.5">
                {vsYesterday > 0 ? `+${vsYesterday} vs yesterday` : vsYesterday < 0 ? `${vsYesterday} vs yesterday` : 'same as yesterday'}
            </div>
            </div>

            <div className="bg-white/4 rounded-[9px] p-2.5">
            <div className="text-[9px] text-slate-500 font-semibold uppercase tracking-widest mb-1">Streak</div>
            {/* TODO: show flame emoji only if streakDays > 0 */}
            <div className="text-[19px] font-bold leading-none text-amber-400">🔥 {streakDays}</div>
            <div className="text-[9px] text-slate-500 mt-0.5">days in a row</div>
            </div>

            <div className="bg-white/4 rounded-[9px] p-2.5">
            <div className="text-[9px] text-slate-500 font-semibold uppercase tracking-widest mb-1">Total solved</div>
            <div className="text-[19px] font-bold leading-none text-green-400">{totalSolved}</div>
            <div className="text-[9px] text-slate-500 mt-0.5">all time</div>
            </div>

            <div className="bg-white/4 rounded-[9px] p-2.5">
            <div className="text-[9px] text-slate-500 font-semibold uppercase tracking-widest mb-1">This week</div>
            <div className="text-[19px] font-bold leading-none text-slate-200">{thisWeek}</div>
            <div className="text-[9px] text-slate-500 mt-0.5">problems</div>
            </div>

        </div>

        {/* Divider */}
        <div className="h-px bg-white/6 mb-3" />

        {/* Last solved row */}
        <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] text-slate-500">Last solved</span>
            <div className="flex items-center gap-1.25">
            <span className="text-[11px] text-slate-200 font-medium max-w-25 truncate">
                {lastProblemTitle}
            </span>
            {/* Difficulty badge */}
            <span
                className="text-[10px] font-semibold px-2 py-px rounded-full"
                style={{ background: diff.bg, color: diff.text }}
            >
                {lastDifficulty}
            </span>
            </div>
        </div>

        {/* Top topic row */}
        <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] text-slate-500">Top topic</span>
            <span
            className="text-[10px] font-semibold px-2 py-px rounded-full"
            style={{ background: `${accent}25`, color: accent }}
            >
            {topTopic}
            </span>
        </div>
        </>
    )
}