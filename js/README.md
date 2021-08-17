## Installing

```bash
cp -r /path/to/metaplex/common packages/oyster-common
npx lerna bootstrap
npx lerna exec --parallel yarn run watch --scope wumbo-common --scope @wum.bo/spl-token-bonding --scope @oyster/common --scope @wum.bo/spl-wumbo --scope wumbo-extension
```

### Starting the site

```bash
cd packages/site && yarn run start
```

### Installing the extension

Navigate to chrome://extensions. Load this dist/ folder in packages/extension.
