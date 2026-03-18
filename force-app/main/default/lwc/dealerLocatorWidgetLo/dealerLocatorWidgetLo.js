import { LightningElement, api } from 'lwc';
import 'c/vendorLwcShell';

export default class DealerLocatorWidget extends LightningElement {
    @api baseUrl = 'https://dvag-demo.com:4300';

    _shellElement;

    get computedSrc() {
        const url = new URL(this.baseUrl);
        url.pathname = '/dealer-locator';
        return url.toString();
    }

    _handleWidgetReady = (e) => {
        console.log('widget-ready', e);
    };

    renderedCallback() {
        this._createShell();
    }

    disconnectedCallback() {
        if (this._shellElement) {
            this._shellElement.removeEventListener('widget-ready', this._handleWidgetReady);
            this._shellElement = null;
        }
    }

    _createShell() {
        if (this._shellElement) {
            return;
        }

        const container = this.template.querySelector('.shell-container');
        if (!container) {
            return;
        }

        const shell = document.createElement('lwc-shell');
        shell.style.height = '100%';
        shell.sandbox = 'allow-forms allow-modals';
        shell.title = 'Dealer Locator';
        shell.src = this.computedSrc;
        shell.addEventListener('widget-ready', this._handleWidgetReady);
        container.appendChild(shell);

        this._shellElement = shell;
    }
}
