import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

const ShortsEditOptionsPage = () => {
  const [autoCaptions, setAutoCaptions] = useState(true);
  const [captionStyle, setCaptionStyle] = useState('default');
  const [addIntro, setAddIntro] = useState(false);
  const [addOutro, setAddOutro] = useState(false);
  const [watermark, setWatermark] = useState(false);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f6f7fb', fontFamily: 'Montserrat, Inter, Segoe UI, Arial, sans-serif' }}>
      <Sidebar activePage="edit-options" />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Navbar />
        <div style={{ flex: 1, padding: 32, maxWidth: 600, margin: '0 auto' }}>
          <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 24, color: '#1e40af' }}>Shorts Editing Options</h1>
          <form style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <input type="checkbox" checked={autoCaptions} onChange={e => setAutoCaptions(e.target.checked)} />
              Auto-generate captions
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <label style={{ fontWeight: 600 }}>Caption Style:</label>
              <select value={captionStyle} onChange={e => setCaptionStyle(e.target.value)} style={{ padding: 8, borderRadius: 6, border: '1px solid #ccc' }}>
                <option value="default">Default</option>
                <option value="bold">Bold</option>
                <option value="highlight">Highlight</option>
                <option value="subtle">Subtle</option>
              </select>
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <input type="checkbox" checked={addIntro} onChange={e => setAddIntro(e.target.checked)} />
              Add Intro
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <input type="checkbox" checked={addOutro} onChange={e => setAddOutro(e.target.checked)} />
              Add Outro
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <input type="checkbox" checked={watermark} onChange={e => setWatermark(e.target.checked)} />
              Add Watermark
            </label>
            <button type="button" style={{ marginTop: 24, padding: '12px 0', background: 'linear-gradient(45deg, #1e40af, #3b82f6)', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 16, cursor: 'pointer' }}>
              Continue
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ShortsEditOptionsPage; 