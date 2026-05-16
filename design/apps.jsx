// Content for each "app" that opens inside a BrowserWindow.
// Two colors of fill only: warm tan + ink. All text on white.

const Section = ({ title, right, children }) => (
  <section style={{ padding:'18px 22px', borderBottom:'1px solid #e6e3dd' }}>
    <header style={{
      display:'flex', justifyContent:'space-between', alignItems:'baseline',
      marginBottom: 12
    }}>
      <h2 style={{
        margin:0, fontSize: 13, fontWeight: 700, letterSpacing: 1.5,
        textTransform:'uppercase', color:'#1f2430'
      }}>{title}</h2>
      {right && <div style={{ fontSize: 11, fontFamily:'JetBrains Mono, monospace', color:'#4a5160' }}>{right}</div>}
    </header>
    {children}
  </section>
);

const Tag = ({ children, tone='ink' }) => (
  <span style={{
    display:'inline-flex', alignItems:'center',
    padding:'2px 8px', fontSize: 10.5, fontWeight: 600,
    fontFamily:'JetBrains Mono, monospace', letterSpacing: 0.6,
    border:'1.5px solid #1f2430',
    background: tone==='warm' ? '#c8a57a' : '#ffffff',
    color: '#1f2430'
  }}>{children}</span>
);

const Bar = ({ value, label }) => (
  <div style={{ marginBottom: 10 }}>
    <div style={{ display:'flex', justifyContent:'space-between', fontSize: 11.5, marginBottom: 4 }}>
      <span>{label}</span><span style={{fontFamily:'JetBrains Mono, monospace'}}>{value}%</span>
    </div>
    <div style={{ height: 10, border:'1.5px solid #1f2430', background:'#ffffff' }}>
      <div style={{ height:'100%', width:`${value}%`, background:'#c8a57a' }} />
    </div>
  </div>
);

