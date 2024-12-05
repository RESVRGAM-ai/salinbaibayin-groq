/**
 * Baybayin Script Converter with Special Font Support
 * 
 * Font-Specific Features:
 * This converter includes special support for the Baybayin SIMPLE 2018 TRS font,
 * which implements a unique historical-modern distinction for the vowel 'A/a':
 * 
 * - Capital 'A' [ASCII 0041]: Displays the historical APIS root form (ᜀ-like glyph with extra curl)
 *   Used in educational contexts to show the character's historical evolution
 * 
 * - Lowercase 'a' [ASCII 0061]: Displays the modern simplified form (ᜀ-like glyph)
 *   Used for contemporary writing
 * 
 * This distinction is based on research from "Anatomya ng Baybayin" by John NL Leyson,
 * which traces the evolution of Baybayin characters from their APIS roots.
 * 
 * Special Cases:
 * 1. A/a distinction: Preserves case to trigger appropriate font glyphs
 * 2. "mga"/"Mga": Handled as "ma-nga" (ᜋᜅ) without vowel deleter on 'm',
 *    reflecting historical "manga"/"ma-nga" pronunciation
 */

const baybayinMap: { [key: string]: string } = {
  // Historical vs Modern 'A' forms
  'A': 'A', 'a': 'a',
  // Standard vowels
  'e': 'ᜁ', 'i': 'ᜁ', 'o': '', 'u': 'ᜂ',
  // Nga as a basic syllabic character (like ba, ka, da, etc.)
  'nga': 'ᜅ', 'nge': 'ᜅᜒ', 'ngi': 'ᜅᜒ', 'ngo': 'ᜅᜓ', 'ngu': 'ᜅᜓ',
  'Nga': 'ᜅ', // Capital case preserved
  'ng': 'ᜅ᜔', // Standalone with vowel canceller
  // Special mapping for "mga" as a single unit
  'mga': 'ᜋᜄ',
  'Mga': 'ᜋᜄ',
  // Rest of syllables
  'ba': 'ᜊ', 'be': 'ᜊᜒ', 'bi': 'ᜊᜒ', 'bo': 'ᜊᜓ', 'bu': 'ᜊᜓ',
  'ka': 'ᜃ', 'ke': 'ᜃᜒ', 'ki': 'ᜃᜒ', 'ko': 'ᜃᜓ', 'ku': 'ᜃᜓ',
  'da': 'ᜇ', 'de': 'ᜇᜒ', 'di': 'ᜇᜒ', 'do': 'ᜇᜓ', 'du': 'ᜇᜓ',
  'ga': 'ᜄ', 'ge': 'ᜄᜒ', 'gi': 'ᜄᜒ', 'go': 'ᜄᜓ', 'gu': 'ᜄᜓ',
  'ha': 'ᜑ', 'he': 'ᜑᜒ', 'hi': 'ᜑᜒ', 'ho': 'ᜑᜓ', 'hu': 'ᜑᜓ',
  'la': 'ᜎ', 'le': 'ᜎᜒ', 'li': 'ᜎᜒ', 'lo': 'ᜎᜓ', 'lu': 'ᜎᜓ',
  'ma': 'ᜋ', 'me': 'ᜋᜒ', 'mi': 'ᜋᜒ', 'mo': 'ᜋᜓ', 'mu': 'ᜋᜓ',
  'na': 'ᜈ', 'ne': 'ᜈᜒ', 'ni': 'ᜈᜒ', 'no': 'ᜈᜓ', 'nu': 'ᜈᜓ',
  'pa': 'ᜉ', 'pe': 'ᜉᜒ', 'pi': 'ᜉᜒ', 'po': 'ᜉᜓ', 'pu': 'ᜉᜓ',
  'ra': 'ᜍ', 're': 'ᜍᜒ', 'ri': 'ᜍᜒ', 'ro': 'ᜍᜓ', 'ru': 'ᜍᜓ',
  'sa': 'ᜐ', 'se': 'ᜐᜒ', 'si': 'ᜐᜒ', 'so': 'ᜐᜓ', 'su': 'ᜐᜓ',
  'ta': 'ᜆ', 'te': 'ᜆᜒ', 'ti': 'ᜆᜒ', 'to': 'ᜆᜓ', 'tu': 'ᜆᜓ',
  'wa': 'ᜏ', 'we': 'ᜏᜒ', 'wi': 'ᜏᜒ', 'wo': 'ᜏᜓ', 'wu': 'ᜏᜓ',
  'ya': 'ᜌ', 'ye': 'ᜌᜒ', 'yi': 'ᜌᜒ', 'yo': 'ᜌᜓ', 'yu': 'ᜌᜓ',
  // Rest of syllables in Latin uppercase
  'Ba': 'ᜊ', 'Be': 'ᜊᜒ', 'Bi': 'ᜊᜒ', 'Bo': 'ᜊᜓ', 'Bu': 'ᜊᜓ',
  'Ka': 'ᜃ', 'Ke': 'ᜃᜒ', 'Ki': 'ᜃᜒ', 'Ko': 'ᜃᜓ', 'Ku': 'ᜃᜓ',
  'Da': 'ᜇ', 'De': 'ᜇᜒ', 'Di': 'ᜇᜒ', 'Do': 'ᜇᜓ', 'Du': 'ᜇᜓ',
  'Ga': 'ᜄ', 'Ge': 'ᜄᜒ', 'Gi': 'ᜄᜒ', 'Go': 'ᜄᜓ', 'Gu': 'ᜄᜓ',
  'Ha': 'ᜑ', 'He': 'ᜑᜒ', 'Hi': 'ᜑᜒ', 'Ho': 'ᜑᜓ', 'Hu': 'ᜑᜓ',
  'La': 'ᜎ', 'Le': 'ᜎᜒ', 'Li': 'ᜎᜒ', 'Lo': 'ᜎᜓ', 'Lu': 'ᜎᜓ',
  'Ma': 'ᜋ', 'Me': 'ᜋᜒ', 'Mi': 'ᜋᜒ', 'Mo': 'ᜋᜓ', 'Mu': 'ᜋᜓ',
  'Na': 'ᜈ', 'Ne': 'ᜈᜒ', 'Ni': 'ᜈᜒ', 'No': 'ᜈᜓ', 'Nu': 'ᜈᜓ',
  'Pa': 'ᜉ', 'Pe': 'ᜉᜒ', 'Pi': 'ᜉᜒ', 'Po': 'ᜉᜓ', 'Pu': 'ᜉᜓ',
  'Ra': 'ᜍ', 'Re': 'ᜍᜒ', 'Ri': 'ᜍᜒ', 'Ro': 'ᜍᜓ', 'Ru': 'ᜍᜓ',
  'Sa': 'ᜐ', 'Se': 'ᜐᜒ', 'Si': 'ᜐᜒ', 'So': 'ᜐᜓ', 'Su': 'ᜐᜓ',
  'Ta': 'ᜆ', 'Te': 'ᜆᜒ', 'Ti': 'ᜆᜒ', 'To': 'ᜆᜓ', 'Tu': 'ᜆᜓ',
  'Wa': 'ᜏ', 'We': 'ᜏᜒ', 'Wi': 'ᜏᜒ', 'Wo': 'ᜏᜓ', 'Wu': 'ᜏᜓ',
  'Ya': 'ᜌ', 'Ye': 'ᜌᜒ', 'Yi': 'ᜌᜒ', 'Yo': 'ᜌᜓ', 'Yu': 'ᜌᜓ',
  // Keep default deleter for standalone consonants
  'b': 'ᜊ᜔', 'k': 'ᜃ᜔', 'd': 'ᜇ᜔', 'g': 'ᜄ᜔', 'h': 'ᜑ᜔',
  'l': 'ᜎ᜔', 'm': 'ᜋ᜔', 'p': 'ᜉ᜔', 'r': 'ᜍ᜔', 's': 'ᜐ᜔',
  't': 'ᜆ᜔', 'w': 'ᜏ᜔', 'y': 'ᜌ᜔', 'n': 'ᜈ᜔',
};

