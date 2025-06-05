import React from 'react';
import { FaInfoCircle } from 'react-icons/fa';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';

const ProcessingTimeframe = ({ 
  timeframe, 
  setTimeframe, 
  videoDuration, 
  allowedMax, 
  isDarkMode 
}) => {
  return (
    <div style={{ margin: '0 0 14px 0' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <div style={{ 
          fontWeight: 600, 
          fontSize: 13, 
          marginBottom: 10, 
          marginTop: 18, 
          color: isDarkMode ? '#e0e7ef' : '#222' 
        }}>
          Processing Timeframe
        </div>
        <FaInfoCircle 
          title="Select the part of the video to process for shorts." 
          style={{ color: isDarkMode ? '#bbb' : '#888', fontSize: 13, cursor: 'help' }} 
        />
      </div>
      <Slider
        range
        min={0}
        max={videoDuration || 0}
        value={timeframe}
        allowCross={false}
        step={1}
        onChange={([start, end]) => {
          if (end - start > allowedMax) {
            if (timeframe[0] !== start) {
              // User moved the start handle
              setTimeframe([end - allowedMax, end]);
            } else {
              // User moved the end handle
              setTimeframe([start, start + allowedMax]);
            }
          } else {
            setTimeframe([start, end]);
          }
        }}
        trackStyle={[{ backgroundColor: '#2563eb', height: 8 }]}
        handleStyle={[
          { borderColor: '#2563eb', backgroundColor: '#fff', height: 22, width: 22, marginTop: -7 },
          { borderColor: '#2563eb', backgroundColor: '#fff', height: 22, width: 22, marginTop: -7 }
        ]}
        railStyle={{ backgroundColor: '#e0e7ef', height: 8 }}
        disabled={!videoDuration}
      />
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        fontSize: 12, 
        color: isDarkMode ? '#bbb' : '#666', 
        marginTop: 2 
      }}>
        <span>{new Date(timeframe[0] * 1000).toISOString().substr(11, 8)}</span>
        <span>{new Date(timeframe[1] * 1000).toISOString().substr(11, 8)}</span>
      </div>
    </div>
  );
};

export default ProcessingTimeframe; 