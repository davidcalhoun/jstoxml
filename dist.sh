mkdir dist || true

npx babel jstoxml.js --out-file dist/jstoxml.js
npx uglifyjs dist/jstoxml.js -ecma=5 -o dist/jstoxml-min.js