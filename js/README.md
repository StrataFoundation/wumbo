## Installing

```bash
cp -r /path/to/metaplex/common packages/oyster-common
npx lerna bootstrap
npx lerna exec yarn run watch --scope wumbo-common --scope spl-token-swap --scope @oyster/common --scope spl-wumbo --scope wumbo-extension
```
