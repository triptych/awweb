class ContactFooter extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.contactData = null;
    this.blogData = null;
    this.retryCount = 0;
    this.maxRetries = 3;
    this.currentLinkIndex = 0;
    this.currentBlogIndex = 0;
  }

  async connectedCallback() {
    this.render();
    try {
      console.log('Initializing footer...');
      const [contactData, blogData] = await Promise.all([
        this.fetchData('contact.json'),
        this.fetchData('blog.json')
      ]);

      console.log('Contact data loaded:', contactData);
      console.log('Blog data loaded:', blogData);

      this.contactData = contactData;
      this.blogData = blogData;

      this.updateContent();
      this.startRotation();
      this.startBlogTicker();
    } catch (error) {
      console.error('Error initializing footer:', error);
      this.showError();
    }
  }

  async fetchData(url) {
    console.log(`Fetching data from ${url}...`);
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
    }
    const text = await response.text();
    console.log(`Raw response from ${url}:`, text);
    try {
      return JSON.parse(text);
    } catch (error) {
      console.error(`Failed to parse JSON from ${url}:`, error);
      throw error;
    }
  }

  static get observedAttributes() {
    return ['theme'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'theme' && oldValue !== newValue) {
      this.updateTheme(newValue);
    }
  }

  getStyles() {
    return `
      @keyframes blink {
        0%, 100% { opacity: 1; }
        50% { opacity: 0; }
      }

      @keyframes scanline {
        0% { transform: translateY(-100%); }
        100% { transform: translateY(100%); }
      }

      @keyframes flicker {
        0% { opacity: 0.97; }
        5% { opacity: 0.95; }
        10% { opacity: 0.9; }
        15% { opacity: 0.95; }
        20% { opacity: 0.98; }
        25% { opacity: 0.95; }
        30% { opacity: 0.9; }
        35% { opacity: 0.95; }
        40% { opacity: 0.98; }
        45% { opacity: 0.95; }
        50% { opacity: 0.97; }
        55% { opacity: 0.95; }
        60% { opacity: 0.98; }
        65% { opacity: 0.95; }
        70% { opacity: 0.9; }
        75% { opacity: 0.95; }
        80% { opacity: 0.98; }
        85% { opacity: 0.95; }
        90% { opacity: 0.9; }
        95% { opacity: 0.95; }
        100% { opacity: 0.98; }
      }

      @keyframes tickerMove {
        0% { transform: translateX(0); }
        100% { transform: translateX(calc(-100% - var(--ticker-gap))); }
      }

      :host {
        display: block;
        --primary-bg: #000000;
        --primary-text: #33ff33;
        --link-color: #33ff33;
        --secondary-color: #1a5517;
        --ticker-gap: 3rem;
        font-family: 'DOS', 'Courier New', monospace;
      }

      .footer {
        background-color: var(--primary-bg);
        color: var(--primary-text);
        overflow: hidden;
        position: relative;
        border-top: 2px solid var(--primary-text);
        animation: flicker 10s infinite;
        height: 2rem;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 1rem;
      }

      .footer::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(
          transparent 50%,
          rgba(51, 255, 51, 0.05) 50%
        );
        background-size: 100% 4px;
        pointer-events: none;
        z-index: 1;
      }

      .footer::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(51, 255, 51, 0.1);
        animation: scanline 8s linear infinite;
        pointer-events: none;
        z-index: 1;
      }

      .name {
        white-space: nowrap;
        font-weight: bold;
        flex: 0 0 auto;
        margin-right: 2rem;
      }

      .contact-container {
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        z-index: 2;
        flex: 0 0 auto;
        margin-right: 2rem;
      }

      .ticker-container {
        flex: 1;
        height: 100%;
        overflow: hidden;
        position: relative;
        display: flex;
        align-items: center;
      }

      .ticker-wrapper {
        position: relative;
        width: 100%;
        height: 100%;
        overflow: hidden;
      }

      .ticker-wrapper::before {
        content: '';
        position: absolute;
        left: 0;
        top: 0;
        height: 100%;
        width: 50px;
        background: linear-gradient(to right, var(--primary-bg) 0%, transparent 100%);
        z-index: 3;
        pointer-events: none;
      }

      .ticker-content {
        position: absolute;
        white-space: nowrap;
        height: 100%;
        display: flex;
        align-items: baseline;
        animation: tickerMove var(--ticker-duration, 30s) linear infinite;
        padding-left: 100%;
        margin-top: 2px;
      }

      .ticker-entry {
        display: inline-flex;
        align-items: baseline;
        padding: 0 var(--ticker-gap);
        position: relative;
        height: 1.5rem;
        line-height: 1.5rem;
      }

      .ticker-entry::before {
        content: '>';
        margin-right: 0.5rem;
        animation: blink 1s step-end infinite;
      }

      .ticker-entry::after {
        content: '•';
        position: absolute;
        right: 0;
        color: var(--primary-text);
        opacity: 0.5;
      }

      .ticker-content a {
        color: var(--link-color);
        text-decoration: none;
        margin: 0 0.25rem;
        padding: 0 0.5rem;
        text-shadow: 0 0 5px var(--link-color);
        letter-spacing: 1px;
      }

      .ticker-content a:hover {
        background-color: var(--link-color);
        color: var(--primary-bg);
        text-shadow: none;
      }

      .rotating-links {
        position: relative;
        height: 1.5rem;
        line-height: 1.5rem;
        overflow: hidden;
        display: inline-block;
        min-width: 150px;
      }

      .link-wrapper {
        position: absolute;
        width: 100%;
        text-align: center;
        transition: transform 0.5s ease-in-out;
        opacity: 0;
        transform: translateY(100%);
        height: 1.5rem;
        line-height: 1.5rem;
      }

      .link-wrapper.active {
        opacity: 1;
        transform: translateY(0);
      }

      .link-wrapper.previous {
        opacity: 0;
        transform: translateY(-100%);
      }

      .contact-container a {
        color: var(--link-color);
        text-decoration: none;
        position: relative;
        padding: 0 0.5rem;
        text-shadow: 0 0 5px var(--link-color);
        letter-spacing: 1px;
        white-space: nowrap;
        height: 1.5rem;
        line-height: 1.5rem;
      }

      .contact-container a:hover {
        background-color: var(--link-color);
        color: var(--primary-bg);
        text-shadow: none;
      }

      .contact-container a::before {
        content: '>';
        margin-right: 0.5rem;
        animation: blink 1s step-end infinite;
      }

      .loading, .error {
        text-align: center;
        padding: 0.5rem;
        color: var(--primary-text);
        text-shadow: 0 0 5px var(--primary-text);
        font-size: 14px;
        text-transform: uppercase;
      }

      .loading::after {
        content: '_';
        animation: blink 1s step-end infinite;
      }

      @media (prefers-reduced-motion: reduce) {
        .link-wrapper {
          transition: none !important;
        }
        .footer::before {
          animation: none;
        }
        .footer {
          animation: none;
        }
        .ticker-content {
          animation: none;
          transform: none;
        }
      }
    `;
  }

  render() {
    const styles = this.getStyles();
    this.shadowRoot.innerHTML = `
      <style>${styles}</style>
      <footer class="footer" role="contentinfo">
        <div class="name">Andrew Wooldridge</div>
        <div class="contact-container">
          <div class="loading" role="status" aria-live="polite">
            LOADING CONTACT DATA
          </div>
        </div>
        <div class="ticker-container">
          <div class="loading" role="status" aria-live="polite">
            LOADING BLOG DATA
          </div>
        </div>
      </footer>
    `;
  }

  getAllLinks() {
    const { email, social, additional_contact } = this.contactData;
    const links = [
      { label: 'Email', url: `mailto:${email}` },
      ...Object.entries(social).map(([platform, url]) => ({
        label: platform.charAt(0).toUpperCase() + platform.slice(1),
        url
      })),
      ...Object.entries(additional_contact).map(([platform, url]) => ({
        label: platform.charAt(0).toUpperCase() + platform.slice(1),
        url
      }))
    ];
    return links;
  }

  startRotation() {
    if (!this.contactData) return;

    setInterval(() => {
      const links = this.getAllLinks();
      const wrapper = this.shadowRoot.querySelector('.rotating-links');
      if (!wrapper) return;

      const currentElement = wrapper.children[0];
      const newElement = document.createElement('div');
      newElement.className = 'link-wrapper';

      this.currentLinkIndex = (this.currentLinkIndex + 1) % links.length;
      const link = links[this.currentLinkIndex];

      newElement.innerHTML = `
        <a href="${link.url}"
           target="_blank"
           rel="noopener noreferrer"
           aria-label="${link.label} link">
          ${link.label}
        </a>
      `;

      if (currentElement) {
        currentElement.classList.remove('active');
        currentElement.classList.add('previous');
        setTimeout(() => currentElement.remove(), 500);
      }

      wrapper.appendChild(newElement);
      setTimeout(() => newElement.classList.add('active'), 50);
    }, 3000);
  }

  startBlogTicker() {
    if (!this.blogData) return;

    const tickerContainer = this.shadowRoot.querySelector('.ticker-container');
    const createTickerContent = () => {
      const wrapper = document.createElement('div');
      wrapper.className = 'ticker-wrapper';

      const content = document.createElement('div');
      content.className = 'ticker-content';
      content.innerHTML = this.blogData.entries.map(entry => {
        const text = entry.text.replace(/(https?:\/\/\S+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>');
        return `<span class="ticker-entry">${text}</span>`;
      }).join('');

      // Calculate animation duration based on content length
      const contentLength = content.textContent.length;
      const baseSpeed = 50; // pixels per second
      const duration = Math.max(30, contentLength / baseSpeed * 15);
      content.style.setProperty('--ticker-duration', `${duration}s`);

      wrapper.appendChild(content);
      return wrapper;
    };

    tickerContainer.innerHTML = '';
    const wrapper = createTickerContent();
    tickerContainer.appendChild(wrapper);

    // Reset animation when it completes
    const content = wrapper.querySelector('.ticker-content');
    content.addEventListener('animationend', () => {
      tickerContainer.innerHTML = '';
      const newWrapper = createTickerContent();
      tickerContainer.appendChild(newWrapper);
    });
  }

  updateContent() {
    if (!this.contactData) return;

    const contactContainer = this.shadowRoot.querySelector('.contact-container');
    contactContainer.innerHTML = `
      <div class="rotating-links">
        <div class="link-wrapper active">
          <a href="mailto:${this.contactData.email}"
             aria-label="Email link">
            Email
          </a>
        </div>
      </div>
    `;
  }

  showError() {
    const contactContainer = this.shadowRoot.querySelector('.contact-container');
    const tickerContainer = this.shadowRoot.querySelector('.ticker-container');

    contactContainer.innerHTML = `
      <div class="error" role="alert">
        SYSTEM ERROR: CONTACT DATA NOT FOUND
      </div>
    `;

    tickerContainer.innerHTML = `
      <div class="error" role="alert">
        SYSTEM ERROR: BLOG DATA NOT FOUND
      </div>
    `;
  }

  updateTheme(theme) {
    this.render();
    if (this.contactData) {
      this.updateContent();
    }
    if (this.blogData) {
      this.startBlogTicker();
    }
  }
}

customElements.define('contact-footer', ContactFooter);
