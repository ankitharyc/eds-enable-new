/*
 * Embed Block
 * Renders embeds for supported providers (YouTube, X/Twitter).
 * The embed is loaded lazily once it scrolls into view.
 */

const loadScript = (src, attrs) => {
  const script = document.createElement('script');
  script.src = src;
  if (attrs) Object.entries(attrs).forEach(([k, v]) => script.setAttribute(k, v));
  document.head.append(script);
  return script;
};

const getDefaultEmbed = (url) => `<div style="left: 0; width: 100%; height: 0; position: relative; padding-bottom: 56.25%;">
    <iframe src="${url.href}" style="border: 0; top: 0; left: 0; width: 100%; height: 100%; position: absolute;"
      allow="encrypted-media" allowfullscreen="" scrolling="no" loading="lazy" title="Content from ${url.hostname}"></iframe>
  </div>`;

const embedYoutube = (url) => {
  const usp = new URLSearchParams(url.search);
  let vid = usp.get('v');
  if (url.pathname.includes('embed/')) [, vid] = url.pathname.split('embed/');
  else if (url.host === 'youtu.be') [, vid] = url.pathname.split('/');
  const embed = `<div style="left: 0; width: 100%; height: 0; position: relative; padding-bottom: 56.25%;">
    <iframe src="https://www.youtube.com/embed/${vid}?rel=0&amp;v=${vid}"
      style="border: 0; top: 0; left: 0; width: 100%; height: 100%; position: absolute;"
      allow="autoplay; fullscreen; picture-in-picture; encrypted-media; accelerometer; gyroscope"
      allowfullscreen="" scrolling="no" loading="lazy" title="Content from Youtube"></iframe>
  </div>`;
  return embed;
};

const embedTwitter = (url) => {
  const embed = `<blockquote class="twitter-tweet"><a href="${url.href}"></a></blockquote>`;
  loadScript('https://platform.twitter.com/widgets.js');
  return embed;
};

const EMBEDS_CONFIG = [
  { name: 'youtube', match: ['youtube', 'youtu.be'], embed: embedYoutube },
  { name: 'twitter', match: ['twitter.com', 'x.com'], embed: embedTwitter },
];

const loadEmbed = (block, link) => {
  if (block.classList.contains('embed-is-loaded')) return;

  const url = new URL(link);
  const config = EMBEDS_CONFIG.find((e) => e.match.some((match) => link.includes(match)));
  if (config) {
    block.innerHTML = config.embed(url);
    block.classList = `block embed embed-${config.name}`;
  } else {
    block.innerHTML = getDefaultEmbed(url);
    block.classList = 'block embed';
  }
  block.classList.add('embed-is-loaded');
};

export default function decorate(block) {
  const link = block.querySelector('a')?.href || block.textContent.trim();
  block.textContent = '';

  if (!link) return;

  const observer = new IntersectionObserver((entries) => {
    if (entries.some((e) => e.isIntersecting)) {
      observer.disconnect();
      loadEmbed(block, link);
    }
  });
  observer.observe(block);
}
