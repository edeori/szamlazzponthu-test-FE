# szamlazzponthu-test-FE

# Indítás
npm run start

# Generate api
openapi-generator-cli generate -i src/assets/api.yaml -g typescript-fetch -o src/app/core/services/api

# FIX generated api errors
node scripts/patch-openapi-runtime.cjs

# Docker build
docker build -t szamlazzponthu-ui:latest .

# Fejlesztési workflow
Mivel angularban nem vagyok annyira járatos, így a debugoláshoz jellemzően ChatGPT-t használtam.
A komponensek elkészítésést és boilerplate kódok generálását szintén ChatGPT volt a segítségemre.
Jellemzően úgy nézett ki a flow, hogy tudtam mit kell elkészíteni, de a szintaktika nem volt meg.
Ebből kifolyólag a promptban leírtam azt, hogy mit szeretnék, milyen szerkezettel, hogyan szeparálva, milyen rétegban és az így generált kódok alapján haladtam.

Amikor már kész, futó FE alkalmazásom volt, akkor kértem AI segítséget az nginx file configolásához, mert az sajnos mindig nehezebben megy.