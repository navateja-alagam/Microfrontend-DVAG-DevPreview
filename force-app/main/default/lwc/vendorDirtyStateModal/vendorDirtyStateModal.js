/**
 * dirtyStateModal — Generic, config-driven LWC modal shipped with
 * @lightning-out/lwc-shell.
 *
 * IMPORTANT: This modal is intentionally **generic**. It does NOT hard-code
 * any specific labels, descriptions, or button definitions. Instead, it
 * receives all of its display configuration through the `modalFields` @api
 * property at open-time. This makes it reusable for any confirmation
 * scenario — the caller decides what the modal says and which buttons it
 * shows.
 *
 * The **concrete configuration** for the current lwc-shell dirty-state
 * flow lives in `InternalHostLwcShell.ts` inside the
 * `[DoCloseConfirmation]()` method, where the `dirtStateModalConfig` object
 * is built and passed to `DirtyStateModal.open(dirtStateModalConfig)`.
 * That config currently specifies:
 *   - label: "Unsaved Changes"
 *   - description: "You have unsaved changes. If you leave, your changes
 *     will be lost."
 *   - buttons: "Cancel" and "Discard Changes" (brand variant)
 *   - size: "small"
 *
 * If you need to change the wording, add/remove buttons, or adjust the
 * modal size, update the config object in `InternalHostLwcShell.ts` —
 * **not** in this component.
 *
 * ---
 * Deployment: customers must copy this component from the lwc-shell
 * package's `dist/lwc/dirtyStateModal/` folder into their own SFDX
 * project and deploy it to their Salesforce org.
 *
 * Usage in wrapper LWC:
 *   import DirtyStateModal from 'c/dirtyStateModal';
 *   shell.dirtyStateModal = DirtyStateModal;
 */
import LightningModal from "lightning/modal";
import { api } from "lwc";

export default class DirtyStateModal extends LightningModal {
    /**
     * Generic configuration object — NOT owned by this component.
     *
     * The actual values are supplied by the caller (InternalHostLwcShell)
     * at open-time via `DirtyStateModal.open({ modalFields: { ... } })`.
     * The defaults below are minimal fallbacks; the real config (label,
     * description, full button set) is defined in InternalHostLwcShell's
     * `[DoCloseConfirmation]()` method.
     *
     * Shape:
     *   {
     *     label:       string,          // Modal header text
     *     description: string,          // Modal body text
     *     buttons: [                    // Footer buttons (rendered dynamically)
     *       {
     *         buttonKey:     string,    // Unique key returned on click
     *         buttonLabel:   string,    // Visible label
     *         buttonVariant: string     // Optional SLDS variant (e.g. 'brand')
     *       }
     *     ]
     *   }
     */
    @api modalFields = {
        label: "Unsaved Changes",
        description: "You have unsaved changes.",
        buttons: [
            {
                buttonKey: "cancel",
                buttonLabel: "Cancel",
            },
        ],
    };

    /**
     * Generic button handler — closes the modal and returns the clicked
     * button's `buttonKey` to the caller's `.open()` promise so the caller
     * (InternalHostLwcShell) can decide what action to take.
     */
    handleButtonClick(event) {
        const key = event.target.dataset.key;
        this.close(key);
    }
}
