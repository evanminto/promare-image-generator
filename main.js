import { LitElement, html, css } from 'lit-element';
import 'focus-visible';
import ResizeObserver from 'resize-observer-polyfill';

function isJapanese(str) {
  return Boolean(str.match(/[\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\uff00-\uff9f\u4e00-\u9faf\u3400-\u4dbf]/));
}

function fitText(el, styles, width, constrainSize = false, replaceSpecialChars = false) {
  const testEl = document.createElement('span');
  document.body.appendChild(testEl);

  const jp = isJapanese(el.textContent);

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

  let textContent = el.textContent

  if (replaceSpecialChars　&& !jp) {
    textContent = textContent.replace(/([^a-zA-Z'"!@\(\)_\-\^\n ])/g, 'xx');
  }

  if (constrainSize) {
    while (textContent.length < 8) {
      if (jp) {
        textContent += 'ア';
      } else {
        textContent += 'x';
      }
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

    let width = 0;

    this.resizeObserver = new ResizeObserver(entries => {
      if (entries[0].contentRect.width !== width) {
        width = entries[0].contentRect.width;
        this.init();
      }
    });

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
      fontFamily: "'Beethoven', 'GN Kill Gothic U', sans-serif",
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
        font-family: 'Beethoven', 'GN Kill Gothic U', sans-serif;
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
      fontFamily: "'Xtreem', '851 Chikara', fantasy",
      textTransform: 'none',
      wordSpacing: '-0.15ch',
    }, targetWidth, true, true);
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
    return css`
      :host {
        display: block;
        font-family: 'Xtreem', '851 Chikara', fantasy;
        font-weight: bold;
        color: #D41A1A;
        font-size: var(--font-size-fit);
        filter: drop-shadow(0 0.035em #000000);
        width: 100%;
        text-align: center;
        text-transform: none;
        word-spacing: -0.15ch;
      }

      :host([lang='ja']) {
        font-size: calc(1.125 * var(--font-size-fit));
        font-style: italic;
      }

      ::slotted(span.special-chars) {
        font-family: '851 Chikara', fantasy;
        font-size: 0.5em;
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
      colorBg: {
        type: String,
        attribute: true,
      },
      colorText: {
        type: String,
        attribute: true,
      },
      colorTextBottom: {
        type: String,
        attribute: true,
      },
      colorShadow: {
        type: String,
        attribute: true,
      },
    }
  }

  init() {
    this.renderRoot.querySelector('title-text').init();
  }

  get isScriptJapanese() {
    return isJapanese(this.script);
  }

  get safeScript() {
    const html = this.script.replace(/([^a-zA-Z'"!@\(\)_\-\^ ]+)/g, '<span class="special-chars">$1</span>');
    const template = document.createElement('template');
    template.innerHTML = html;

    return template.content;
  }

  render() {
    return html`
      <title-text style="--color-bg: ${this.colorBg}; --color-text: ${this.colorText}; --color-text-bottom: ${this.colorTextBottom}; --color-shadow: ${this.colorShadow};">
        ${this.line1 ? html`<title-text-line>${this.line1}</title-text-line>` : ''}
        ${this.line2 ? html`<title-text-line>${this.line2}</title-text-line>` : ''}
        ${this.line3 ? html`<title-text-line>${this.line3}</title-text-line>` : ''}
        ${this.script ? html`
          <title-text-script lang="${this.isScriptJapanese ? 'ja' : undefined}">
            ${this.safeScript}
          </title-text-script>
        ` : ''}
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

      frame.line1 = '';
      frame.line1 = data.get('line1').trim();
      frame.line2 = '';
      frame.line2 = data.get('line2').trim();
      frame.line3 = '';
      frame.line3 = data.get('line3').trim();
      frame.script = '';
      frame.script = data.get('script').trim();
      frame.colorScheme = data.get('color_scheme');

      frame.hidden = false;

      const status = document.querySelector('aria-status');
      status.message = 'Title generated!';
    };

    setTimeout(() => {
      handleSubmit(this.querySelector('form'));
    }, 500);

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

class ColorSelectElement extends LitElement {
  // createRenderRoot() {
  //   return this;
  // }

  static get properties() {
    return {
      name: {
        type: String,
        attribute: true,
      },
      label: {
        type: String,
        attribute: true,
      },
    };
  }

  render() {
    return html`
      <fieldset>
        <legend>${this.label}</legend>

        <ul>
          ${Array.from(this.children).map((child, index) => {
            if (!child.matches('color-option')) {
              return undefined;
            }

            const option = child;
            const id = `color${index}`;

            return html`
              <li>
                <input id="${id}" name="${this.name}" type="radio" ?checked="${option.selected}">
                <label for="${id}" style="--bg: ${option.value === '_' ? option.placeholderValue : option.value}; --text: ${option.contrastValue}">
                  ${option.name}
                </label>
              </li>
            `;
          })}
        </ul>
      </fieldset>
    `;
  }

  static get styles() {
    return css`
      * {
        box-sizing: border-box;
      }

      :host {
        display: block;
        text-align: center;
      }

      fieldset {
        padding: 0;
        border: 0;
      }

      legend {
        display: block;
        font-weight: bold;
        letter-spacing: 0.0625ch;
      }

      legend + * {
        margin-top: 0.1875rem;
      }

      ul {
        list-style: none;
        padding: 0;

        display: flex;
        flex-wrap: wrap;
        margin-left: -0.75rem;
        margin-bottom: -0.75rem;
      }

      ul > * {
        flex: 1 1 calc((var(--breakpoint, 15rem) - 100%) * 9999);
        margin: 0 0 0.75rem 0.75rem;
      }

      ul > :first-child:nth-last-child(3),
      ul > :first-child:nth-last-child(3) ~ * {
        --breakpoint: 20rem;
      }

      ul > :first-child:nth-last-child(4),
      ul > :first-child:nth-last-child(4) ~ * {
        --breakpoint: 30rem;
      }

      li {
        position: relative;
      }

      input {
        opacity: 0;
        position: absolute;
      }

      label {
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--bg);
        color: var(--text);
        padding: 0.75rem 1.5rem;
        width: 100%;
        font-size: 0.75rem;
        height: 100%;
      }

      input:checked ~ label {
        outline: 0.125rem solid currentColor;
        outline-offset: -0.375rem;
      }

      input:focus ~ label {
        box-shadow: 0 0 0 0.25rem currentColor;
      }
    `;
  }
}

customElements.define('color-select', ColorSelectElement);

class ColorOptionElement extends LitElement {
  constructor() {
    super();

    this.contrastValue = this.contrastValue ? this.contrastValue : 'black';
  }

  static get properties() {
    return {
      name: {
        type: String,
        attribute: true,
      },
      value: {
        type: String,
        attribute: true,
      },
      contrastValue: {
        type: String,
        attribute: 'contrast-value',
      },
      placeholderValue: {
        type: String,
        attribute: 'placeholder-value',
      },
      selected: {
        type: Boolean,
        attribute: true,
      },
    }
  }
}

customElements.define('color-option', ColorOptionElement);
