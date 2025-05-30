import React, { useState, useEffect, useCallback, useMemo } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Select from 'react-select';
import { supabase } from "../supabase/client";
import { FaSpinner, FaInfoCircle } from 'react-icons/fa';
import { toast } from 'react-toastify';
import languageOptions from '../data/languageOptions';

const templates = [
  { name: 'Hormozi1', img: '/templates/hormozi1.png' },
  { name: 'Hormozi2', img: '/templates/hormozi2.png' },
  { name: 'Karaoke', img: '/templates/karaoke.png' },
  { name: 'Minimal', img: '/templates/minimal.png' },
];

function validateYoutubeUrl(url) {
  if (!url) return false;
  if (url.includes('playlist?list=') || url.includes('list=')) return 'playlist';
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? true : false;
}

const NewDashboard = () => {
  const { isDarkMode } = useTheme();
  const { user } = useAuth();
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);
  const [videoUrl, setVideoUrl] = useState("");
  const [languageCode, setLanguageCode] = useState(null);
  const [captionTranslation, setCaptionTranslation] = useState(false);
  const [timeframe, setTimeframe] = useState([0, 600]);
  const [clipLength, setClipLength] = useState('30s-60s');
  const [selectedTemplate, setSelectedTemplate] = useState(templates[0].name);
  const [advanced, setAdvanced] = useState({
    memeHook: false,
    gameVideo: false,
    hookTitle: false,
    callToAction: false,
    backgroundMusic: false,
  });
  const [layout, setLayout] = useState('auto');
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();
  const inputRef = React.useRef(null);
  const [presets, setPresets] = useState(() => JSON.parse(localStorage.getItem('shortifyPresets') || '[]'));
  const [languageLoading, setLanguageLoading] = useState(false);

  // Helper for YouTube embed
  const getYoutubeId = useCallback((url) => {
    if (!url || url.includes('playlist?list=') || url.includes('list=')) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  }, []);

  const youtubeId = useMemo(() => getYoutubeId(videoUrl), [videoUrl, getYoutubeId]);
  const isPlaylist = useMemo(() => videoUrl && (videoUrl.includes('playlist?list=') || videoUrl.includes('list=')), [videoUrl]);
  const showOptions = useMemo(() => !!youtubeId && !isPlaylist, [youtubeId, isPlaylist]);

  // Handle form submission
  const handleSubmit = useCallback(async (e) => {
    if (e) e.preventDefault();
    setIsProcessing(true);
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      if (!session?.access_token) {
        throw new Error('No active session found');
      }
      const response = await fetch('http://localhost:5000/api/process-video', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ videoId: youtubeId })
      });
      const data = await response.json();
      if (!response.ok) {
        if (response.status === 403) {
          const errorMsg = 'You are out of credits. Please upgrade to Pro to continue.';
          toast.error(errorMsg, { position: 'top-right' });
        } else {
          throw new Error(data.error || 'Failed to process video');
        }
        return;
      }
      // Navigate to ProcessingPage
      if (data && data.jobId) {
        navigate('/processing', { state: { jobId: data.jobId, videoId: youtubeId } });
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsProcessing(false);
    }
  }, [navigate, youtubeId]);

  // Auto-detect language
  const autoDetectLanguage = useCallback(async (videoId) => {
    try {
      const response = await fetch('http://localhost:5000/api/detect-language', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ videoId })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to detect language');
      }

      const data = await response.json();
      return data.languageCode;
    } catch (err) {
      console.error('Language detection error:', err);
      toast.error(`Could not auto-detect language: ${err.message}`);
      return 'en-US'; // Default to English on error
    }
  }, []);

  // Handle URL changes
  const handleUrlChange = useCallback(async (e) => {
    const url = e.target.value;
    setVideoUrl(url);
    if (!url) return;
    const valid = validateYoutubeUrl(url);
    if (valid === 'playlist') {
      toast.error('Playlist URLs are not supported. Please enter a single YouTube video URL.');
      return;
    }
    if (!valid) {
      toast.error('Please enter a valid YouTube video URL.');
      return;
    }
    const vid = getYoutubeId(url);
    if (vid) {
      setLanguageLoading(true);
      const detectedLang = await autoDetectLanguage(vid);
      if (detectedLang) {
        setLanguageCode(detectedLang);
      }
      setLanguageLoading(false);
    }
  }, [getYoutubeId, autoDetectLanguage]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => setScreenWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Auto-focus input on mount
  useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'l') {
        e.preventDefault();
        inputRef.current && inputRef.current.focus();
      }
      if (e.key === 'Enter' && document.activeElement === inputRef.current && showOptions) {
        handleSubmit(e);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showOptions, handleSubmit]);

  const isMobile = screenWidth < 768;

  // Save/load presets
  const savePreset = () => {
    const preset = {
      languageCode, captionTranslation, clipLength, selectedTemplate, advanced, layout
    };
    const newPresets = [preset, ...presets].slice(0, 5);
    setPresets(newPresets);
    localStorage.setItem('shortifyPresets', JSON.stringify(newPresets));
    toast.success('Preset saved!');
  };
  const loadPreset = (preset) => {
    setLanguageCode(preset.languageCode);
    setCaptionTranslation(preset.captionTranslation);
    setClipLength(preset.clipLength);
    setSelectedTemplate(preset.selectedTemplate);
    setAdvanced(preset.advanced);
    setLayout(preset.layout);
    toast.info('Preset loaded!');
  };

  // LanguageSelector component
  const LanguageSelector = ({ languageCode, setLanguageCode, languageLoading, isDarkMode }) => {
    // Find the selected option object or null
    const selectedOption = languageOptions.find(opt => opt.code === languageCode) || null;
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, marginTop: 8 }}>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Select
            value={selectedOption}
            onChange={opt => setLanguageCode(opt ? opt.value : null)}
            options={languageOptions.map(opt => ({ value: opt.code, label: opt.label, flag: opt.flag }))}
            menuPlacement="auto"
            isClearable={false}
            styles={{
              control: (base, state) => ({
                ...base,
                background: isDarkMode ? '#18192a' : '#fff',
                borderColor: state.isFocused ? '#a855f7' : (isDarkMode ? '#333' : '#e0e0e0'),
                color: isDarkMode ? '#f3f4f6' : '#222',
                borderRadius: 8,
                minHeight: 32,
                fontWeight: 500,
                fontSize: 15,
                outline: 'none',
                boxShadow: 'none',
                overflowX: 'hidden',
                minWidth: 220,
                width: 220,
                maxWidth: 240,
                padding: 0,
              }),
              menu: base => ({
                ...base,
                background: isDarkMode ? '#23243a' : '#fff',
                color: isDarkMode ? '#f3f4f6' : '#222',
                borderRadius: 10,
                boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                zIndex: 9999,
                border: isDarkMode ? '1px solid #333' : '1px solid #e0e0e0',
                marginTop: 4,
                minWidth: 220,
                width: 220,
                maxWidth: 240,
                overflowX: 'hidden',
                padding: 0,
              }),
              option: (base, state) => ({
                ...base,
                background: state.isSelected
                  ? (isDarkMode ? '#a855f7' : '#e3e8f7')
                  : state.isFocused
                  ? (isDarkMode ? '#23272f' : '#f3f4f6')
                  : isDarkMode
                  ? '#23243a'
                  : '#fff',
                color: isDarkMode ? '#fff' : '#222',
                fontWeight: state.isSelected ? 600 : 500,
                cursor: 'pointer',
                borderRadius: 6,
                margin: '2px 6px',
                padding: '0px 10px',
                fontSize: 15,
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                overflowX: 'hidden',
                minWidth: 220,
                width: 220,
                maxWidth: 240,
                whiteSpace: 'nowrap',
              }),
              singleValue: base => ({
                ...base,
                color: isDarkMode ? '#fff' : '#222',
                fontWeight: 600,
                fontSize: 15,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                minWidth: 0,
                width: '100%',
                maxWidth: 220,
                overflow: 'hidden',
                whiteSpace: 'nowrap',
                padding: 0,
              }),
            }}
            isSearchable={false}
            components={{
              Option: (props) => (
                <div {...props.innerProps} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 10px', overflowX: 'hidden', whiteSpace: 'nowrap' }}>
                  <span style={{ fontSize: 20, fontFamily: 'Segoe UI Emoji, Apple Color Emoji, Noto Color Emoji, Arial, sans-serif' }}>{props.data.flag}</span>
                  <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{props.data.label}</span>
                </div>
              ),
              SingleValue: (props) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', overflow: 'hidden', whiteSpace: 'nowrap', padding: 0 }}>
                  <span style={{ fontSize: 20, fontFamily: 'Segoe UI Emoji, Apple Color Emoji, Noto Color Emoji, Arial, sans-serif' }}>{props.data.flag}</span>
                  <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{props.data.label}</span>
                </div>
              ),
            }}
          />
          {languageLoading && (
            <FaSpinner className="animate-spin" style={{ fontSize: 18, color: isDarkMode ? '#fff' : '#222' }} />
          )}
        </div>
        <button
          type="button"
          onClick={() => setLanguageCode(null)}
          style={{
            background: isDarkMode ? '#fff' : '#000',
            color: isDarkMode ? '#000' : '#fff',
            border: 'none',
            borderRadius: 8,
            fontWeight: 600,
            fontSize: 13,
            padding: '7px 14px',
            cursor: 'pointer',
            boxShadow: isDarkMode ? '0 1px 4px #23272f22' : '0 1px 4px #e0e7ef22',
            whiteSpace: 'nowrap',
          }}
        >
          Reset Preference
        </button>
      </div>
    );
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: isDarkMode ? '#121212' : '#fafbfc',
      fontFamily: 'Inter, Montserrat, Arial, sans-serif',
      display: 'flex',
      flexDirection: 'row',
    }}>
      <Sidebar isMobile={isMobile} isDarkMode={isDarkMode} activePage="dashboard" />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Navbar userEmail={user?.email} />
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            minHeight: 'calc(100vh - 64px)',
            background: isDarkMode ? '#121212' : '#fafbfc',
            padding: isMobile ? 10 : 0,
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: !showOptions ? 'column' : (isMobile ? 'column' : 'row'),
              alignItems: !showOptions ? 'center' : 'stretch',
              justifyContent: 'center',
              gap: !showOptions ? 0 : (isMobile ? 24 : 40),
              background: isDarkMode
                ? '#23243a'
                : '#fff',
              borderRadius: 22,
              boxShadow: isDarkMode
                ? '0 4px 32px #23272f88, 0 1.5px 8px #23272f33'
                : '0 4px 32px #e0e7ef55, 0 1.5px 8px #e0e7ef22',
              padding: isMobile ? 18 : (!showOptions ? 40 : 36),
              maxWidth: 900,
              width: '100%',
              minWidth: isMobile ? '98vw' : 340,
              margin: isMobile ? '0 1vw' : '32px 0',
              border: isDarkMode ? '1.5px solid #23272f' : '1.5px solid #e0e7ef',
              overflow: 'visible',
              backdropFilter: isDarkMode ? 'blur(2.5px)' : undefined,
            }}
          >
            {/* LEFT COLUMN (or full card if !showOptions) */}
            <div
              style={{
                flex: 1,
                minWidth: 260,
                maxWidth: !showOptions ? 420 : 400,
                display: 'flex',
                flexDirection: 'column',
                gap: 0,
                alignItems: !showOptions ? 'center' : 'stretch',
                justifyContent: 'space-between',
                margin: !showOptions ? '0 auto' : 0,
                width: !showOptions ? '100%' : undefined,
                height: '100%',
              }}
            >
              <div>
                <div style={{ fontWeight: 800, fontSize: 22, marginBottom: 8, letterSpacing: 0.1, textAlign: !showOptions ? 'center' : 'left', color: isDarkMode ? '#f3f4f6' : '#1e293b', textShadow: isDarkMode ? '0 1px 8px #0008' : undefined }}>
                  Create YouTube Shorts
                </div>
                <div style={{ color: isDarkMode ? '#c7c7d9' : '#555', fontSize: 14, marginBottom: 18, textAlign: !showOptions ? 'center' : 'left' }}>
                  Transform your YouTube videos into engaging shorts
                </div>
                {/* Video URL */}
                <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4, alignSelf: 'center', color: isDarkMode ? '#e0e7ef' : '#222', textAlign: 'center' }}>YouTube Video URL</div>
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Paste your YouTube video URL!"
                  value={videoUrl}
                  onChange={handleUrlChange}
                  style={{
                    width: !showOptions ? 320 : '100%',
                    maxWidth: 420,
                    border: `1.5px solid ${isDarkMode ? '#333' : '#e0e0e0'}`,
                    borderRadius: 10,
                    padding: '12px 14px',
                    fontSize: 14,
                    outline: 'none',
                    background: isDarkMode ? '#18192a' : '#fafbfc',
                    color: isDarkMode ? '#f3f4f6' : '#000',
                    margin: '2 auto 18px auto',
                    boxSizing: 'border-box',
                    boxShadow: isDarkMode ? '0 1px 4px #23272f22' : '0 1px 4px #e0e7ef22',
                    textAlign: 'center',
                    display: 'block',
                    '::placeholder': { color: isDarkMode ? '#b0b0c3' : '#888' },
                  }}
                />
                {showOptions && (
                  <>
                    {/* Language & Reset Preference */}
                    <LanguageSelector
                      languageCode={languageCode}
                      setLanguageCode={setLanguageCode}
                      languageLoading={languageLoading}
                      isDarkMode={isDarkMode}
                    />
                    {/* Video Preview (now left) */}
                    {youtubeId && (
                      <div style={{ margin: '0 0 12px 0', borderRadius: 12, overflow: 'hidden', boxShadow: isDarkMode ? '0 2px 8px #23272f33' : '0 2px 8px #e0e7ef33', width: '100%', height: isMobile ? 120 : 160, minHeight: 100, maxHeight: 180 }}>
                        <iframe
                          width="100%"
                          height={isMobile ? 120 : 160}
                          src={`https://www.youtube.com/embed/${youtubeId}`}
                          title="YouTube video preview"
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          style={{ border: 'none', width: '100%', borderRadius: 12, background: '#000', height: '100%', minHeight: 100, maxHeight: 180 }}
                        />
                      </div>
                    )}
                    {/* Processing Timeframe */}
                    <div style={{ margin: '0 0 14px 0' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 10, marginTop: 18, color: isDarkMode ? '#e0e7ef' : '#222' }}>Processing Timeframe</div>
                        <FaInfoCircle title="Select the part of the video to process for shorts." style={{ color: isDarkMode ? '#bbb' : '#888', fontSize: 13, cursor: 'help' }} />
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={600}
                        value={timeframe[1]}
                        onChange={e => setTimeframe([0, Number(e.target.value)])}
                        style={{ width: '100%' }}
                      />
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: isDarkMode ? '#bbb' : '#666', marginTop: 2 }}>
                        <span>00:00:00</span>
                        <span>{new Date(timeframe[1] * 1000).toISOString().substr(11, 8)}</span>
                      </div>
                    </div>
                    {/* Preferred Clip Length */}
                    <div style={{ margin: '0 0 14px 0' }}>
                      <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 10, marginTop: 18, color: isDarkMode ? '#e0e7ef' : '#222' }}>Preferred Clip length</div>
                      <div style={{ display: 'flex', gap: 9 }}>
                        {['<30s', '30s-60s', '60s-90s', 'Original'].map(opt => (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => setClipLength(opt)}
                            style={{
                              background: clipLength === opt ? (isDarkMode ? '#fff' : '#000') : (isDarkMode ? '#23272f' : '#f3f4f6'),
                              color: clipLength === opt ? (isDarkMode ? '#000' : '#fff') : (isDarkMode ? '#f3f4f6' : '#222'),
                              border: 'none',
                              borderRadius: 8,
                              fontWeight: 700,
                              fontSize: 13,
                              padding: '7px 14px',
                              cursor: 'pointer',
                              boxShadow: clipLength === opt ? '0 2px 8px #0002' : 'none',
                            }}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>
                    {/* Layout Selection */}
                    <div style={{ margin: '0 0 14px 0' }}>
                      <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 10, marginTop: 18, color: isDarkMode ? '#e0e7ef' : '#222' }}>Layout</div>
                      <div style={{ display: 'flex', gap: 9 }}>
                        {['auto', 'fill', 'fit', 'square'].map(opt => (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => setLayout(opt)}
                            style={{
                              background: layout === opt ? (isDarkMode ? '#fff' : '#000') : (isDarkMode ? '#23272f' : '#f3f4f6'),
                              color: layout === opt ? (isDarkMode ? '#000' : '#fff') : (isDarkMode ? '#f3f4f6' : '#222'),
                              border: 'none',
                              borderRadius: 8,
                              fontWeight: 700,
                              fontSize: 13,
                              padding: '7px 14px',
                              cursor: 'pointer',
                              boxShadow: layout === opt ? '0 2px 8px #0002' : 'none',
                            }}
                          >
                            {opt.charAt(0).toUpperCase() + opt.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>
                    {/* Advanced Options */}
                    <div style={{ margin: '0 0 14px 0' }}>
                      <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 12, marginTop: 18, color: isDarkMode ? '#e0e7ef' : '#222' }}>Advanced Options</div>
                      <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: 14 }}>
                        {[
                          { key: 'memeHook', label: 'Meme Hook' },
                          { key: 'gameVideo', label: 'Game Video' },
                          { key: 'hookTitle', label: 'Hook Title' },
                          { key: 'callToAction', label: 'Call To Action' },
                          { key: 'backgroundMusic', label: 'Background Music' },
                        ].map(opt => (
                          <label key={opt.key} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 600, color: isDarkMode ? '#f3f4f6' : '#222', background: isDarkMode ? '#18192a' : '#f3f4f6', borderRadius: 8, padding: '7px 14px', boxShadow: isDarkMode ? '0 1px 4px #23272f22' : '0 1px 4px #e0e7ef22', cursor: 'pointer', border: isDarkMode ? '1px solid #23272f' : '1px solid #e0e7ef' }}>
                            <input
                              type="checkbox"
                              checked={advanced[opt.key]}
                              onChange={e => setAdvanced(a => ({ ...a, [opt.key]: e.target.checked }))}
                              style={{
                                width: 20,
                                height: 20,
                                accentColor: isDarkMode ? '#fff' : '#000',
                                borderRadius: 6,
                                border: isDarkMode ? '2px solid #fff' : '2px solid #000',
                                marginRight: 6,
                                cursor: 'pointer',
                              }}
                            />
                            {opt.label}
                          </label>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
            {/* RIGHT COLUMN */}
            {showOptions && (
              <div style={{ width: '100%', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 24, marginBottom: 28, marginTop: 8, color: isDarkMode ? '#e0e7ef' : '#222', textAlign: 'center', letterSpacing: 0.2 }}>Template</div>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gridTemplateRows: '1fr 1fr',
                      gap: 36,
                      width: '100%',
                      maxWidth: 440,
                      margin: '0 auto 40px auto',
                      minHeight: 600,
                      alignItems: 'center',
                      justifyItems: 'center',
                    }}
                  >
                    {templates.slice(0, 4).map(tmpl => (
                      <div
                        key={tmpl.name}
                        onClick={() => setSelectedTemplate(tmpl.name)}
                        style={{
                          width: 180,
                          height: 260,
                          borderRadius: 18,
                          border: selectedTemplate === tmpl.name ? '3px solid #2563eb' : `2px solid ${isDarkMode ? '#23272f' : '#e0e0e0'}`,
                          boxShadow: selectedTemplate === tmpl.name ? '0 0 0 4px #2563eb33, 0 4px 24px #2563eb22' : '0 2px 8px #0001',
                          cursor: 'pointer',
                          background: isDarkMode ? '#23272f' : '#fff',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'border 0.2s, box-shadow 0.2s',
                        }}
                      >
                        <img
                          src={tmpl.img}
                          alt={tmpl.name}
                          style={{
                            width: 170,
                            height: 200,
                            objectFit: 'cover',
                            borderRadius: 14,
                            marginBottom: 10,
                          }}
                        />
                        <span
                          style={{
                            fontWeight: 700,
                            fontSize: 18,
                            color: selectedTemplate === tmpl.name ? '#2563eb' : (isDarkMode ? '#f3f4f6' : '#222'),
                            textAlign: 'center',
                          }}
                        >
                          {tmpl.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Generate Shorts Button */}
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', width: '100%', marginTop: 'auto', minHeight: 60 }}>
                  <button
                    type="button"
                    style={{
                      background: isDarkMode ? 'white' : '#111',
                      color: isDarkMode ? '#111' : 'white',
                      border: 'none', 
                      borderRadius: 6,
                      fontWeight: 600,
                      fontSize: 15,
                      cursor: isProcessing ? 'not-allowed' : 'pointer',
                      height: 44,
                      marginBottom: 14,
                      minWidth: 160,
                      maxWidth: 200,
                      boxSizing: 'border-box',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      opacity: isProcessing ? 0.7 : 1,
                    }}
                    onClick={handleSubmit}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <FaSpinner className="animate-spin" style={{ marginRight: 8 }} />
                        Processing...
                      </span>
                    ) : (
                      'Generate Shorts'
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewDashboard;