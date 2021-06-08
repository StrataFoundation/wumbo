# Wum.bo

## Chrome Extension Dev Setup

First, you'll need to clone https://github.com/solana-labs/oyster in a parallel directory to this. The package.json references this by relative path because it hasn't been published to npm

```
cd ..
git clone https://github.com/solana-labs/oyster
cd wumbo
```

After that,

```
npm install
```

To develop, run

```
npm run watch
```

To build for production, run

```
npm build
```

## Load the Extension

Enter chrome://extensions/ in the address bar, and press enter. 

Click "Load unpacked". 

Select the dist/ directory of this project

## Notes

The wumbo instance and program are all configured in `src/constants/globals.tsx`. If you change any of these,
or leave devnet, you'll need to use the cli to recreate them.
