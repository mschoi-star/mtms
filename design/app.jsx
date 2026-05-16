// Root composition: sidebar + desktop with hamsters + single tabbed browser window.

const { useState, useRef, useEffect } = React;

const MENUBAR_HEIGHT = 28;

const MenuBar = ({ activeId, tabCount, user, onSignOut }) => {
  const [time, setTime] = useState(new Date());
  useEffect(()=>{
    const t = setInterval(()=>setTime(new Date()), 30000);
    return ()=>clearInterval(t);
  },[]);
  const focused = activeId ? window.APP_CONTENT[activeId]?.title : 'Desktop';
  return (
    <div style={{
      height: MENUBAR_HEIGHT, flexShrink:0,
      borderBottom:'1.5px solid #1f2430',
      background:'#1f2430', color:'#ffffff',
      display:'flex', alignItems:'center', padding:'0 12px',
      fontFamily:'JetBrains Mono, monospace', fontSize: 11, letterSpacing: 1
    }}>
      <span style={{ fontWeight:700, marginRight: 18 }}>▚ MTMS</span>
      <span style={{ opacity: 0.7, marginRight: 18 }}>{focused}</span>
      <span style={{ opacity: 0.7, marginRight: 18 }}>File</span>
      <span style={{ opacity: 0.7, marginRight: 18 }}>View</span>
      <span style={{ opacity: 0.7 }}>Window</span>
      <div style={{ flex: 1 }} />
      <span style={{ opacity: 0.7, marginRight: 16 }}>{tabCount} tab{tabCount===1?'':'s'}</span>
      {user && (
        <button
          onClick={onSignOut}
          title="Sign out"
          style={{
            background:'transparent', border:'1px solid rgba(255,255,255,0.3)',
            color:'#ffffff', fontFamily:'inherit', fontSize: 10.5,
            padding:'2px 8px', marginRight: 12, cursor:'pointer', letterSpacing: 1
          }}
        >
          <span style={{color:'#c8a57a', marginRight:5}}>●</span>{user.id} · sign out
        </button>
      )}
      <span>{time.toLocaleString('en-GB', { hour:'2-digit', minute:'2-digit', weekday:'short', day:'2-digit', month:'short' })}</span>
    </div>
  );
};

const Desktop = () => {
  // auth gate
  const [authed, setAuthed] = useState(false);
  const [user, setUser] = useState(null);

  if (!authed) {
    return <window.LoginPage onLogin={(u)=>{ setUser(u); setAuthed(true); }} />;
  }
  return <DesktopShell user={user} onSignOut={()=>{ setAuthed(false); setUser(null); }} />;
};

const DesktopShell = ({ user, onSignOut }) => {
  // tabs: array of { id, title, url, content }
  const [tabs, setTabs] = useState([]);
  const [activeId, setActiveId] = useState(null);

  const openApp = (id) => {
    setTabs(prev => {
      if (prev.find(t => t.id === id)) {
        setActiveId(id);
        return prev;
      }
      const meta = window.APP_CONTENT[id];
      setActiveId(id);
      return [...prev, { id, ...meta }];
    });
  };

  const closeTab = (id) => {
    setTabs(prev => {
      const idx = prev.findIndex(t => t.id === id);
      const next = prev.filter(t => t.id !== id);
      if (activeId === id) {
        if (next.length === 0) setActiveId(null);
        else setActiveId(next[Math.max(0, idx - 1)].id);
      }
      return next;
    });
  };

  const activate = (id) => setActiveId(id);

  const openIds = tabs.map(t => t.id);

  // Open Dashboard by default on mount
  useEffect(() => {
    openApp('dashboard');
    // eslint-disable-next-line
  }, []);

  return (
    <div style={{ display:'flex', height:'100%', background:'#ffffff' }}>
      <window.Sidebar openIds={openIds} onOpen={openApp} />

      <main style={{ flex:1, display:'flex', flexDirection:'column', position:'relative', overflow:'hidden' }}>
        <MenuBar activeId={activeId} tabCount={tabs.length} user={user} onSignOut={onSignOut} />

        <div style={{
          flex:1, position:'relative', overflow:'hidden',
          background: '#ffffff',
          backgroundImage: `
            linear-gradient(#f3eee2 1px, transparent 1px),
            linear-gradient(90deg, #f3eee2 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }}>
          {/* Watermark / desktop label */}
          <div style={{
            position:'absolute', top: 14, right: 22,
            fontFamily:'JetBrains Mono, monospace', fontSize: 10.5,
            color:'#4a5160', letterSpacing: 1.6, textAlign:'right',
            zIndex: 0
          }}>
            MPSE TOTAL MANAGER SYSTEM<br/>
            <span style={{color:'#c8a57a'}}>──</span> v2.6.1 · build 240513
          </div>

          {/* Hamster troupe runs across the bottom */}
          <window.HamsterRun />

          {/* The single large browser window */}
          <window.BrowserWindow
            tabs={tabs}
            activeId={activeId}
            onActivate={activate}
            onClose={closeTab}
          />
        </div>
      </main>
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(<Desktop />);
