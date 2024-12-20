'use client'

import React from 'react';
import Image from 'next/image';
import { convertToBaybayin } from '@/utils/baybayinConverter';
import { useDraggable } from '@/hooks/useDraggable';

type CancellerSupport = {
  '+': boolean;
  'x': boolean;
  ']': boolean;
  '_': boolean;
};

type FontCancellerSupport = {
  'Baybayin Simple': CancellerSupport;
  'Tawbid Ukit': CancellerSupport;
  'Baybayin Kariktan': CancellerSupport;
  'Baybayin Filipino': CancellerSupport;
  'Doctrina Christiana': CancellerSupport;
  'Baybayin Jose Rizal': CancellerSupport;
};

// Add this constant for font-canceller compatibility
const FONT_CANCELLER_SUPPORT: FontCancellerSupport = {
  'Baybayin Simple': {
    '+': true,
    'x': true,
    ']': true,
    '_': true
  },
  'Tawbid Ukit': {
    '+': true,
    'x': true,
    ']': true,
    '_': false
  },
  'Baybayin Kariktan': {
    '+': false,
    'x': false,
    ']': true,
    '_': true
  },
  'Baybayin Filipino': {
    '+': true,
    'x': true,
    ']': true,
    '_': false
  },
  'Doctrina Christiana': {
    '+': true,
    'x': false,
    ']': false,
    '_': false
  },
  'Baybayin Jose Rizal': {
    '+': true,
    'x': false,
    ']': false,
    '_': false
  }
};

// Add this for canceller labels
const CANCELLER_LABELS: Record<string, string> = {
  '+': 'Kurus',
  'x': 'Ekis',
  ']': 'Pamudpod',
  '_': 'Pangaltas'
};

