// Quick-and-dirty pretty printer: break minified code at common boundaries for readability
const fs = require('fs');
const [src, out] = process.argv.slice(2);
let T = fs.readFileSync(src, 'utf8');
T = T
  .replace(/\(0,(\w+)\.(useState|useRef|useCallback|useEffect|useMemo|useContext|useImperativeHandle|useLayoutEffect)\)\(/g, '\n(USE$2>(')
  .replace(/,(0,\w+\.jsxs?)\(/g, '\n<$1(')
  .replace(/\((0,\w+\.jsxs?)\)/g, '\n<$1>')
  .replace(/;((\w+)=\(0,\w+\.(useState|useCallback)\))/g, ';\n$1')
  .replace(/let /g, '\nlet ')
  .replace(/const /g, '\nconst ')
  .replace(/function /g, '\nfunction ')
  .replace(/=>\{\n/g, '=>{')
  .replace(/\n\(/g, '(');
fs.writeFileSync(out, T);
console.log('written', out, T.split('\n').length, 'lines');
