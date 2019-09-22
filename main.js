import { LitElement, html, css } from 'lit-element';
import 'focus-visible';
import ResizeObserver from 'resize-observer-polyfill';

function fitText(el, styles, width, constrainSize = false) {
  const testEl = document.createElement('span');
  document.body.appendChild(testEl);

  function getFontSize(val) {
    return `${val}em`;
  }

  const targetWidth = width * 0.85;

  let i = targetWidth / 32;

  testEl.style.position = 'absolute';
  testEl.style.visibility = 'hidden';
  testEl.style.whiteSpace = 'nowrap';
  Object.keys(styles).forEach(prop => {
    testEl.style[prop] = styles[prop];
  });
  testEl.style.fontSize = getFontSize(i);

  let textContent = el.textContent;

  if (constrainSize) {
    while (textContent.length < 8) {
      textContent += 'x';
    }
  }

  testEl.textContent = textContent;

  if (parseInt(window.getComputedStyle(testEl).width.replace('px', '')) < targetWidth) {
    while (parseInt(window.getComputedStyle(testEl).width.replace('px', '')) < targetWidth) {
      i += 0.125;
      testEl.style.fontSize = getFontSize(i);
    }
  } else {
    while (parseInt(window.getComputedStyle(testEl).width.replace('px', '')) > targetWidth) {
      i -= 0.125;
      testEl.style.fontSize = getFontSize(i);
    }
  }

  testEl.remove();

  return getFontSize(i);
}

class TitleTextElement extends LitElement {
  connectedCallback() {
    super.connectedCallback();

    // this.mutationObserver = new MutationObserver(() => {
    //   console.log('mutation');
    //   this.init();
    // });

    let width = 0;

    this.resizeObserver = new ResizeObserver(entries => {
      if (entries[0].contentRect.width !== width) {
        width = entries[0].contentRect.width;
        this.init();
      }
    });

    // this.mutationObserver.observe(this.renderRoot, {
    //   childList: true,
    //   subtree: true,
    //   characterData: true,
    // });

    this.resizeObserver.observe(this);
  }

  init() {
    const rect = this.getBoundingClientRect();

    this.targetWidthBlock = rect.width;
    this.targetWidthScript = rect.width * 0.75;

    Array.from(this.querySelectorAll('title-text-line, title-text-script')).forEach(el => el.init());
  }

  render() {
    return html`
      <div>
        <slot></slot>
      </div>
    `;
  }

  static get styles() {
    return css`
      :host {
        display: block;
        position: relative;
        line-height: 0.9;
      }

      ::slotted(title-text-script) {
        transform: translate(-50%, calc(50% + 0.125em)) rotate(-7.5deg);
        position: absolute;
        left: 50%;
        bottom: 50%;
      }

      div {
        transform: perspective(36em) rotate3d(1, 0, 0, 12deg) scale(0.85);
      }
    `;
  }
}

customElements.define('title-text', TitleTextElement);

class TitleTextLineElement extends LitElement {
  constructor() {
    super();
  }

  init() {
    const targetWidth = this.closest('title-text').targetWidthBlock;
    const fontSize = fitText(this, {
      fontFamily: "'Beethoven', sans-serif",
    }, targetWidth);
    this.style.setProperty('--font-size-fit', fontSize);
  }

  connectedCallback() {
    super.connectedCallback();

    this.init();

    this.observer = new MutationObserver(() => {
      this.init();
    });

    this.observer.observe(this, {
      characterData: true,
      childList: true,
      subtree: true,
    });
  }

  render() {
    return html`<span><slot></slot></span>`;
  }

  static get styles() {
    return css`
      :host {
        display: block;
        font-family: 'Beethoven', sans-serif;
        font-size: var(--font-size-fit);
        font-weight: bold;
        text-transform: uppercase;
        filter: drop-shadow(0 0.025em #FBF41A);
        margin: auto;
        text-align: center;
      }

      span {
        -webkit-background-clip: text;
        background-clip: text;
        background-color: #000;
        background-image: linear-gradient(
          to top,
          #780967,
          #000 60%,
          #000
        );
        color: transparent;
      }
    `;
  }
}

customElements.define('title-text-line', TitleTextLineElement);

class TitleTextScriptElement extends LitElement {
  constructor() {
    super();
  }

  render() {
    return html`<span><slot></slot></span>`;
  }

  init() {
    const targetWidth = this.closest('title-text').targetWidthScript;
    const fontSize = fitText(this, {
      fontFamily: "'Xtreem', 'FC-Flower', fantasy",
      textTransform: 'none',
      wordSpacing: '-0.15ch',
    }, targetWidth, true);
    this.style.setProperty('--font-size-fit', fontSize);
  }

