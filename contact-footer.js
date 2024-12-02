class ContactFooter extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.contactData = null;
    this.retryCount = 0;
    this.maxRetries = 3;
    this.currentLinkIndex = 0;
  }

  async connectedCallback() {
    this.render();
    await this.fetchContactData();
  }

  static get observedAttributes() {
    return ['theme'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'theme' && oldValue !== newValue) {
      this.updateTheme(newValue);
    }
  }

  async fetchContactData() {
    try {
      this.showLoading();
      console.log('Fetching contact data...');
      const response = await fetch('contact.json', {
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const text = await response.text();
      console.log('Raw response:', text);

      try {
        this.contactData = JSON.parse(text);
        console.log('Parsed contact data:', this.contactData);
        this.updateContent();
        this.startRotation();
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        throw new Error('Failed to parse contact data');
      }
    } catch (error) {
      console.error('Error loading contact data:', error);
      if (this.retryCount < this.maxRetries) {
        this.retryCount++;
        console.log(`Retrying... attempt ${this.retryCount} of ${this.maxRetries}`);
        setTimeout(() => this.fetchContactData(), 1000 * this.retryCount);
      } else {
        this.showError();
      }
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

      :host {
        display: block;
        --primary-bg: #000000;
        --primary-text: #33ff33;
        --link-color: #33ff33;
        font-family: 'DOS', 'Courier New', monospace;
      }

      .footer {
        background-color: var(--primary-bg);
        color: var(--primary-text);
        padding: 0.5rem;
        height: 1.5rem;
        overflow: hidden;
        position: relative;
        border-top: 2px solid var(--primary-text);
        animation: flicker 10s infinite;
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
      }

      .container {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100%;
      }

      .rotating-links {
        position: relative;
        height: 1.5rem;
        overflow: hidden;
        display: inline-block;
        min-width: 200px;
      }

      .link-wrapper {
        position: absolute;
        width: 100%;
        text-align: center;
        transition: transform 0.5s ease-in-out;
        opacity: 0;
        transform: translateY(100%);
      }

      .link-wrapper.active {
        opacity: 1;
        transform: translateY(0);
      }

      .link-wrapper.previous {
        opacity: 0;
        transform: translateY(-100%);
      }

      a {
        color: var(--link-color);
        text-decoration: none;
        position: relative;
        padding: 0 0.5rem;
        text-shadow: 0 0 5px var(--link-color);
        letter-spacing: 1px;
        white-space: nowrap;
      }

      a:hover {
        background-color: var(--link-color);
        color: var(--primary-bg);
        text-shadow: none;
      }

      a::before {
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
      }
    `;
  }

  render() {
    const styles = this.getStyles();
    this.shadowRoot.innerHTML = `
      <style>${styles}</style>
      <footer class="footer" role="contentinfo">
        <div class="container">
          <div class="loading" role="status" aria-live="polite">
            LOADING CONTACT DATA
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

  updateContent() {
    if (!this.contactData) return;

    const container = this.shadowRoot.querySelector('.container');
    container.innerHTML = `
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

  showLoading() {
    const container = this.shadowRoot.querySelector('.container');
    container.innerHTML = `
      <div class="loading" role="status" aria-live="polite">
        LOADING CONTACT DATA
      </div>
    `;
  }

  showError() {
    const container = this.shadowRoot.querySelector('.container');
    container.innerHTML = `
      <div class="error" role="alert">
        SYSTEM ERROR: CONTACT DATA NOT FOUND
      </div>
    `;
  }

  updateTheme(theme) {
    this.render();
    if (this.contactData) {
      this.updateContent();
    }
  }
}

customElements.define('contact-footer', ContactFooter);