// Type definition for vowel cancellation marks
type VowelCancellerType = {
  symbol: string;
  name: string;
  description: string;
  isModern: boolean;
  fontDependent: boolean;
};


const baseConsonantMap: { [key: string]: string } = {
  'b': 'ᜊ', 'k': 'ᜃ', 'd': 'ᜇ', 'g': 'ᜄ', 'h': 'ᜑ',
  'l': 'ᜎ', 'm': 'ᜋ', 'p': 'ᜉ', 'r': 'ᜍ', 's': 'ᜐ',
  't': 'ᜆ', 'w': 'ᜏ', 'y': 'ᜌ', 'ng': 'ᜅ', 'n': 'ᜈ'
};

const VOWEL_CANCELLERS: { [key: string]: VowelCancellerType } = {
  'x': {
    symbol: 'x',
    name: 'Ekis',
    description: 'Traditional rotated cross symbol placed below the character to cancel vowel sound',
    isModern: false,
    fontDependent: true,
  },
  ']': {
    symbol: ']',
    name: 'Pamudpod',
    description: 'Traditional close bracket symbol placed next to the character to cancel vowel sound',
    isModern: false,
    fontDependent: true,
  },
  '_': {
    symbol: '_',
    name: 'Pangaltas',
    description: 'Modern vowel cancellation symbol developed by Leyson, placed below the character',
    isModern: true,
    fontDependent: true,
  }
};

