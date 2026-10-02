import React from 'react';
import Svg, { Defs, Pattern, Path, Rect, Circle, G } from 'react-native-svg';

const HeritageIcons = {
  Home: ({ size = 22, color = '#D4A373' }: { size?: number; color?: string }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1h-5v-6a2 2 0 0 0-4 0v6H4a1 1 0 0 1-1-1V9.5z" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  ),
  Clock: ({ size = 22, color = '#D4A373' }: { size?: number; color?: string }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth="1.8" />
      <Path d="M12 7v5l3 3" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  ),
  QuranBook: ({ size = 22, color = '#D4A373' }: { size?: number; color?: string }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 19.5A2.5 2.5 0 0 0 6.5 22H20V2H6.5A2.5 2.5 0 0 0 4 4.5v15z" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M9 7h6M9 11h4" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </Svg>
  ),
  Rosary: ({ size = 22, color = '#D4A373' }: { size?: number; color?: string }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="10" r="6" stroke={color} strokeWidth="1.8" strokeDasharray="3 3" />
      <Path d="M12 16v5M10 21h4" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      <Circle cx="12" cy="4" r="1.2" fill={color} />
      <Circle cx="16.5" cy="6.5" r="1.2" fill={color} />
      <Circle cx="7.5" cy="6.5" r="1.2" fill={color} />
    </Svg>
  ),
  Sun: ({ size = 22, color = '#D4A373' }: { size?: number; color?: string }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="4.5" stroke={color} strokeWidth="1.8" />
      <Path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.93 4.93l1.8 1.8M17.27 17.27l1.8 1.8M4.93 19.07l1.8-1.8M17.27 6.73l1.8-1.8" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    </Svg>
  ),
  Crescent: ({ size = 22, color = '#D4A373' }: { size?: number; color?: string }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  ),
  Mosque: ({ size = 22, color = '#D4A373' }: { size?: number; color?: string }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 3c-2 3-5 5-5 9v9h10v-9c0-4-3-6-5-9z" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M10 21v-4a2 2 0 0 1 4 0v4M4 14v7M20 14v7M2 21h20" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  ),
  Sunrise: ({ size = 22, color = '#D4A373' }: { size?: number; color?: string }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M17 18a5 5 0 0 0-10 0M12 3v5M4.22 10.22l2.83 2.83M19.78 10.22l-2.83 2.83M2 18h20M2 22h20" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  ),
  Door: ({ size = 22, color = '#D4A373' }: { size?: number; color?: string }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16M3 21h18M15 11h.01" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  ),
  IslamicStar: ({ size = 22, color = '#D4A373' }: { size?: number; color?: string }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="4.5" y="4.5" width="15" height="15" stroke={color} strokeWidth="1.6" />
      <Rect x="4.5" y="4.5" width="15" height="15" stroke={color} strokeWidth="1.6" transform="rotate(45 12 12)" />
      <Circle cx="12" cy="12" r="2.5" fill={color} />
    </Svg>
  ),
  Chat: ({ size = 22, color = '#D4A373' }: { size?: number; color?: string }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  ),
  Chart: ({ size = 22, color = '#D4A373' }: { size?: number; color?: string }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M18 20V10M12 20V4M6 20v-6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  ),
  Trophy: ({ size = 22, color = '#D4A373' }: { size?: number; color?: string }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M8 21h8m-4-9v9m-5-13H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h3m10 0h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2h-3M6 5a6 6 0 1 0 12 0H6z" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  ),
  Kaaba: ({ size = 22, color = '#D4A373' }: { size?: number; color?: string }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="4" y="4" width="16" height="16" rx="2" stroke={color} strokeWidth="1.8" />
      <Path d="M4 9h16M12 4v16" stroke={color} strokeWidth="1.4" strokeDasharray="2 2" />
      <Circle cx="12" cy="14" r="1.5" fill={color} />
    </Svg>
  ),
  // Settings (gear) — instead of the ⚙️ emoji, which renders in the system colour rather than gold
  Gear: ({ size = 22, color = '#D4A373' }: { size?: number; color?: string }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="3.2" stroke={color} strokeWidth="1.8" />
      <Path
        d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1.03 1.56V21a2 2 0 1 1-4 0v-.09a1.7 1.7 0 0 0-1.11-1.56 1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.7 1.7 0 0 0 .34-1.87 1.7 1.7 0 0 0-1.56-1.03H3a2 2 0 1 1 0-4h.09a1.7 1.7 0 0 0 1.56-1.11 1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.7 1.7 0 0 0 1.87.34H9a1.7 1.7 0 0 0 1.03-1.56V3a2 2 0 1 1 4 0v.09a1.7 1.7 0 0 0 1.03 1.56 1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.7 1.7 0 0 0-.34 1.87V9a1.7 1.7 0 0 0 1.56 1.03H21a2 2 0 1 1 0 4h-.09a1.7 1.7 0 0 0-1.56 1.03z"
        stroke={color}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  ),
  // Share (three connected nodes) — instead of the word "share" on the verse and hadith buttons
  Share: ({ size = 22, color = '#D4A373' }: { size?: number; color?: string }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="18" cy="5" r="2.8" stroke={color} strokeWidth="1.8" />
      <Circle cx="6" cy="12" r="2.8" stroke={color} strokeWidth="1.8" />
      <Circle cx="18" cy="19" r="2.8" stroke={color} strokeWidth="1.8" />
      <Path d="M8.5 13.5l7 4M15.5 6.5l-7 4" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    </Svg>
  ),
  // Reed pen — hadith card title
  Qalam: ({ size = 22, color = '#D4A373' }: { size?: number; color?: string }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M5 19L17.5 4.5l2 2L7 21z" stroke={color} strokeWidth="1.6" strokeLinejoin="round" />
      <Path d="M17.5 4.5L20.5 2l-1 4.5" stroke={color} strokeWidth="1.6" strokeLinejoin="round" />
      <Path d="M3 22c2-1.5 3.5-1 5-.5" stroke={color} strokeWidth="1.4" strokeLinecap="round" />
    </Svg>
  ),
  // Shamsa — the radiant rosette decorating the Names of Allah in illuminated mushafs
  Shamsa: ({ size = 22, color = '#D4A373' }: { size?: number; color?: string }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="4.2" stroke={color} strokeWidth="1.6" />
      <Circle cx="12" cy="12" r="1.4" fill={color} />
      <Path
        d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1"
        stroke={color}
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </Svg>
  ),
};


export { HeritageIcons };
