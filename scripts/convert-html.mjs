import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const htmlPath = path.resolve(__dirname, '../../edurock_html_template/index.html');
const outputPath = path.resolve(__dirname, '../src/pages/HomePageContent.tsx');

let html = fs.readFileSync(htmlPath, 'utf8');

// Extract main content between <main> tags
const mainMatch = html.match(/<main[^>]*>([\s\S]*)<\/main>/);
if (!mainMatch) {
  console.error('Could not find <main> tag');
  process.exit(1);
}
html = mainMatch[1];

// Fix malformed HTML in template (unclosed <li> tags)
html = html.replace(
  /<li><a([^>]*)>([^<]*)<\/a>\s*\n\s*<li>/g,
  '<li><a$1>$2</a></li>\n<li>',
);

// Remove HTML comments
html = html.replace(/<!--[\s\S]*?-->/g, '');

// SVG / HTML attribute conversions for JSX
const attrMap = {
  'class=': 'className=',
  'for=': 'htmlFor=',
  'tabindex=': 'tabIndex=',
  'colspan=': 'colSpan=',
  'rowspan=': 'rowSpan=',
  'readonly=': 'readOnly=',
  'maxlength=': 'maxLength=',
  'stroke-width=': 'strokeWidth=',
  'stroke-linecap=': 'strokeLinecap=',
  'stroke-linejoin=': 'strokeLinejoin=',
  'stroke-miterlimit=': 'strokeMiterlimit=',
  'fill-rule=': 'fillRule=',
  'clip-rule=': 'clipRule=',
  'fill-opacity=': 'fillOpacity=',
  'stroke-opacity=': 'strokeOpacity=',
  'xmlns:xlink=': 'xmlnsXlink=',
  'xlink:href=': 'xlinkHref=',
  'viewbox=': 'viewBox=',
  'autoplay=': 'autoPlay=',
  'crossorigin=': 'crossOrigin=',
};

for (const [from, to] of Object.entries(attrMap)) {
  html = html.replaceAll(from, to);
}

// Numeric attributes
html = html.replace(/\bcols="(\d+)"/g, 'cols={$1}');
html = html.replace(/\brows="(\d+)"/g, 'rows={$1}');

// Fix image/asset paths
html = html.replace(/src="img\//g, 'src="/img/');
html = html.replace(/href="img\//g, 'href="/img/');

// Self-close void elements
html = html.replace(/<img([^>]*?)(?<!\/)>/g, '<img$1 />');
html = html.replace(/<input([^>]*?)(?<!\/)>/g, '<input$1 />');
html = html.replace(/<br(?!\s*\/)>/g, '<br />');
html = html.replace(/<hr(?!\s*\/)>/g, '<hr />');

// Convert internal .html links to React Router paths
html = html.replace(/href="([^"#][^"]*?)"/g, (_, link) => {
  if (link.startsWith('http') || link.startsWith('mailto:') || link.startsWith('tel:') || link === '#') {
    return `href="${link}"`;
  }
  const route = link
    .replace(/\.html$/, '')
    .replace(/^index$/, '/')
    .replace(/^\//, '');
  const path = route === '' || route === 'index' ? '/' : `/${route}`;
  return `href="${path}"`;
});

// Escape JSX problematic ampersands in text (not in attributes)
html = html.replace(/>([^<]*&[^<]*)</g, (match, text) => {
  if (text.includes('&amp;') || text.includes('&lt;') || text.includes('&gt;')) return match;
  return `>${text.replace(/&/g, '&amp;')}<`;
});

const component = `/* Auto-generated from edurock_html_template/index.html — do not edit manually */
export default function HomePageContent() {
  return (
    <>
${html
  .split('\n')
  .map((line) => '      ' + line)
  .join('\n')}
    </>
  );
}
`;

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, component, 'utf8');
console.log(`Written ${outputPath} (${component.length} chars)`);
