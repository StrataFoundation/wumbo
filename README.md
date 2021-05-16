# solclout

## Chrome Extension Dev Setup

First, you'll need to clone https://github.com/solana-labs/oyster in a parallel directory to this. The package.json references this by relative path because it hasn't been published to npm

After that,

```
npm install
```

```
npm run watch
```

Then go to chrome://extensions/. Load unpacked. Target the dist/ directory

The solclout instance and program are all configured in `src/globals.tsx`. If you change any of these,
or leave devnet, you'll need to use the cli to recreate them.