// ── Dashboard ────────────────────────────────────────────────
const DashboardApp = () => {
  return (
    <div>
      <Section title="Overview" right="2026.05.13  ·  Wed">
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap: 10 }}>
          {[
            { k:'ACTIVE',   v:'47',  s:'projects'   },
            { k:'PENDING',  v:'12',  s:'reviews'    },
            { k:'TEAM',     v:'128', s:'members'    },
            { k:'UPTIME',   v:'99.8',s:'percent'    },
          ].map(c=>(
            <div key={c.k} style={{ border:'1.5px solid #1f2430', padding:'12px 14px', background:'#ffffff' }}>
              <div style={{ fontSize: 10, letterSpacing: 1.5, color:'#4a5160' }}>{c.k}</div>
              <div style={{ fontSize: 32, fontWeight: 700, lineHeight: 1.1, marginTop: 2 }}>{c.v}</div>
              <div style={{ fontSize: 10.5, color:'#4a5160' }}>{c.s}</div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Capacity by team" right="weekly">
        <Bar value={84} label="Engineering" />
        <Bar value={62} label="Design" />
        <Bar value={71} label="Operations" />
        <Bar value={45} label="QA / Validation" />
      </Section>

      <Section title="Recent activity">
        <ul style={{ margin:0, padding:0, listStyle:'none', fontSize: 12.5 }}>
          {[
            ['09:42','Kim S.','closed','PRJ-204 · CAE postprocessor'],
            ['09:18','Lee J.','opened','PRJ-219 · meshing benchmarks'],
            ['08:55','Park H.','approved','RPT-118 · Q2 reliability'],
            ['08:30','Choi M.','commented','PRJ-201 · solver migration'],
          ].map((r,i)=>(
            <li key={i} style={{
              display:'grid', gridTemplateColumns:'70px 90px 80px 1fr',
              padding:'8px 0', borderTop: i? '1px dashed #d6d1c5':'none',
              alignItems:'center'
            }}>
              <span style={{fontFamily:'JetBrains Mono, monospace', color:'#4a5160'}}>{r[0]}</span>
              <span style={{fontWeight:600}}>{r[1]}</span>
              <Tag tone={r[2]==='approved'?'warm':'ink'}>{r[2]}</Tag>
              <span style={{paddingLeft:8}}>{r[3]}</span>
            </li>
          ))}
        </ul>
      </Section>
    </div>
  );
};

// ── Projects ────────────────────────────────────────────────
const ProjectsApp = () => {
  const rows = [
    ['PRJ-204','CAE postprocessor v3',   'Eng',  82, 'in review'],
    ['PRJ-219','Meshing benchmarks',     'QA',   34, 'active'],
    ['PRJ-201','Solver migration',       'Eng',  68, 'active'],
    ['PRJ-188','Topology optimization',  'R&D',  91, 'in review'],
    ['PRJ-176','Field equation library', 'R&D',  100,'closed'],
    ['PRJ-211','Cluster scheduler',      'Ops',  22, 'active'],
  ];
  return (
    <div>
      <Section title="Projects" right={`${rows.length} items`}>
        <div style={{ border:'1.5px solid #1f2430' }}>
          <div style={{
            display:'grid', gridTemplateColumns:'80px 1fr 80px 140px 110px',
            background:'#1f2430', color:'#ffffff',
            padding:'8px 12px', fontSize: 10.5, letterSpacing: 1.5
          }}>
            <span>ID</span><span>NAME</span><span>TEAM</span><span>PROGRESS</span><span>STATUS</span>
          </div>
          {rows.map((r,i)=>(
            <div key={i} style={{
              display:'grid', gridTemplateColumns:'80px 1fr 80px 140px 110px',
              padding:'10px 12px', fontSize: 12.5, alignItems:'center',
              borderTop: i? '1px solid #e6e3dd':'none',
              background: i%2 ? '#ffffff' : '#fbf9f3'
            }}>
              <span style={{fontFamily:'JetBrains Mono, monospace'}}>{r[0]}</span>
              <span style={{fontWeight:600}}>{r[1]}</span>
              <span>{r[2]}</span>
              <span>
                <div style={{ height:8, border:'1.5px solid #1f2430', background:'#ffffff', width: 110 }}>
                  <div style={{ height:'100%', width:`${r[3]}%`, background:'#c8a57a'}} />
                </div>
              </span>
              <Tag tone={r[4]==='in review' ? 'warm' : 'ink'}>{r[4]}</Tag>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
};

// ── Reports ──────────────────────────────────────────────────
const ReportsApp = () => {
  const data = [38, 54, 41, 72, 65, 88, 76, 92, 81, 95, 70, 83];
  const max = 100;
  return (
    <div>
      <Section title="Reliability index" right="12-month">
        <div style={{
          height: 200, display:'flex', alignItems:'flex-end',
          gap: 10, padding:'10px 4px',
          borderBottom:'1.5px solid #1f2430'
        }}>
          {data.map((v,i)=>(
            <div key={i} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:6 }}>
              <div style={{
                width:'100%', height: `${(v/max)*170}px`,
                background: i===data.length-1 ? '#1f2430' : '#c8a57a',
                border:'1.5px solid #1f2430'
              }} />
              <span style={{ fontSize: 10, fontFamily:'JetBrains Mono, monospace', color:'#4a5160' }}>{i+1}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Latest reports">
        {[
          ['RPT-118','Q2 reliability summary','approved'],
          ['RPT-117','Cluster utilization',   'approved'],
          ['RPT-116','Solver regression',     'draft'],
          ['RPT-115','Vendor compliance',     'draft'],
        ].map((r,i)=>(
          <div key={i} style={{
            display:'flex', justifyContent:'space-between', alignItems:'center',
            padding:'10px 0', borderTop: i? '1px dashed #d6d1c5':'none'
          }}>
            <div>
              <div style={{fontFamily:'JetBrains Mono, monospace', fontSize: 11, color:'#4a5160'}}>{r[0]}</div>
              <div style={{ fontWeight: 600 }}>{r[1]}</div>
            </div>
            <Tag tone={r[2]==='approved'?'warm':'ink'}>{r[2]}</Tag>
          </div>
        ))}
      </Section>
    </div>
  );
};

// ── Schedule ─────────────────────────────────────────────────
const ScheduleApp = () => {
  const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  const dates = [11,12,13,14,15,16,17];
  const events = {
    11:[['09','Standup']],
    13:[['10','Review · PRJ-204'],['14','MTMS sync']],
    14:[['11','Vendor call']],
    15:[['09','Standup'],['16','Sprint close']],
  };
  return (
    <div>
      <Section title="May 2026 · Week 20" right="13 · Wed">
        <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', border:'1.5px solid #1f2430' }}>
          {days.map((d,i)=>(
            <div key={d} style={{
              borderRight: i<6?'1px solid #1f2430':'none', borderBottom:'1.5px solid #1f2430',
              background:'#1f2430', color:'#ffffff', textAlign:'center', padding:'6px 0',
              fontSize: 11, letterSpacing: 1
            }}>{d}</div>
          ))}
          {dates.map((d,i)=>{
            const ev = events[d] || [];
            const today = d===13;
            return (
              <div key={d} style={{
                borderRight: i<6?'1px solid #e6e3dd':'none',
                minHeight: 120, padding: 8,
                background: today ? '#fbf3e2' : '#ffffff'
              }}>
                <div style={{
                  fontWeight: today?700:500,
                  fontSize: today?16:13,
                  color: today ? '#1f2430' : '#4a5160',
                  marginBottom: 6
                }}>{d}{today && <span style={{
                  display:'inline-block', marginLeft:6, padding:'1px 5px',
                  background:'#1f2430', color:'#ffffff', fontSize:9, letterSpacing:1
                }}>TODAY</span>}</div>
                {ev.map((e,j)=>(
                  <div key={j} style={{
                    fontSize: 10.5, padding:'3px 5px', marginBottom: 3,
                    border:'1.5px solid #1f2430',
                    background: today ? '#c8a57a' : '#ffffff'
                  }}>
                    <span style={{fontFamily:'JetBrains Mono, monospace', marginRight:5}}>{e[0]}</span>
                    {e[1]}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </Section>
    </div>
  );
};

// ── Inbox ────────────────────────────────────────────────────
const InboxApp = () => {
  const msgs = [
    ['Kim S.', 'Re: PRJ-204 review',          '09:42', true ],
    ['Lee J.', 'Meshing benchmark plan',      '09:18', true ],
    ['Park H.','RPT-118 approval signed off', '08:55', false],
    ['Choi M.','Comments on solver migration','08:30', false],
    ['Han B.', 'Cluster maintenance window',  'Tue',   false],
  ];
  return (
    <div style={{ display:'grid', gridTemplateColumns:'280px 1fr', height:'100%' }}>
      <aside style={{ borderRight:'1.5px solid #1f2430', overflow:'auto' }}>
        {msgs.map((m,i)=>(
          <div key={i} style={{
            padding:'12px 14px', borderBottom:'1px solid #e6e3dd',
            background: i===0 ? '#fbf3e2' : '#ffffff', cursor:'pointer'
          }}>
            <div style={{ display:'flex', justifyContent:'space-between' }}>
              <span style={{ fontWeight: m[3]?700:500, fontSize: 12.5 }}>{m[0]}</span>
              <span style={{ fontSize: 10.5, fontFamily:'JetBrains Mono, monospace', color:'#4a5160' }}>{m[2]}</span>
            </div>
            <div style={{ fontSize: 11.5, color:'#4a5160', marginTop: 2 }}>{m[1]}</div>
            {m[3] && <div style={{
              display:'inline-block', width:6, height:6, background:'#c8a57a',
              border:'1px solid #1f2430', marginTop:6
            }}/>}
          </div>
        ))}
      </aside>
      <article style={{ padding:'22px 26px', overflow:'auto' }}>
        <div style={{ fontFamily:'JetBrains Mono, monospace', fontSize: 11, color:'#4a5160' }}>from: kim.s@mpse-cae.com  ·  09:42</div>
        <h1 style={{ margin:'6px 0 14px', fontSize: 20 }}>Re: PRJ-204 review</h1>
        <p style={{ margin:'0 0 10px', fontSize: 13, lineHeight: 1.6 }}>
          The postprocessor v3 build passes all regression suites. Two minor
          findings flagged in the validation log — both already triaged to the
          next iteration.
        </p>
        <p style={{ margin:'0 0 14px', fontSize: 13, lineHeight: 1.6 }}>
          Requesting final review sign-off so we can promote to release branch
          before Friday's sprint close.
        </p>
        <div style={{ display:'flex', gap: 8 }}>
          <button style={primaryBtn}>Approve</button>
          <button style={ghostBtn}>Request changes</button>
        </div>
      </article>
    </div>
  );
};

// ── Team ─────────────────────────────────────────────────────
const TeamApp = () => {
  const ppl = [
    ['Kim Soo-jin', 'Lead Engineer',    'Engineering', 'online'],
    ['Lee Joon',    'QA Specialist',    'QA',          'online'],
    ['Park Hye-rin','Reliability Lead', 'R&D',         'idle'],
    ['Choi Min-woo','Solver Engineer',  'Engineering', 'online'],
    ['Han Bora',    'Ops Manager',      'Operations',  'offline'],
    ['Jung Tae-hyun','Designer',        'Design',      'online'],
  ];
  return (
    <Section title="Team" right={`${ppl.length} members`}>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap: 10 }}>
        {ppl.map((p,i)=>(
          <div key={i} style={{
            display:'flex', gap: 12, alignItems:'center',
            border:'1.5px solid #1f2430', padding: 12, background:'#ffffff'
          }}>
            <div style={{
              width: 44, height: 44, border:'1.5px solid #1f2430',
              background:'#c8a57a',
              display:'flex', alignItems:'center', justifyContent:'center',
              fontWeight: 700, fontFamily:'JetBrains Mono, monospace', fontSize: 14
            }}>{p[0].split(' ').map(s=>s[0]).join('')}</div>
            <div style={{ flex:1 }}>
              <div style={{ fontWeight: 700, fontSize: 13 }}>{p[0]}</div>
              <div style={{ fontSize: 11, color:'#4a5160' }}>{p[1]} · {p[2]}</div>
            </div>
            <Tag tone={p[3]==='online'?'warm':'ink'}>{p[3]}</Tag>
          </div>
        ))}
      </div>
    </Section>
  );
};

// ── Files ────────────────────────────────────────────────────
const FilesApp = () => {
  const tree = [
    ['dir','/projects',  '—',     '2026-05-13'],
    ['dir','/reports',   '—',     '2026-05-12'],
    ['dir','/datasets',  '—',     '2026-05-11'],
    ['file','manifest.toml','3 KB', '2026-05-13'],
    ['file','readme.md',  '12 KB', '2026-05-10'],
    ['file','log.txt',    '420 KB','2026-05-13'],
  ];
  return (
    <Section title="Files" right="/ root">
      <div style={{ border:'1.5px solid #1f2430', fontFamily:'JetBrains Mono, monospace', fontSize: 12 }}>
        <div style={{
          display:'grid', gridTemplateColumns:'40px 1fr 90px 110px',
          background:'#1f2430', color:'#ffffff', padding:'7px 12px',
          fontSize: 10.5, letterSpacing: 1.5
        }}>
          <span></span><span>NAME</span><span>SIZE</span><span>MODIFIED</span>
        </div>
        {tree.map((t,i)=>(
          <div key={i} style={{
            display:'grid', gridTemplateColumns:'40px 1fr 90px 110px',
            padding:'8px 12px',
            borderTop: i? '1px solid #e6e3dd':'none',
            background: i%2 ? '#ffffff' : '#fbf9f3'
          }}>
            <span style={{color: t[0]==='dir' ? '#c8a57a' : '#4a5160', fontWeight: t[0]==='dir' ? 700 : 400}}>
              {t[0]==='dir' ? '▸' : '·'}
            </span>
            <span style={{ fontWeight: t[0]==='dir' ? 600 : 400 }}>{t[1]}</span>
            <span style={{color:'#4a5160'}}>{t[2]}</span>
            <span style={{color:'#4a5160'}}>{t[3]}</span>
          </div>
        ))}
      </div>
    </Section>
  );
};

// ── Settings ─────────────────────────────────────────────────
const SettingsApp = () => {
  const [acc, setAcc] = React.useState({ notif:true, dark:false, beta:true });
  return (
    <Section title="Settings" right="local">
      <div style={{ display:'flex', flexDirection:'column', gap: 0 }}>
        {[
          ['notif','Desktop notifications','Show alerts when projects update'],
          ['dark', 'Dark window chrome',   'Use darker titlebars for all windows'],
          ['beta', 'Beta features',        'Enable in-development MTMS modules'],
        ].map(([k,t,d],i)=>(
          <label key={k} style={{
            display:'flex', justifyContent:'space-between', alignItems:'center',
            padding:'14px 0', borderTop: i? '1px dashed #d6d1c5':'none', cursor:'pointer'
          }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: 13 }}>{t}</div>
              <div style={{ fontSize: 11.5, color:'#4a5160' }}>{d}</div>
            </div>
            <div
              onClick={()=>setAcc({...acc,[k]:!acc[k]})}
              style={{
                width: 40, height: 22, border:'1.5px solid #1f2430',
                background: acc[k] ? '#c8a57a' : '#ffffff',
                position:'relative', cursor:'pointer'
              }}>
              <div style={{
                position:'absolute', top: 1, left: acc[k] ? 19 : 1,
                width: 17, height: 17, background:'#1f2430',
                transition: 'left 120ms ease'
              }}/>
            </div>
          </label>
        ))}
      </div>
    </Section>
  );
};

const primaryBtn = {
  padding:'7px 14px', border:'1.5px solid #1f2430', background:'#c8a57a',
  fontWeight: 700, fontSize: 12, cursor:'pointer', letterSpacing: 0.8
};
const ghostBtn = {
  padding:'7px 14px', border:'1.5px solid #1f2430', background:'#ffffff',
  fontWeight: 600, fontSize: 12, cursor:'pointer', letterSpacing: 0.8
};

const APP_CONTENT = {
  dashboard: { title:'Dashboard', url:'home/dashboard',  content: <DashboardApp /> },
  projects:  { title:'Projects',  url:'work/projects',   content: <ProjectsApp /> },
  reports:   { title:'Reports',   url:'analytics/reports', content: <ReportsApp /> },
  schedule:  { title:'Schedule',  url:'plan/schedule',   content: <ScheduleApp /> },
  inbox:     { title:'Inbox',     url:'comms/inbox',     content: <InboxApp /> },
  team:      { title:'Team',      url:'org/team',        content: <TeamApp /> },
  files:     { title:'Files',     url:'storage/files',   content: <FilesApp /> },
  settings:  { title:'Settings',  url:'system/settings', content: <SettingsApp /> },
};

window.APP_CONTENT = APP_CONTENT;