// Helper functions
const isVowelCanceller = (char: string): boolean => {
  return char in VOWEL_CANCELLERS;
};

// Helper function to check if a word is standalone "mga"
/** 
* Checks if a word is the standalone plural marker "mga"/"Mga".
* This special case reflects the historical "ma-nga" pronunciation
* and implements the special no-deleter rule for the initial 'm'.
*/
const isStandaloneMga = (word: string, fullText: string): boolean => {
  const mgaPattern = /\b[Mm]ga\b/;
  return mgaPattern.test(word);
};

// Add new mapping tables
const createSpecialDigraphMap = (canceller: string) => ({
    // Dya combinations (J sounds)
    'dya': `ᜇ${canceller}ᜌ`, 
    'dye': `ᜇ${canceller}ᜌᜒ`, 
    'dyi': `ᜇ${canceller}ᜌᜒ`, 
    'dyo': `ᜇ${canceller}ᜌᜓ`, 
    'dyu': `ᜇ${canceller}ᜌᜓ`,
    // Tsa combinations (Ch sounds)
    'tsa': `ᜆ${canceller}ᜐ`, 
    'tse': `ᜆ${canceller}ᜐᜒ`, 
    'tsi': `ᜆ${canceller}ᜐᜒ`, 
    'tso': `ᜆ${canceller}ᜐᜓ`, 
    'tsu': `ᜆ${canceller}ᜐᜓ`,
    // Kwa combinations (Qu sounds except que/qui)
    'kwa': `ᜃ${canceller}ᜏ`, 
    'kwe': `ᜃ${canceller}ᜏᜒ`, 
    'kwi': `ᜃ${canceller}ᜏᜒ`, 
    'kwo': `ᜃ${canceller}ᜏᜓ`, 
    'kwu': `ᜃ${canceller}ᜏᜓ`,
    // Sya combinations (Cy sounds)
    'sya': `ᜐ${canceller}ᜌ`, 
    'sye': `ᜐ${canceller}ᜌᜒ`, 
    'syi': `ᜐ${canceller}ᜌᜒ`, 
    'syo': `ᜐ${canceller}ᜌᜓ`, 
    'syu': `ᜐ${canceller}ᜌᜓ`,
    // Special Que/Qui handling
    'que': `ᜃᜒ`,
    'qui': `ᜃᜒ`,
    'qua': `ᜃ᜔ᜏ`,  // Using kwa form
    'quo': `ᜃ᜔ᜏᜓ`, // Using kwo form
    // J → Dy combinations
    'jo': `ᜇ${canceller}ᜌᜓ`,
    'ju': `ᜇ${canceller}ᜌᜓ`,
    'ja': `ᜇ${canceller}ᜌ`,
    'je': `ᜇ${canceller}ᜌᜒ`,
    'ji': `ᜇ${canceller}ᜌᜒ`,
    
    // Ch → Ts combinations
    'cha': `ᜆ${canceller}ᜐ`,
    'che': `ᜆ${canceller}ᜐᜒ`,
    'chi': `ᜆ${canceller}ᜐᜒ`,
    'cho': `ᜆ${canceller}ᜐᜓ`,
    'chu': `ᜆ${canceller}ᜐᜓ`,
    
    // Cy → Si (treating cy+vowel as si+vowel)
    'cy': `ᜐ${canceller}ᜒ`,
    'ci': `ᜐ${canceller}ᜒ`,
});

const soundLocalizationMap: { [key: string]: string } = {
    'f': 'p',
    'v': 'b',
    'z': 's',
    'c': 'k'  // Default case, special cases handled separately
};

// Add helper functions
const determineXVowel = (word: string, position: number): string => {
    if (position === 0 || word[position - 1] === '-') {
        return 'ᜁ';
    }
    const prevChar = word[position - 1].toLowerCase();
    if ('aeiou'.includes(prevChar)) {
        switch(prevChar) {
            case 'a': return 'ᜀ';
            case 'e':
            case 'i': return 'ᜁ';
            case 'o':
            case 'u': return 'ᜂ';
            default: return '';
        }
    }
    return '';
};

