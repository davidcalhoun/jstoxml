mkdir dist || true

npx babel jstoxml.js --out-file dist/jstoxml.js
npx uglifyjs dist/jstoxml.js -o dist/jstoxml-min.js