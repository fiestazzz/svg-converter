const express = require('express');
const multer = require('multer');
const potrace = require('potrace');
const fs = require('fs');
const path = require('path');
const Jimp = require('jimp');
const quantize = require('quantize');
const Vibrant = require('node-vibrant');
const sharp = require('sharp');
const { promisify } = require('util');

const app = express();
const upload = multer({ dest: 'uploads/' });

const tracePromise = promisify(potrace.trace);

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Ensure the uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

function rgbToHex(r, g, b) {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

app.post('/svg', upload.single('image'), async (req, res) => {
    if (!req.file) {
        return res.status(400).send('No image file uploaded');
      }
    
      const inputPath = path.join(__dirname, req.file.path);
    
      try {
        // Read the image
        const image = await Jimp.read(inputPath);
        const width = image.getWidth();
        const height = image.getHeight();
    
        // Extract colors
        const pixels = [];
        image.scan(0, 0, width, height, function (x, y, idx) {
          const r = this.bitmap.data[idx + 0];
          const g = this.bitmap.data[idx + 1];
          const b = this.bitmap.data[idx + 2];
          pixels.push([r, g, b]);
        });
    
        // Quantize colors
        const colorCount = 5; // Number of colors to quantize
        const palette = quantize(pixels, colorCount);
        const colors = palette.map(color => rgbToHex(color[0], color[1], color[2]));
    
        // Generate SVG with potrace
        potrace.trace(inputPath, (err, svg) => {
          if (err) {
            return res.status(500).send('Error processing image.');
          }
    
          // Apply colors to SVG paths
          let coloredSvg = svg;
          coloredSvg = coloredSvg.replace(/fill="[^"]*"/g, function(match) {
            const color = colors[Math.floor(Math.random() * colors.length)];
            return `fill="${color}"`;
          });
    
          res.setHeader('Content-Type', 'image/svg+xml');
          res.send(coloredSvg);
          
          // Clean up temporary files
          fs.unlink(inputPath, () => {});
        });
      } catch (error) {
        console.error('Error processing image:', error);
        res.status(500).send('Error processing image');
      }
});

// New route for converting SVG to image
// New route for converting SVG to image
app.post('/image', upload.single('svg'), async (req, res) => {
    if (!req.file) {
      return res.status(400).send('No SVG file uploaded');
    }
  
    const svgPath = path.join(__dirname, req.file.path);
  
    try {
      // Convert SVG to PNG using sharp
      const outputPath = path.join(__dirname, 'uploads', `converted-${Date.now()}.png`);
      await sharp(svgPath)
        .png()
        .toFile(outputPath);
  
      res.sendFile(outputPath, (err) => {
        if (err) {
          console.error('Error sending image file:', err);
          return res.status(500).send('Error sending image file');
        }
  
        // Clean up temporary files
        fs.unlink(svgPath, () => {});
        fs.unlink(outputPath, () => {});
      });
    } catch (error) {
      console.error('Error converting SVG to image:', error);
      res.status(500).send('Error converting SVG to image');
    }
  });

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});