  connectedCallback() {
    super.connectedCallback();

    this.init();

    this.observer = new MutationObserver(() => {
      this.init();
    });

    this.observer.observe(this, {
      characterData: true,
      childList: true,
      subtree: true,
    });
  }

  static get styles() {
    // x * c = w
    // x = f * r
    // r = cx / cy
    // f * r * c = w
    // f = w / (r * c)

    return css`
      :host {
        display: block;
        font-family: 'Xtreem', 'FC-Flower', fantasy;
        // font-family: 'Miss Rhinetta', 'FC-Flower', fantasy;
        font-weight: bold;
        color: #D41A1A;
        --x-y-ratio: 11/20;
        --target-width: 8em;
        // font-size: calc(var(--target-width) / (var(--x-y-ratio) * var(--char-count)));
        font-size: var(--font-size-fit);
        filter: drop-shadow(0 0.035em #000000);
        width: 100%;
        text-align: center;
        text-transform: none;
        word-spacing: -0.15ch;
      }

      span {
        -webkit-background-clip: text;
        background-clip: text;
        background-color: #D41A1A;
        background-image: linear-gradient(
          to top,
          #C74816,
          #C74816 30%,
          #D41A1A 50%,
          #D41A1A
        );
        color: transparent;
        padding: 0.25em;
      }
    `;
  }
}

customElements.define('title-text-script', TitleTextScriptElement);

class TitleTextFrameElement extends LitElement {
  constructor() {
    super();
  }

  static get properties() {
    return {
      line1: {
        type: String,
        attribute: true,
      },
      line2: {
        type: String,
        attribute: true,
      },
      line3: {
        type: String,
        attribute: true,
      },
      script: {
        type: String,
        attribute: true,
      },
    }
  }

  init() {
    this.renderRoot.querySelector('title-text').init();
  }

  render() {
    return html`
      <title-text>
        ${this.line1 ? html`<title-text-line>${this.line1}</title-text-line>` : ''}
        ${this.line2 ? html`<title-text-line>${this.line2}</title-text-line>` : ''}
        ${this.line3 ? html`<title-text-line>${this.line3}</title-text-line>` : ''}
        ${this.script ? html`<title-text-script>${this.script}</title-text-script>` : ''}
      </title-text>
    `;
  }

  static get styles() {
    return css`
      :host {
        display: block;
        background: #EC164C;
        padding: 20% calc(0.5em + 1vw);
      }
    `;
  }
}

customElements.define('title-text-frame', TitleTextFrameElement);

// class TitleTextImageElement extends LitElement {
//   constructor() {
//     super();
//   }

//   static get properties() {
//     return {
//       canvas: {
//         type: Object,
//       },
//     }
//   }

//   async generate(el) {
//     this.canvas = await html2canvas(el);
//     // this.src = await domtoimage.toPng(el);
//   }

//   render() {
//     return html`
//       ${this.canvas}
//     `;
//   }

//   static get styles() {
//     return css``;
//   }
// }

// customElements.define('title-text-image', TitleTextImageElement);

class TitleTextFormElement extends LitElement {
  constructor() {
    super();
  }

  connectedCallback() {
    super.connectedCallback();

    const handleSubmit = async form => {
      await Promise.all([
        customElements.whenDefined('title-text-frame'),
        customElements.whenDefined('aria-status'),
      ]);

      const data = new FormData(form);

      const frame = this.output.querySelector('title-text-frame');
      frame.hidden = true;

      frame.line1 = data.get('line1');
      frame.line2 = data.get('line2');
      frame.line3 = data.get('line3');
      frame.script = data.get('script');

      frame.hidden = false;

      const status = document.querySelector('aria-status');
      status.message = 'Title generated!';
    };

    handleSubmit(this.querySelector('form'));

    this.addEventListener('submit', event => {
      event.preventDefault();
      handleSubmit(event.target);
    });
  }

  get output() {
    const controlsId = this.getAttribute('aria-controls');

    return document.getElementById(controlsId);
  }

  render() {
    return html`<slot></slot>`;
  }

  static get styles() {
    return css`
      :host {
        display: block;
      }
    `;
  }
}

customElements.define('title-text-form', TitleTextFormElement);

class AriaStatusElement extends HTMLElement {
  constructor() {
    super();

    this.setAttribute('role', 'alert');
    this.setAttribute('aria-live', 'assertive');
  }

  set message(value) {
    this.textContent = '';
    setTimeout(() => {
      this.textContent = value;
    }, 250);
  }
}

customElements.define('aria-status', AriaStatusElement);
