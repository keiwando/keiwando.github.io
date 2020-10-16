
/**
 * @returns {{ h: number, s: number, l: number}}
 */
function rgbToHsl(rgbColor) {
  const { r, g, b } = rgbColor;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max === min) {
    s = 0;
    h = 0; // achromatic
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }

    h /= 6;
  }

  return { h, s, l };
}

/**
 * @returns {{ r: number, g: number, b: number}}
 */
function hslToRgb(hsl) {
  let r;
  let g;
  let b;

  const { h, s, l } = hsl;

  function hueToRgb(pValue, qValue, tValue) {
    const p = pValue;
    const q = qValue;
    let t = tValue;
    if (t < 0) {
      t += 1;
    }

    if (t > 1) {
      t -= 1;
    }

    if (t < 1 / 6) {
      return p + (q - p) * (6 * t);
    }

    if (t < 1 / 2) {
      return q;
    }

    if (t < 2 / 3) {
      return p + (q - p) * (2 / 3 - t) * 6;
    }

    return p;
  }

  if (s === 0) {
    // achromatic
    g = l;
    b = l;
    r = l;
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hueToRgb(p, q, h + 1 / 3);
    g = hueToRgb(p, q, h);
    b = hueToRgb(p, q, h - 1 / 3);
  }

  return { r, g, b };
}

/**
 * @returns {{ h: number, s: number, v: number }}
 */
function rgbToHsv(rgb) {
  const { r, g, b } = rgb;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  const v = max;
  const d = max - min;
  const s = max === 0 ? 0 : d / max;

  if (max === min) {
    h = 0; // achromatic
  } else {
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }

    h /= 6;
  }

  return { h, s, v };
}

/**
 * @returns {{ r: number, g: number, b: number }}
 */
function hsvToRgb(hsv) {
  const { h, s, v } = hsv;

  const i = Math.floor(h * 6);
  const f = h * 6 - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);

  let r = 0;
  let g = 0;
  let b = 0;

  switch (i % 6) {
    case 0: r = v; g = t; b = p; break;
    case 1: r = q; g = v; b = p; break;
    case 2: r = p; g = v; b = t; break;
    case 3: r = p; g = q; b = v; break;
    case 4: r = t; g = p; b = v; break;
    case 5: r = v; g = p; b = q; break;
  }

  return { r, g, b };
}

const HEX_SINGLE_CHAR_COMPONENTS_FORMAT = /[A-Fa-f0-9]{1}/g
const HEX_DOUBLE_CHAR_COMPONENTS_FORMAT = /[A-Fa-f0-9]{2}/g

function hexToRGB(hexString) {
  const rgbaHexToColor = (r, g, b, max) => {
    return {
      r: parseInt(r, 16) / max,
      g: parseInt(g, 16) / max,
      b: parseInt(b, 16) / max
    };
  };

  if (hexString.startsWith('#')) {
    if (hexString.length === 3 || hexString.length === 4) {
      const [r, g, b] = hexString.match(HEX_SINGLE_CHAR_COMPONENTS_FORMAT);
      return rgbaHexToColor(r, g, b, 15);
    }
    if (hexString.length === 6 || hexString.length === 7) {
      const [r, g, b] = hexString.match(HEX_DOUBLE_CHAR_COMPONENTS_FORMAT);
      return rgbaHexToColor(r, g, b, 255);
    }
  }

  return { r: 0, g: 0, b: 0 }
}

function rgbToHex(rgb) {
  const { r, g, b } = rgb;
  const rByte = Math.round(255 * r);
  const gByte = Math.round(255 * g);
  const bByte = Math.round(255 * b);
  const byteToHex = (byte) => {
    return byte.toString(16).padStart(2, '0');
  };
  return `#${byteToHex(rByte)}${byteToHex(gByte)}${byteToHex(bByte)}`;
}

function rgbToCSS(rgb) {
  return `rgb(${Math.round(rgb.r * 255)}, ${Math.round(rgb.g * 255)}, ${Math.round(rgb.b * 255)})`;
}

function generateLinearHueGradientCSS() {
  const stops = 50;
  let result = "linear-gradient(90deg";
  for (let i = 0; i < stops + 1; i++) {
    const hue = i / stops;
    const { r, g, b } = hsvToRgb({ h: hue, s: 1, v: 1 });
    result += `, ${rgbToCSS(r, g, b)} ${hue * 100}%`
  }
  result += ");"
  return result;
}

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 300;
const COLOR_PREVIEW_WIDTH = 250;
const SATURATION_BRIGHTNESS_WIDTH = CANVAS_WIDTH - COLOR_PREVIEW_WIDTH;
const SB_HANDLE_SIZE = 20;

/**
 * @param {HTMLCanvasElement} canvas
 * @param {{ h: number, s: number, v: number}} hsvColor
 */
