const fs = require('fs');

// Let's inspect the console part of media_1790001118153.png
// The image has size, we can check dimensions with sharp or basic metadata if available, or just read lines.
console.log("Checking if sharp is installed");
try {
  const sharp = require('sharp');
  sharp('C:/Users/vumik/.gemini/antigravity-ide/brain/267fe93e-bf69-4d20-873a-e2bc931b7964/.user_uploaded/media_1790001118153.png')
    .metadata()
    .then(meta => {
      console.log("Metadata:", meta.width, meta.height);
      // The console is on the right side: x ~ 700 to width, y ~ 350 to 550
      return sharp('C:/Users/vumik/.gemini/antigravity-ide/brain/267fe93e-bf69-4d20-873a-e2bc931b7964/.user_uploaded/media_1790001118153.png')
        .extract({ left: Math.floor(meta.width * 0.7), top: Math.floor(meta.height * 0.35), width: Math.floor(meta.width * 0.3), height: Math.floor(meta.height * 0.3) })
        .toFile('C:/Users/vumik/.gemini/antigravity-ide/brain/267fe93e-bf69-4d20-873a-e2bc931b7964/scratch/cropped_error.png');
    })
    .then(() => console.log("Cropped successfully"))
    .catch(e => console.error(e));
} catch(e) {
  console.log("Sharp not available:", e.message);
}