export default function Home() {
  const { position, dragRef, isDragging, isDesktop } = useDraggable();
  const [inputText, setInputText] = React.useState('');
  const [mode, setMode] = React.useState('TAG');
  const [selectedFont, setSelectedFont] = React.useState<keyof FontCancellerSupport>('Baybayin Simple');
  const [selectedCanceller, setSelectedCanceller] = React.useState<keyof CancellerSupport>('+');
  const [tagalogText, setTagalogText] = React.useState('');
  const [cleanTagalogText, setCleanTagalogText] = React.useState('');
  const [fontSize, setFontSize] = React.useState(14);
  const [showBaybayinText, setShowBaybayinText] = React.useState(true);
  const [isAnimating, setIsAnimating] = React.useState(false);
  const [animated, setAnimated] = React.useState<string>('');
  const [isTranslating, setIsTranslating] = React.useState(false);

  const animateText = (
    text: string,
    speed: number = 50
  ) => {
    let index = 0;
    const timer = setInterval(() => {
      if (index < text.length) {
        setAnimated(prev => prev + text[index]);
        index++;
      } else {
        clearInterval(timer);
      }
    }, speed);
  };

  const handleTranslate = async (text: string) => {
    try {
      setIsTranslating(true);
      setShowBaybayinText(false);
      
      let translatedText = '';

      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: text }),
      });

      if (!response.ok) {
        console.warn('Translation response not OK, but continuing...');
        return;
      }

      const reader = response.body?.getReader();
      if (!reader) {
        console.warn('No reader available, but continuing...');
        return;
      }

      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim();
            if (data === '[DONE]') break;
            
            try {
              const parsed = JSON.parse(data);
              if (parsed.text) {
                translatedText += parsed.text;
                
                // Extract the first quoted text
                const match = translatedText.match(/"([^"]+)"/);
                if (match && match[1]) {
                  const cleanText = match[1].trim();
                  setCleanTagalogText(cleanText);
                }
                
                setTagalogText(translatedText);
              }
            } catch (e) {
              console.warn('Parse warning:', e);
              continue;
            }
          }
        }
      }
      
      if (mode === 'ENG') {
        setTimeout(() => {
          setShowBaybayinText(true);
          setIsAnimating(true);
          // Animation will reset after 2 seconds
          setTimeout(() => setIsAnimating(false), 2000);
        }, 2500);
      }
    } catch (error) {
      console.error('Translation error:', error);
    } finally {
      setIsTranslating(false);
    }
  };

  const handleInputChange = async (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setInputText(newText);
    
    if (mode === 'ENG' && newText.trim()) {
      try {
        await handleTranslate(newText);
      } catch (error) {
        console.error('Translation error:', error);
      }
    }
  };

  const getBaybayinText = () => {
    if (mode === 'TAG') {
      return convertToBaybayin(inputText, selectedCanceller, selectedFont);
    } else {
      const textToConvert = cleanTagalogText || '';
      console.log('Converting to Baybayin:', textToConvert);
      return convertToBaybayin(textToConvert, selectedCanceller, selectedFont);
    }
  };

  // Function to get the correct font family based on selection
  const getBaybayinFontFamily = () => {
    switch(selectedFont) {
      case 'Baybayin Simple':
        return 'Baybayin Simple';
      case 'Tawbid Ukit':
        return 'Tawbid Ukit';
      case 'Baybayin Kariktan':
        return 'Baybayin Kariktan';
      case 'Baybayin Filipino':
        return 'Baybayin Filipino';
      case 'Doctrina Christiana':
        return 'Doctrina Christiana';
      case 'Baybayin Jose Rizal':
        return 'Baybayin Jose Rizal';
      default:
        return 'Baybayin Simple';
    }
  };

  // Add handler for font change to ensure valid canceller
  const handleFontChange = (newFont: keyof FontCancellerSupport) => {
    setSelectedFont(newFont);
    
    // If current canceller isn't supported by new font, switch to first available
    if (!FONT_CANCELLER_SUPPORT[newFont][selectedCanceller]) {
      const firstAvailable = (Object.entries(FONT_CANCELLER_SUPPORT[newFont])
        .find(([_, supported]) => supported)?.[0] || '+') as keyof CancellerSupport;
      setSelectedCanceller(firstAvailable);
    }
  };

  const handleFontSize = (change: number) => {
    setFontSize(prev => {
      const newSize = prev + change;
      return Math.min(Math.max(newSize, 8), 42); // Clamp between 8 and 42
    });
  };

  return (
    <main 
      className="min-h-screen flex flex-col relative"
      style={{
        background: 'linear-gradient(65deg, #F2EBDA, #FFFFFF)'
      }}
    >
      {/* 1. Simple animated gradient header row with clear colors */}
      <div className="
        w-full h-[5px] shrink-0
        bg-gradient-to-r 
        from-blue-500 
        via-green-500 
        via-yellow-400 
        via-orange-500 
        via-red-500 
        via-pink-500 
        to-purple-600
        animate-gradient 
        bg-[length:200%_auto]
      " />

      {/* 2. Header section with Helvetica-like subtitle */}
      <div className="w-full h-[80px] md:h-[95px] lg:h-[110px] flex shrink-0">
        <div className="
          w-[7px]                    /* Mobile & Tablet Portrait */
          lg:w-[15%] xl:w-1/5       /* Tablet Landscape & Desktop */
        " />

        {/* Center column with updated title styles */}
        <div className="
          flex-1                     /* Mobile & Tablet Portrait */
          lg:w-[70%] xl:w-[60%]     /* Tablet Landscape & Desktop */
          py-5                       /* 5px top/bottom padding */
        ">
          <div className="flex flex-col">
            <h1 className="
              text-3xl md:text-4xl lg:text-5xl 
              font-serif 
              tracking-tight 
              text-black
            ">
              Salin B{'{ai}'}bayin
            </h1>
            
            <div className="flex items-center gap-2">
              <h2 className="
                text-sm md:text-base lg:text-lg
                font-['Helvetica_Neue','Helvetica','Arial','sans-serif']
                font-normal
                tracking-wide
                text-black
              ">
                Baybayin AI Writing Pad
              </h2>
              <span className="
                text-[10px] md:text-xs
                px-1
                bg-[#F7931E]
                font-['Helvetica_Neue','Helvetica','Arial','sans-serif']
                font-normal
                text-black
              ">
                BETA
              </span>
            </div>
          </div>
        </div>

        <div className="
          w-[7px]                    /* Mobile & Tablet Portrait */
          lg:w-[15%] xl:w-1/5       /* Tablet Landscape & Desktop */
        " />
      </div>

      {/* 3. Main section */}
      <div className="w-full flex flex-grow">
        <div className="w-[7px] md:w-[15%] lg:w-1/4" />

        {/* Middle column */}
        <div className="flex-1 md:w-[70%] lg:w-1/2 flex flex-col">
          {/* Top row with dropdowns */}
          <div className="w-full h-[25px] shrink-0 flex justify-end items-center gap-2">
            {/* Controls container */}
            <div className="flex gap-2 items-center">
              {/* Font size control */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleFontSize(-1)}
                  className="text-xs hover:opacity-70 select-none"
                  aria-label="Decrease font size"
                >
                  -
                </button>
                <span className="text-xs select-none w-[20px] text-center">
                  {fontSize}
                </span>
                <button
                  onClick={() => handleFontSize(1)}
                  className="text-xs hover:opacity-70 select-none"
                  aria-label="Increase font size"
                >
                  +
                </button>
              </div>

              {/* Font selection dropdown (existing) */}
              <select
                value={selectedFont}
                onChange={(e) => handleFontChange(e.target.value as keyof FontCancellerSupport)}
                className="
                  h-[18px] 
                  w-[120px]
                  rounded-sm
                  bg-white 
                  border border-black 
                  text-xs
                  focus:outline-none
                  [&>option]:bg-white
                  [&>option:hover]:bg-[#C9F0F4]
                  [&>option:checked]:bg-[#C9F0F4]
                "
              >
                {Object.keys(FONT_CANCELLER_SUPPORT).map((font) => (
                  <option key={font} value={font}>
                    {font}
                  </option>
                ))}
              </select>

              {/* Vowel canceller dropdown - size matched to font dropdown */}
              <select
                value={selectedCanceller}
                onChange={(e) => setSelectedCanceller(e.target.value as keyof CancellerSupport)}
                className="
                  /* Size and Shape - matched exactly */
                  h-[18px]
                  w-[25px]
                  border border-black
                  rounded-none
                  
                  /* Text */
                  text-center
                  font-['Baybayin Simple']
                  text-[11px]
                  leading-none
                  
                  focus:outline-none
                  [&>option]:bg-white
                  [&>option:hover]:bg-[#C9F0F4]
                  [&>option:checked]:bg-[#C9F0F4]
                  
                  /* Dropdown arrow removal */
                  appearance-none
                "
              >
                {Object.keys(CANCELLER_LABELS).map((value) => (
                  <option
                    key={value}
                    value={value}
                    disabled={!FONT_CANCELLER_SUPPORT[selectedFont][value as keyof CancellerSupport]}
                    className="
                      font-['Baybayin Simple']
                      text-center
                      text-[13px]
                    "
                  >
                    {value}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Container for textboxes */}
          <div className="flex-grow flex justify-center items-start px-4 relative">
            {mode === 'TAG' ? (
              // Single mode (TAG) - Original Baybayin output
              <div className="
                w-[98%] md:w-[92%] lg:w-[80%] xl:w-[60%]              
                h-[90%] md:h-[94%] lg:h-[90%]
                bg-white border border-black
                shadow-[4px_4px_0px_0px_rgba(191,179,140,0.35)]
                overflow-auto p-[15px] relative
              ">
                <span className={`text-gray-400 text-sm select-none ${convertToBaybayin(inputText, selectedCanceller, selectedFont) ? 'hidden' : ''}`}>
                  Baybayin
                </span>

                {/* Baybayin converted text with proper font */}
                <div 
                  className="mt-2 whitespace-pre-wrap"
                  style={{ 
                    fontFamily: getBaybayinFontFamily(),
                    fontSize: `${fontSize}pt`
                  }}
                >
                  {convertToBaybayin(inputText, selectedCanceller, selectedFont)}
                </div>

                {/* Footer logo */}
                <Image
                  src="/img/logo-bkkpnpl.png"
                  alt="Bukod kang pinagpala"
                  width={110}
                  height={30}
                  className="absolute bottom-2 left-4 opacity-90"
                />
              </div>
            ) : (
              // Dual mode (ENG) - Baybayin and Tagalog outputs
              <div className="
                /* Width */
                w-[98%] md:w-[92%] lg:w-[90%]
                /* Height */
                h-[90%] md:h-[94%] lg:h-[90%]
                /* Layout */
                flex
                flex-col md:flex-col lg:flex-row    /* Stack on mobile/tablet portrait, row on landscape/desktop */
                gap-2
              ">
                {/* Baybayin output */}
                <div className="
                  /* Width */
                  w-full                            /* Full width when stacked */
                  lg:w-[55%]                        /* 55% on landscape/desktop */
                  /* Height */
                  h-[50%]                           /* Half height when stacked */
                  md:h-[50%]
                  lg:h-full                         /* Full height on landscape/desktop */
                  /* Styling */
                  bg-white border border-black
                  shadow-[4px_4px_0px_0px_rgba(191,179,140,0.35)]
                  overflow-auto p-[15px] relative
                ">
                  <div className="mt-2 whitespace-pre-wrap">
                    {mode === 'ENG' && cleanTagalogText ? (
                      <div
                        style={{ 
                          fontFamily: getBaybayinFontFamily(),
                          fontSize: `${fontSize}pt`,
                          opacity: showBaybayinText ? 1 : 0,
                          transition: 'opacity 0.5s ease-in-out'
                        }}
                        className={isAnimating ? 'animate-typing' : ''}
                      >
                        {convertToBaybayin(cleanTagalogText, selectedCanceller, selectedFont)}
                      </div>
                    ) : (
                      <span className="text-gray-400 text-sm select-none">
                        Baybayin
                      </span>
                    )}
                  </div>

                  {/* Footer logo */}
                  <Image
                    src="/img/logo-bkkpnpl.png"
                    alt="Bukod kang pinagpala"
                    width={110}
                    height={30}
                    className="
                      absolute
                      bottom-2
                      left-4
                      opacity-90
                    "
                  />
                </div>

                {/* Tagalog output */}
                <div className="
                  w-full lg:w-[45%]
                  h-[50%] md:h-[50%] lg:h-full
                  bg-white border border-black
                  shadow-[4px_4px_0px_0px_rgba(191,179,140,0.35)]
                  overflow-auto p-[15px] relative
                  opacity-90
                ">
                  <span className={`text-gray-400 text-[11px] font-['Helvetica_Neue','Helvetica','Arial','sans-serif'] select-none ${tagalogText ? 'hidden' : ''}`}>
                    Tagalog
                  </span>
                  
                  {tagalogText && tagalogText.split('\n').map((part, index) => (
                    <div 
                      key={index} 
                      className={
                        index === 0 
                          ? "text-[11pt]" 
                          : "text-[9pt] italic opacity-80 mt-4"
                      }
                    >
                      {part}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Input textbox */}
            <div
              ref={dragRef}
              className={`w-[96%] md:w-[70%] lg:w-[45%] xl:w-[55%] h-[26vh] md:h-[20vh] lg:h-[24vh] xl:h-[24vh] absolute ${mode === 'TAG' ? 'bottom-[15%]' : 'bottom-[5%]'} left-1/2 -translate-x-1/2 md:translate-x-0 md:bottom-auto md:top-[20%] md:right-[5%] md:left-auto border border-black shadow-[7px_7px_0px_0px_rgba(191,179,140,0.30)] flex flex-col z-10 ${isDragging ? 'md:cursor-grabbing' : ''} ${isDragging ? '' : 'transition-transform duration-200 ease-out'}`}
              style={{
                transform: isDesktop ? `translate(${position.x}px, ${position.y}px)` : undefined
              }}
            >
              {/* Terminal top bar */}
              <div className="
                h-[25px]
                bg-[#E5DFD6]
                border-b border-black
                flex items-center
                justify-between
                px-2
                terminal-top-bar
                md:cursor-grab
                select-none
              ">
                {/* Left side: macOS-like controls */}
                <div className="flex items-center gap-1.5">
                  <div className="w-[9px] h-[9px] bg-[#FF5F56] border border-black rounded-full"></div>
                  <div className="w-[9px] h-[9px] bg-[#FFBD2E] border border-black rounded-full"></div>
                  <div className="w-[9px] h-[9px] bg-[#27C93F] border border-black rounded-full"></div>
                </div>

                {/* Right side: Language toggle */}
                <button 
                  onClick={() => {
                    const newMode = mode === 'TAG' ? 'ENG' : 'TAG';
                    console.log('Switching to mode:', newMode);
                    setMode(newMode);
                    setInputText('');
                  }}
                  className="
                    flex items-center gap-1.5
                    text-[11px]
                    font-['Helvetica_Neue','Arial',sans-serif]
                    hover:opacity-80
                    transition-opacity
                    pr-2
                  "
                >
                  <span>{mode}</span>
                  {mode === 'TAG' ? (
                    <svg 
                      width="8.8" 
                      height="11" 
                      viewBox="0 0 8 10" 
                      fill="none" 
                      xmlns="http://www.w3.org/2000/svg"
                      className="stroke-current"
                    >
                      <rect x="0.5" y="0.5" width="7" height="9" stroke="currentColor" strokeWidth="1" fill="none"/>
                    </svg>
                  ) : (
                    <svg 
                      width="12.1" 
                      height="11" 
                      viewBox="0 0 11 10" 
                      fill="none" 
                      xmlns="http://www.w3.org/2000/svg"
                      className="stroke-current"
                    >
                      <rect x="0.5" y="0.5" width="4.5" height="9" stroke="currentColor" strokeWidth="1" fill="none"/>
                      <rect x="5" y="0.5" width="4.5" height="9" stroke="currentColor" strokeWidth="1" fill="none"/>
                    </svg>
                  )}
                </button>
              </div>

              {/* Main input area */}
              <div className="flex-grow bg-[#FBB03B] p-[15px]">
                <textarea
                  value={inputText}
                  onChange={handleInputChange}
                  placeholder={mode === 'TAG' 
                    ? "Ano ang gusto mong i-salin sa Baybayin?"
                    : "What do you want to write in Baybayin?"
                  }
                  aria-label={mode === 'TAG' 
                    ? "Ano ang gusto mong i-salin sa Baybayin?"
                    : "What do you want to write in Baybayin?"
                  }
                  className="
                    w-full h-full
                    bg-transparent
                    resize-none
                    border-none
                    focus:outline-none
                    text-black
                    placeholder:text-black/40
                    placeholder:select-none
                    text-[11pt]
                  "
                />
              </div>
            </div>
          </div>
        </div>

        <div className="w-[7px] md:w-[15%] lg:w-1/4" />
      </div>

      {/* 4. Footer row with smaller text */}
      <div className="
        w-full h-[25px] shrink-0
        flex justify-between items-center
        text-[10px] text-gray-600 font-sans
      ">
        {/* Left side content */}
        <div className="pl-[7px] flex items-center gap-1">
          <span>London, UK 2024 |</span>
          <span>Buy me a</span>
          <a 
            href="https://ko-fi.com/johnleyson" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center hover:opacity-80 transition-opacity"
          >
            <Image
              src="/img/ko-fi-cup.webp"
              alt="Ko-fi cup"
              width={12}
              height={12}
              className="inline-block"
            />
          </a>
        </div>

        {/* Right side content */}
        <div className="pr-[7px] flex items-center gap-1">
          <span>Powered by</span>
          <a 
            href="https://groq.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-[#FF6F29] hover:opacity-80 transition-opacity"
          >
            Groq
          </a>
          <span>. Built by</span>
          <a 
            href="https://resvrgam.co.uk" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-black font-sans hover:opacity-80 transition-opacity"
          >
            RESVRGAM.ai
          </a>
        </div>
      </div>
    </main>
  );
}