function refreshCanvas(canvas, hsvColor, rgbColor) {

  const { r, g, b } = rgbColor;
  const { h, s, v } = hsvColor;

  // The left 250 pixels of the canvas show the selected color
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = `rgb(${r * 255}, ${g * 255}, ${b * 255})`;
  ctx.fillRect(0, 0, COLOR_PREVIEW_WIDTH, canvas.height);

  // The right side of the canvas shows the saturation-value
  const saturationGradient = ctx.createLinearGradient(COLOR_PREVIEW_WIDTH, 0, CANVAS_WIDTH, 0);
  saturationGradient.addColorStop(0, `hsla(${h * 360}, 100%, 50%, 0)`);
  saturationGradient.addColorStop(1, `hsla(${h * 360}, 100%, 50%, 1)`);

  const brightnessGradient = ctx.createLinearGradient(COLOR_PREVIEW_WIDTH, 0, COLOR_PREVIEW_WIDTH, CANVAS_HEIGHT);
  brightnessGradient.addColorStop(0, "white");
  brightnessGradient.addColorStop(1, "black");

  ctx.fillStyle = brightnessGradient;
  ctx.fillRect(COLOR_PREVIEW_WIDTH, 0, SATURATION_BRIGHTNESS_WIDTH, CANVAS_HEIGHT);
  ctx.fillStyle = saturationGradient;
  ctx.globalCompositeOperation = "multiply";
  ctx.fillRect(COLOR_PREVIEW_WIDTH, 0, SATURATION_BRIGHTNESS_WIDTH, CANVAS_HEIGHT);
  ctx.globalCompositeOperation = "source-over";
}

// MARK: - Main application

const canvas = document.getElementById('canvas')
const hueSlider = document.getElementById('hue-slider')
const thumbSlider = document.getElementById('slider-thumb')
const sbHandle = document.getElementById('saturation-brightness-handle')
const formatContainer = document.getElementById('formats-container')
const copiedNotification = document.getElementById('copied-notification')

canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;

let hsvColor = {
  h: 0,
  s: 0.0,
  v: 1.0,
}

let formatRefreshes = []

function refresh() {
  
  const rgbColor = hsvToRgb(hsvColor);

  refreshCanvas(canvas, hsvColor, rgbColor);
 
  const sbX = (1 - hsvColor.v) * CANVAS_HEIGHT - 0.5 * SB_HANDLE_SIZE;
  const sbY =  COLOR_PREVIEW_WIDTH + hsvColor.s * SATURATION_BRIGHTNESS_WIDTH - 0.5 * SB_HANDLE_SIZE;
  sbHandle.style.top = `${Math.round(sbX)}px`;
  sbHandle.style.left = `${Math.round(sbY)}px`;

  document.documentElement.style.setProperty(
    '--hue-slider-thumb-color', 
    `hsl(${hsvColor.h * 360}, 100%, 50%)`
  );
  document.documentElement.style.setProperty(
    '--selected-color', 
    rgbToCSS(rgbColor)
  );

  for (const formatRefresh of formatRefreshes) {
    formatRefresh(hsvColor, rgbColor);
  }
}

hueSlider.oninput = () => {
  hsvColor.h = hueSlider.value;
  refresh();
}

// MARK: - Handle dragging
let isDragging = false

document.addEventListener('mousedown', (event) => {
  let canvasBounds = canvas.getBoundingClientRect();
  canvasBounds.x -= 0.5 * SB_HANDLE_SIZE;
  canvasBounds.y -= 0.5 * SB_HANDLE_SIZE;
  canvasBounds.width += SB_HANDLE_SIZE;
  canvasBounds.height += SB_HANDLE_SIZE;
  const mouseX = event.clientX;
  const mouseY = event.clientY;
  if (
    canvasBounds.x + COLOR_PREVIEW_WIDTH <= mouseX && mouseX <= canvasBounds.x + canvasBounds.width && 
    canvasBounds.y <= mouseY && mouseY <= canvasBounds.y + canvasBounds.height
  ) {
    isDragging = true;
  }
});

document.addEventListener('mousemove', (event) => {
  if (isDragging) {
    const positionInCanvas = {
      x: event.clientX - canvas.getBoundingClientRect().left,
      y: event.clientY - canvas.getBoundingClientRect().top
    };
    const positionInSBBox = {
      x: positionInCanvas.x - COLOR_PREVIEW_WIDTH,
      y: positionInCanvas.y
    }
    hsvColor.s = positionInSBBox.x / SATURATION_BRIGHTNESS_WIDTH;
    hsvColor.v = 1 - (positionInSBBox.y / CANVAS_HEIGHT);
    
    hsvColor.s = Math.min(Math.max(hsvColor.s, 0), 1);
    hsvColor.v = Math.min(Math.max(hsvColor.v, 0), 1);

    refresh();
  }
});

document.addEventListener('mouseup', (event) => {
  isDragging = false;
});

// MARK: - Formats

function round(num) {
  return Math.round(num * 100) / 100
}

function clampParse(str) {
  return Math.min(Math.max(parseFloat(str), 0), 1);
}

const RGB_01_FORMAT = /(\d+(\.\d+)?)/g
const RGB_255_FORMAT = /\d+/g

