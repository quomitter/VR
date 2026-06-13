# Meta Quest VR Demo - Setup Guide

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Development Testing

#### Option A: Desktop Browser (For Testing)
```bash
npm start
```
Opens at `http://localhost:3000` - perfect for desktop testing before deploying to Quest.

#### Option B: Meta Quest Headset

**Via Local Network (Easiest):**
1. Connect Meta Quest to the same WiFi as your development PC
2. Run `npm start` and find your PC's IP address (shown in terminal)
3. On Quest: Open **Meta Quest Browser**
4. Navigate to `http://<your-pc-ip>:3000`
5. Click **"Enter VR"** button

**Via USB Connection:**
1. Connect Quest to PC with USB cable
2. Enable Developer Mode on Quest (Settings → About → Tap Build Number 7 times)
3. Enable USB Debugging (Settings → Developer)
4. Install [Meta Quest Developer Hub](https://www.meta.com/en-us/quest/developers/)
5. Run: `npm run build && npm run deploy`

## What You'll See

- **Colorful 3D Objects**: Cubes, spheres, toruses, and pyramids
- **Grab & Manipulate**: Pinch, grab, and throw objects around
- **Hand Tracking**: Use your hands naturally (or controllers)
- **Smooth Performance**: Optimized for 72-90 FPS on Quest hardware

## Controls

### With Controllers
- **Trigger** - Grab objects
- **Grip** - Alternative grab
- **Thumbstick** - Move around
- **Menu Button** - Reset scene

### With Hand Tracking
- **Pinch** (thumb + index) - Grab objects
- **Open Hand** - Release objects
- **Point** - Interact with UI

## Performance Settings

The app auto-detects your Quest model:
- **Quest 3**: 90 FPS target, 0.9 framebuffer scale
- **Quest Pro**: 72 FPS target, 0.85 framebuffer scale  
- **Quest 2**: 72 FPS target, 0.8 framebuffer scale

Performance dynamically adjusts if FPS drops.

## Troubleshooting

**"Enter VR" button stays disabled**
- Ensure you're using Meta Quest Browser, not Chrome
- Check that WebXR is enabled in browser settings
- Update Meta Quest Browser to latest version

**Can't connect to localhost:3000**
- Check firewall settings on your PC
- Ensure both devices are on same WiFi network
- Try using IP address instead of localhost

**Low FPS or stuttering**
- Reduce number of objects in scene
- Lower texture resolution
- Close other background apps on Quest

**Hand tracking not working**
- Enable in Quest settings: Settings → System → Hand Tracking
- Ensure good lighting conditions
- Grant app permissions when prompted

## Build for Production

```bash
npm run build
```

Output goes to `dist/` folder. Upload to your hosting service or deploy via Meta Quest Developer Hub.

## Next Steps

- Add more interactive content
- Implement multiplayer with WebSockets
- Add 3D models and sound effects
- Publish to Meta Quest App Lab

## Resources

- [Meta Quest Developer Docs](https://developers.meta.com/en-us/docs/quest/)
- [WebXR API](https://www.w3.org/TR/webxr/)
- [Three.js Docs](https://threejs.org/)
