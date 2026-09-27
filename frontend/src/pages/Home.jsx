import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();
  const [roomName, setRoomName] = useState('demo-room');

  const startMeeting = () => {
    const cleanRoomName = roomName.trim() || 'demo-room';
    navigate(`/videomeet?room=${encodeURIComponent(cleanRoomName)}`);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8fbff 0%, #eef6ff 40%, #f5f7ff 100%)',
      padding: '32px 20px 48px'
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <header style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'rgba(255,255,255,0.8)', border: '1px solid rgba(148,163,184,0.25)',
          borderRadius: 20, padding: '18px 22px', backdropFilter: 'blur(12px)',
          boxShadow: '0 12px 30px rgba(15, 23, 42, 0.06)', marginBottom: 24
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 42, height: 42, borderRadius: 14, background: 'linear-gradient(135deg, #2563eb, #14b8a6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#fff'
            }}>V</div>
            <div>
              <div style={{ fontSize: 12, letterSpacing: 1.5, color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Workspace</div>
              <h2 style={{ margin: 0, fontSize: '1.2rem', color: '#0f172a' }}>Vindex Home</h2>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button style={{ border: '1px solid #cbd5e1', borderRadius: 12, background: '#fff', padding: '10px 14px', color: '#0f172a', cursor: 'pointer' }}>Overview</button>
            <button style={{ border: 'none', borderRadius: 12, background: '#2563eb', color: '#fff', padding: '10px 16px', cursor: 'pointer' }}>New room</button>
          </div>
        </header>

        <section style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 24, marginBottom: 24 }}>
          <div style={{ background: '#0f172a', borderRadius: 26, padding: 28, boxShadow: '0 20px 45px rgba(15, 23, 42, 0.18)', color: '#fff' }}>
            <div style={{ display: 'inline-block', background: 'rgba(59,130,246,0.12)', color: '#93c5fd', padding: '8px 12px', borderRadius: 999, fontWeight: 700, fontSize: 12, letterSpacing: 1.2 }}>Dashboard</div>
            <h1 style={{ margin: '18px 0 10px', fontSize: '3rem', lineHeight: 1.1 }}>Start your next meeting in seconds</h1>
            <p style={{ color: '#cbd5e1', fontSize: '1.04rem', lineHeight: 1.7, marginBottom: 24 }}>
              Create a secure room, invite your team, and launch a real-time conversation with crystal-clear video and instant chat.
            </p>

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 20 }}>
              <input
                value={roomName}
                onChange={(event) => setRoomName(event.target.value)}
                placeholder="Meeting room name"
                style={{
                  flex: 1, minWidth: 220, padding: '14px 16px', borderRadius: 14,
                  border: '1px solid rgba(148,163,184,0.4)', background: 'rgba(15,23,42,0.5)', color: '#fff', fontSize: '1rem'
                }}
              />
              <button onClick={startMeeting} style={{
                padding: '14px 24px', border: 'none', borderRadius: 14,
                background: 'linear-gradient(135deg, #3b82f6, #2563eb)', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: '1rem'
              }}>
                Join meeting
              </button>
            </div>

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <div style={{ background: 'rgba(15, 118, 110, 0.2)', border: '1px solid rgba(20,184,166,0.35)', borderRadius: 14, padding: '10px 14px' }}>
                <div style={{ color: '#99f6e4', fontWeight: 700 }}>HD call</div>
                <div style={{ color: '#d1fae5', fontSize: 12 }}>Live video</div>
              </div>
              <div style={{ background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(96,165,250,0.35)', borderRadius: 14, padding: '10px 14px' }}>
                <div style={{ color: '#bfdbfe', fontWeight: 700 }}>Team chat</div>
                <div style={{ color: '#dbeafe', fontSize: 12 }}>Instant message</div>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gap: 18 }}>
            <div style={{ background: '#fff', borderRadius: 24, padding: 22, boxShadow: '0 18px 36px rgba(15, 23, 42, 0.08)' }}>
              <div style={{ color: '#64748b', fontSize: 13, letterSpacing: 1.3, textTransform: 'uppercase', fontWeight: 700 }}>Today</div>
              <div style={{ fontSize: '2.4rem', fontWeight: 800, color: '#0f172a', marginTop: 10 }}>08</div>
              <div style={{ color: '#475569', marginTop: 6 }}>Meetings scheduled</div>
            </div>

            <div style={{ background: 'linear-gradient(135deg, #ecfeff, #eff6ff)', borderRadius: 24, padding: 22, boxShadow: '0 18px 36px rgba(15, 23, 42, 0.05)' }}>
              <div style={{ color: '#0f172a', fontWeight: 700, marginBottom: 10 }}>Room status</div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ color: '#475569' }}>Active users</span>
                <strong style={{ color: '#0f172a' }}>24</strong>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ color: '#475569' }}>Sessions</span>
                <strong style={{ color: '#0f172a' }}>14</strong>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ color: '#475569' }}>Latency</span>
                <strong style={{ color: '#0f172a' }}>120ms</strong>
              </div>
            </div>
          </div>
        </section>

        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 18 }}>
          <div style={{ background: '#fff', borderRadius: 22, padding: 22, boxShadow: '0 10px 25px rgba(15, 23, 42, 0.06)' }}>
            <div style={{ fontSize: 30, marginBottom: 10 }}>⚡</div>
            <h3 style={{ margin: '0 0 8px', color: '#0f172a' }}>Instant meeting</h3>
            <p style={{ margin: 0, color: '#64748b', lineHeight: 1.7 }}>Create a room and connect in a single click.</p>
          </div>

          <div style={{ background: '#fff', borderRadius: 22, padding: 22, boxShadow: '0 10px 25px rgba(15, 23, 42, 0.06)' }}>
            <div style={{ fontSize: 30, marginBottom: 10 }}>🔒</div>
            <h3 style={{ margin: '0 0 8px', color: '#0f172a' }}>Secure rooms</h3>
            <p style={{ margin: 0, color: '#64748b', lineHeight: 1.7 }}>Room-based access keeps meetings organized.</p>
          </div>

          <div style={{ background: '#fff', borderRadius: 22, padding: 22, boxShadow: '0 10px 25px rgba(15, 23, 42, 0.06)' }}>
            <div style={{ fontSize: 30, marginBottom: 10 }}>💬</div>
            <h3 style={{ margin: '0 0 8px', color: '#0f172a' }}>Live chat</h3>
            <p style={{ margin: 0, color: '#64748b', lineHeight: 1.7 }}>Catch up, share notes, and keep the conversation going.</p>
          </div>
        </section>
      </div>
    </div>
  );
}