/**
 * @type {Array<{ name: string, str: (hsv: { h: number, s: number, v: number }, rgb: { r: number, g: number, b: number }) => string }>}
 */
const formats = [
  {
    name: 'RGB [0-1]',
    str: (hsv, rgb) => { return `${round(rgb.r)}, ${round(rgb.g)}, ${round(rgb.b)}` },
    parse: (str) => {
      const matches = str.match(RGB_01_FORMAT);
      return { r: clampParse(matches[0]), g: clampParse(matches[1]), b: clampParse(matches[2]) }
    }
  },
  {
    name: 'RGB [0-255]',
    str: (hsv, rgb) => { return `${Math.round(255 * rgb.r)}, ${Math.round(255 * rgb.g)}, ${Math.round(255 * rgb.b)}` },
    parse: (str) => {
      const matches = str.match(RGB_255_FORMAT);
      return { r: clampParse(matches[0] / 255), g: clampParse(matches[1] / 255), b: clampParse(matches[2] / 255) }
    }
  },
  {
    name: 'HEX',
    str: (hsv, rgb) => { return rgbToHex(rgb); },
    parse: (str) => {
      return hexToRGB(str);
    }
  },
  {
    name: 'HSV',
    str: (hsv, rgb) => { return `${round(hsv.h)}, ${round(hsv.s)}, ${round(hsv.v)}` },
    parse: (str) => {
      const matches = str.match(RGB_01_FORMAT);
      return { h: clampParse(matches[0]), s: clampParse(matches[1]), v: clampParse(matches[2]) }
    }
  },
  {
    name: 'HSL',
    str: (hsv, rgb) => { 
      const hsl = rgbToHsl(rgb)
      return  `${round(hsl.h)}, ${round(hsl.s)}, ${round(hsl.l)}` 
    },
    parse: (str) => {
      const matches = str.match(RGB_01_FORMAT);
      const hsl = { h: clampParse(matches[0]), s: clampParse(matches[1]), l: clampParse(matches[2]) }
      return hslToRgb(hsl);
    }
  },
  {
    name: 'GLSL',
    str: (hsv, rgb) => { return `vec4(${round(rgb.r).toFixed(2)}, ${round(rgb.g).toFixed(2)}, ${round(rgb.b).toFixed(2)}, 1.0)` }
  },
  {
    name: 'MSL',
    str: (hsv, rgb) => { return `float4(${round(rgb.r).toFixed(2)}, ${round(rgb.g).toFixed(2)}, ${round(rgb.b).toFixed(2)}, 1.0)` }
  },
  {
    name: 'UIColor',
    width: 450,
    str: (hsv, rgb) => { return `UIColor(red: ${round(rgb.r)}, green: ${round(rgb.g)}, blue: ${round(rgb.b)}, alpha: 1.0)` }
  },
  {
    name: 'CSS (RGB)',
    str: (hsv, rgb) => { return `rgb(${Math.round(255 * rgb.r)}, ${Math.round(255 * rgb.g)}, ${Math.round(255 * rgb.b)})` }
  },
  {
    name: 'CSS (HSL)',
    str: (hsv, rgb) => { 
      const hsl = rgbToHsl(rgb);
      return `hsl(${Math.round(360 * hsl.h)}°, ${Math.round(100 * hsl.s)}%, ${Math.round(100 * hsl.l)}%)` 
    }
  }
]

function setupFormats() {
  for (const format of formats) {
    const inputContainer = document.createElement('div');
    inputContainer.classList = 'format-input-container';
    formatContainer.appendChild(inputContainer);

    const input = document.createElement('input');
    input.classList = 'format-input';
    input.type = "text";
    inputContainer.appendChild(input);

    if (format.width) {
      inputContainer.style.width = `${format.width}px`;
    }

    const inputLabel = document.createElement('h5');
    const inputLabelSpan = document.createElement('span');
    inputLabel.appendChild(inputLabelSpan);
    inputLabelSpan.innerText = format.name;
    inputContainer.appendChild(inputLabel);

    formatRefreshes.push((hsvColor, rgbColor) => {
      if (input !== document.activeElement) {
        input.value = format.str(hsvColor, rgbColor);
      }
    });

    if (format.parse !== undefined) {
      input.oninput = () => {
        const color = format.parse(input.value);
        if (color.r !== undefined) {
          hsvColor = rgbToHsv(color);
        } else {
          hsvColor = color;
        }
        hueSlider.value = hsvColor.h;
        refresh();
      }
      
    } else {
      input.setAttribute('disabled', 'true');
    }

    inputLabel.addEventListener('click', () => {
      input.select();
      input.focus();

      try {
        const successful = document.execCommand('copy');
        if (successful) {
          input.blur();
          copiedNotification.innerText = `Copied ${format.name}`;
          copiedNotification.classList = '';
          setTimeout(() => {
            copiedNotification.classList = 'notificationHidden';
          }, 500);
        } else {
          console.log('Failed to copy');
        }
      } catch (err) {
        console.log('Failed to copy');
      }
    });
  }
}

setupFormats()

refresh();
hueSlider.oninput();