// Add specific handling for X as Eks or ks
const handleXConversion = (word: string, position: number, canceller: string): [string, number] => {
    const vowel = determineXVowel(word, position);
    const xConverted = vowel ? 
      `${vowel}ᜃ${canceller}ᜐ${canceller}` : 
      `ᜃ${canceller}ᜐ${canceller}`;
    return [xConverted, 1];
};

// Add specific mapping for Nga/nga cases
const ngaMap: { [key: string]: string } = {
  'Nga': 'ᜅ',  // Capital Nga
  'nga': 'ᜅ',  // Lowercase nga
  'nge': 'ᜅᜒ', 
  'ngi': 'ᜅᜒ',
  'ngo': 'ᜅᜓ',
  'ngu': 'ᜅᜓ',
  'ng': 'ᜅ᜔'   // Standalone ng with vowel canceller
};

// First, let's update the ending rules
const endingRules: { [key: string]: string } = {
    'hn': 'n',  // John → Dyon
    'gh': 'g',  //burgh → burg
};

// Then update the qu- handling separately
const quHandling: { [key: string]: string } = {
    'que': 'ke',
    'qui': 'ki',
    'qua': 'kwa',
    'quo': 'kwo'
};

// Add a pre-processing step for these cases
const preProcessWord = (word: string): string => {
    // Handle endings first
    let processed = word;
    for (const [ending, replacement] of Object.entries(endingRules)) {
        if (word.toLowerCase().endsWith(ending)) {
            processed = word.slice(0, -ending.length) + replacement;
            break;
        }
    }
    
    // Handle qu- combinations
    for (const [qu, replacement] of Object.entries(quHandling)) {
        processed = processed.toLowerCase().replace(qu, replacement);
    }
    
    return processed;
};

// Remove Unicode mapping and use actual font characters
const VOWEL_CANCELLER_MAP: { [key: string]: string } = {
  '+': '+',  // Kurus (default)
  'x': 'x',  // Ekis
  ']': ']',  // Pamudpod
  '_': '_'   // Pangaltas
};

// Add font support information
interface FontCancellerSupport {
  [key: string]: {
    [key: string]: boolean;
  };
}

const FONT_CANCELLER_SUPPORT: FontCancellerSupport = {
  'Baybayin Simple': {
    '+': true,  // Kurus
    'x': true,  // Ekis
    ']': true,  // Pamudpod
    '_': true,   // Pangaltas
  },
  'Baybayin Jose Rizal': {
    '+': true,
    'x': true,
    ']': false,
    '_': false
  },
  'Baybayin Kariktan': {
    '+': false,
    'x': false,
    ']': true,
    '_': true,
  },
  'Tawbid Ukit': {
    '+': true,
    'x': true,
    ']': true,
    '_': false,
  },
  'Doctrina Christiana': {
    '+': true,
    'x': false,
    ']': false,
    '_': false,
  },
  'Baybayin Filipino': {
    '+': true,
    'x': true,
    ']': true,
    '_': false,
  }
};

/**
 * Returns an array of supported vowel cancellers for a given font
 * @param fontName - The name of the Baybayin font
 * @returns Array of supported vowel canceller symbols
 */
export function getSupportedCancellers(fontName: string): string[] {
  const fontSupport = FONT_CANCELLER_SUPPORT[fontName] || FONT_CANCELLER_SUPPORT['Baybayin Simple'];
  
  return Object.entries(fontSupport)
    .filter(([_, isSupported]) => isSupported)
    .map(([symbol]) => symbol);
}

/**
 * Returns the appropriate vowel canceller symbol, with strict fallback logic
 * @param selectedCanceller - User selected vowel canceller
 * @param fontName - Selected Baybayin font name
 * @returns Valid vowel canceller symbol
 */
function getValidCanceller(selectedCanceller: string, fontName: string): string {
  // Default to 'Baybayin Simple' if fontName doesn't exist
  const fontSupport = FONT_CANCELLER_SUPPORT[fontName] || FONT_CANCELLER_SUPPORT['Baybayin Simple'];
  
  // If the selected canceller is not supported or explicitly set to false, return '+'
  if (!fontSupport || !fontSupport[selectedCanceller] || fontSupport[selectedCanceller] === false) {
    // Special case for Baybayin Kariktan
    if (fontName === 'Baybayin Kariktan') {
      return ']'; // Kariktan uses ']' as its default
    }
    
    // For all other fonts, find the first available canceller, defaulting to '+'
    const availableCancellers = Object.entries(fontSupport)
      .filter(([_, isSupported]) => isSupported === true)
      .map(([symbol]) => symbol);
    
    return availableCancellers[0] || '+';
  }
  
  return selectedCanceller;
}

/**
 * Converts Latin text to Baybayin script
 */
