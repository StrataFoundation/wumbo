# Wum.bo

Wum.bo is a set of Solana programs and a chrome extension to bring creator coins to major social networks. You can read the litepaper [here](https://drive.google.com/file/d/1srRh0IYYhDQptPEs9DzxhKEZy19yuI-4/view?usp=sharing)

## Chrome Extension Dev Setup

First, you'll need to clone https://github.com/solana-labs/oyster in a parallel directory to this. The package.json references this by relative path because it hasn't been published to npm

```
cd ..
git clone https://github.com/solana-labs/oyster
cd wumbo
```

Change directories into the chrome extension,

```
cd chrome-extension
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

## Project Setup

```
chrome-extension/
spl-token-bonding/
├─ program/
├─ cli/
wumbo/
├─ program/
├─ cli/
```

`chrome-extension` contains the React code for the chrome extension

Both `spl-token-bonding` and `wumbo` are programs on the solana blockchain. 

`spl-token-bonding` handles the bonding curves for both SOL x WUM and WUM x Creator Tokens. 

`wumbo` manages the association between bonding curves and social media accounts, and also verifies that all founder tokens follow a base curve.

Both programs come with their definitions in `program` and a command line interface with useful commands at `cli`. These are somewhat minimal right now, and contain the set of commands needed to create a new wumbo token, instance, and bonding curves.

## Notes

The wumbo instance and program are all configured in `src/constants/globals.tsx`. If you change any of these,
or leave devnet, you'll need to use the cli to recreate them.
