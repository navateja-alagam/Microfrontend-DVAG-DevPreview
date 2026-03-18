/**
 * productRegistrationWidgetLo — LWC Recipe for lwc-shell integration.
 *
 * This component serves as the reference example ("recipe") showing how to
 * use the @lightning-out/lwc-shell package to embed a Micro-Frontend (MFE)
 * application inside a Salesforce Lightning page.
 *
 * Key integration points:
 * 1. Import 'c/lwcShell' (side-effect) — registers the <lwc-shell>
 *    custom element on the page.
 * 2. Create <lwc-shell> imperatively in `_createShell()` and configure it
 *    with sandbox tokens and src URL.
 * 3. Clean up in `disconnectedCallback()` to prevent memory leaks.
 *
 * See the lwc-shell package README for the full step-by-step guide.
 */
import { LightningElement, api, wire } from 'lwc';
import { getRecord, getFieldValue } from 'lightning/uiRecordApi';

// Side-effect import: registers the <lwc-shell> custom element.
// This corresponds to the `lwcShell` LWC entity created in Step 2 of the
// integration guide (copied from dist/index.esm.js).
import 'c/vendorLwcShell';

const NAME_FIELD = 'Product__c.Name';

export default class ProductRegistrationWidget extends LightningElement {
    /** Record ID provided by the Lightning record page context. */
    @api recordId;

    /** Base URL of the MFE application to embed. */
    @api baseUrl = 'https://dvag-demo.com:4300';

    _productName;
    _lastSent;
    _debugEnabled = true;

    /**
     * Private reference to the <lwc-shell> DOM element.
     * Used to call methods (e.g. updateData) and for cleanup in
     * disconnectedCallback.
     */
    _shellElement;

    /**
     * Arrow-function handler for the 'widget-ready' event dispatched by
     * <lwc-shell>. Re-dispatches the event so it bubbles up to any
     * wrapping Aura component.
     */
    _handleWidgetReady = (e) => {
        this._log('widget-ready', e);
    };

    _log(...args) {
        if (this._debugEnabled) {
            // eslint-disable-next-line no-console
            console.log(
                '[ProductRegistrationWidget]',
                JSON.stringify(args, null, 2)
            );
        }
    }

    /**
     * Builds the full URL for the MFE application.
     * Combines the baseUrl with a pathname and any query parameters
     * needed by the MFE (e.g. productId from the Lightning record page).
     */
    get computedSrc() {
        const url = new URL(this.baseUrl);
        url.pathname = '/register';
        if (this.recordId) {
            url.searchParams.set('productId', this.recordId);
        }
        return url.toString();
    }

    /**
     * Wire adapter: fetches the Product record and pushes updated data
     * to the embedded MFE whenever the record changes.
     */
    @wire(getRecord, { recordId: '$recordId', fields: [NAME_FIELD] })
    wiredRecord({ data }) {
        if (data) {
            this._productName = getFieldValue(data, NAME_FIELD);
            this._log('wiredRecord', {
                recordId: this.recordId,
                productName: this._productName
            });
            this._pushData();
        }
    }

    /**
     * LWC lifecycle: called on every render. We use this to create the
     * <lwc-shell> element once the container div is in the DOM.
     */
    renderedCallback() {
        this._createShell();
    }

    /**
     * LWC lifecycle: called when this component is removed from the DOM.
     * Removes the widget-ready listener and releases the shell reference
     * to prevent memory leaks.
     */
    disconnectedCallback() {
        if (this._shellElement) {
            this._shellElement.removeEventListener('widget-ready', this._handleWidgetReady);
            this._shellElement = null;
        }
    }

    /**
     * Imperatively creates the <lwc-shell> custom element and appends
     * it to the manual DOM container (`lwc:dom="manual"`).
     *
     * Guarded to run only once — early-returns if _shellElement already
     * exists or if the container div is not yet in the DOM.
     *
     * Configuration:
     * - sandbox: additional iframe sandbox tokens (allow-forms, allow-modals).
     * - title: accessible label applied to the container region and iframe.
     * - src: the computed MFE application URL.
     * - widget-ready listener: re-dispatched to bubble up to Aura wrappers.
     */
    _createShell() {
        if (this._shellElement) {
            return;
        }

        const container = this.template.querySelector('.shell-container');
        if (!container) {
            return;
        }

        const shell = document.createElement('lwc-shell');
        shell.sandbox = 'allow-forms allow-modals';
        shell.title = 'Product Registration';
        shell.src = this.computedSrc;
        shell.addEventListener('widget-ready', this._handleWidgetReady);
        container.appendChild(shell);

        this._shellElement = shell;
        this._log('shell created');
        this._pushData();
    }

    /**
     * Pushes Salesforce record data into the embedded MFE via the shell's
     * `updateData()` method. De-duplicates by comparing against the last
     * sent payload to avoid unnecessary bridge messages.
     *
     * Safe to call before the shell is created or before the bridge is
     * ready — the shell queues data internally until the bridge handshake
     * completes.
     */
    _pushData() {
        if (!this._shellElement || typeof this._shellElement.updateData !== 'function') {
            return;
        }

        const payload = {
            productId: this.recordId || '',
            productName: this._productName || ''
        };
        const last = this._lastSent || {};
        if (
            last.productId === payload.productId &&
            last.productName === payload.productName
        ) {
            return;
        }
        this._lastSent = payload;
        this._shellElement.updateData(payload);
        this._log('updateData', payload);
    }
}