export function convertToBaybayin(
  text: string, 
  vowelCanceller: string = '+',
  fontName: string = 'Baybayin Simple'
): string {
  // Early return if text is not provided or is not a string
  if (!text || typeof text !== 'string') {
    return '';
  }

  // Strictly enforce the fallback logic
  const validCanceller = getValidCanceller(vowelCanceller, fontName);
  
  // Get the actual character for the valid canceller
  const canceller = VOWEL_CANCELLER_MAP[validCanceller];
  
  // Create dynamic consonant mappings using the validated canceller
  const dynamicBaybayinMap = {
    ...baybayinMap,
    'b': `ᜊ${canceller}`,
    'k': `ᜃ${canceller}`,
    'd': `ᜇ${canceller}`,
    'g': `ᜄ${canceller}`,
    'h': `ᜑ${canceller}`,
    'l': `ᜎ${canceller}`,
    'm': `ᜋ${canceller}`,
    'p': `ᜉ${canceller}`,
    'r': `ᜍ${canceller}`,
    's': `ᜐ${canceller}`,
    't': `ᜆ${canceller}`,
    'w': `ᜏ${canceller}`,
    'y': `ᜌ${canceller}`,
    'n': `ᜈ${canceller}`,
  };

  // Create dynamic nga mapping
  const dynamicNgaMap = {
    ...ngaMap,
    'ng': `ᜅ${canceller}`
  };

  let output = '';
  // Ensure text is treated as a string and split it
  const words = String(text).split(/(\s+)/);

  for (const word of words) {
    if (word.trim() === '') {
      output += word;
      continue;
    }

    // Check for "mga"/"Mga" first
    if (isStandaloneMga(word, text)) {
      output += dynamicBaybayinMap[word.toLowerCase()];
      continue;
    }

    let tempOutput = '';
    let i = 0;

    while (i < word.length) {
      // Check for "nga" combinations first
      const ngaCombo = word.slice(i, i + 3).toLowerCase();
      if (dynamicNgaMap[ngaCombo]) {
        tempOutput += dynamicNgaMap[ngaCombo];
        i += 3;
        continue;
      }

      // Check for standalone "ng"
      const ngCombo = word.slice(i, i + 2).toLowerCase();
      if (ngCombo === 'ng') {
        tempOutput += dynamicNgaMap['ng'];
        i += 2;
        continue;
      }

      const char = word[i];
      const nextChar = word[i + 1];
      const currentPair = word.slice(i, i + 2).toLowerCase();
      const currentTriple = word.slice(i, i + 3).toLowerCase();

      // 3. Handle special digraphs
      if (char.toLowerCase() === 'j' && nextChar) {
        const combo = `j${nextChar.toLowerCase()}`;
        if (createSpecialDigraphMap(canceller)[combo]) {
          tempOutput += createSpecialDigraphMap(canceller)[combo];
          i += 2;
          continue;
        }
      }

      if (currentPair === 'ch' && word[i + 2]) {
        const combo = `ch${word[i + 2].toLowerCase()}`;
        if (createSpecialDigraphMap(canceller)[combo]) {
          tempOutput += createSpecialDigraphMap(canceller)[combo];
          i += 3;
          continue;
        }
      }

      if (currentPair === 'cy' || currentPair === 'ci') {
        tempOutput += createSpecialDigraphMap(canceller)['cy'];
        i += 2;
        continue;
      }

      // 4. Handle X sound
      if (char.toLowerCase() === 'x') {
        if (i === 0 || word[i - 1] === '-') {
          tempOutput += 'ᜁ';
        }
        tempOutput += `ᜃ${canceller}ᜐ${canceller}`;
        i++;
        continue;
      }

      // 5. Apply sound localization
      const localizedChar = soundLocalizationMap[char.toLowerCase()] || char;

      // 6. Direct case-sensitive handling for A/a
      if (char === 'A' || char === 'a') {
        tempOutput += dynamicBaybayinMap[char];
        i++;
        continue;
      }

      // 7. Handle regular syllables
      const syllablePair = localizedChar + nextChar?.toLowerCase() || '';
      if (dynamicBaybayinMap[syllablePair]) {
        tempOutput += dynamicBaybayinMap[syllablePair];
        i += 2;
        continue;
      }

      // 8. Handle single characters
      if (dynamicBaybayinMap[localizedChar]) {
        tempOutput += dynamicBaybayinMap[localizedChar];
        i++;
        continue;
      }

      // Pass through unrecognized characters
      tempOutput += char;
      i++;
    }

    output += tempOutput;
  }

  return output;
}

// Export the function
export default convertToBaybayin;

