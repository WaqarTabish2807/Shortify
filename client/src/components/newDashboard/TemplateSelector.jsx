import React from 'react';

const templates = [
  { name: 'Hormozi', demo: '/templates/hormozi.mp4' },
  { name: 'Ali Abdal', demo: '/templates/Ali-abdal.mp4' },
  { name: 'Iman Ghadzi', demo: '/templates/iman-ghadzi.mp4' },
  { name: 'Minimal', demo: '/templates/simple.mp4' },
];

const TemplateSelector = ({ selectedTemplate, setSelectedTemplate, isDarkMode }) => {
  return (
    <div>
      <div style={{ 
        fontWeight: 800, 
        fontSize: 24, 
        marginBottom: 28, 
        marginTop: 8, 
        color: isDarkMode ? '#e0e7ef' : '#222', 
        textAlign: 'center', 
        letterSpacing: 0.2 
      }}>
        Template
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gridTemplateRows: '1fr 1fr',
          gap: 36,
          width: '100%',
          maxWidth: 440,
          margin: '0 auto 40px auto',
          minHeight: 400,
          alignItems: 'center',
          justifyItems: 'center',
        }}
      >
        {templates.slice(0, 4).map(tmpl => (
          <div
            key={tmpl.name}
            style={{
              width: 180,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'flex-start',
              position: 'relative',
              paddingTop: 10,
              background: 'transparent',
              boxShadow: 'none'
            }}
          >
            {tmpl.demo && (
              <video
                src={tmpl.demo}
                width={180}
                height={290}
                style={{
                  objectFit: 'cover',
                  borderRadius: 18,
                  width: 180,
                  height: 290,
                  background: '#000',
                }}
                autoPlay
                muted
                loop
                playsInline
              />
            )}
            <button
              type="button"
              onClick={() => setSelectedTemplate(tmpl.name)}
              style={{
                marginTop: 18,
                background: selectedTemplate === tmpl.name ? '#2563eb' : (isDarkMode ? '#fff' : '#000'),
                color: selectedTemplate === tmpl.name ? '#fff' : (isDarkMode ? '#000' : '#fff'),
                border: 'none',
                borderRadius: 8,
                fontWeight: 700,
                fontSize: 16,
                padding: '8px 22px',
                boxShadow: '0 2px 8px #0002',
                textAlign: 'center',
                cursor: 'pointer',
                zIndex: 2,
                letterSpacing: 0.2,
                transition: 'background 0.18s, color 0.18s',
              }}
            >
              {tmpl.name}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TemplateSelector; 