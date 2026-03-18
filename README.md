# Microfrontend-DVAG-DevPreview

This is a **Salesforce SFDX application** that demonstrates how to embed Micro-Frontend (MFE) applications inside Salesforce Lightning pages using `@lightning-out/lwc-shell`.

The repo contains two main pieces:

1. **Salesforce metadata** (`force-app/`) — a set of Lightning Web Components under `force-app/main/default/lwc/` that use the vendored `<lwc-shell>` custom element to load external MFE apps inside iframes on Lightning pages.
2. **A sample React app** (`sample-react-app/`) — a standalone React (Vite + TypeScript) application included **for demo purposes**. It is the MFE that gets embedded by the LWC shell components above. This app is fully decoupled from the SFDX project and could live in its own repository. You can also replace it entirely with your own MFE built in any framework (React, Angular, Vue, etc.).

## Project Structure

```
├── config/                         # Scratch org definition
├── force-app/main/default/
│   ├── aura/                       # Aura components (eslint config only)
│   ├── cspTrustedSites/            # CSP trusted site definitions
│   └── lwc/                        # Lightning Web Components
│       ├── customButton/           # Simple custom button with events
│       ├── dataExchange/           # Data exchange demo component
│       ├── dealerLocatorWidgetLo/  # Embeds dealer locator MFE via lwc-shell
│       ├── productRegistrationWidgetLo/ # Embeds product registration MFE via lwc-shell
│       ├── vendorDirtyStateModal/  # Unsaved-changes modal (from lwc-shell)
│       └── vendorLwcShell/         # ⚠ Generated — not in source control (see Setup step 2)
├── manifest/                       # Package manifest (package.xml)
├── sample-react-app/               # Sample React MFE application
└── scripts/                        # Apex & SOQL scripts
```

## Getting Started

### Prerequisites

- Salesforce CLI (`sf` or `sfdx`)
- Node.js (v18+)
- A Salesforce Dev Hub or Scratch Org
- [mkcert](https://github.com/FiloSottile/mkcert) (for local HTTPS)

### Setup

1. **Install SFDX dependencies:**

   ```bash
   npm install
   ```

2. **Generate vendored LWC components:**

   > **IMPORTANT:** The `vendorLwcShell` component is **not checked into source control** — it is listed in `.gitignore` because it is a generated artifact. You **must** run the command below after every fresh clone or when upgrading `@lightning-out/lwc-shell`. This generates the `vendorLwcShell` and `vendorDirtyStateModal` LWC bundles inside `force-app/main/default/lwc/` from the `@lightning-out/lwc-shell` package. These generated components must be deployed to your org for the shell integration to work.

   ```bash
   npm run vendor:build
   ```

   After running, verify that `force-app/main/default/lwc/vendorLwcShell/` has been created before proceeding to deploy.

3. **Authorize your org:**

   ```bash
   sf org login web -a myOrg
   ```

4. **Deploy to org:**

   ```bash
   sf project deploy start -x manifest/package.xml -o myOrg
   ```

## Sample React App

> **This app is included for demo purposes only.** It shows how an MFE communicates with Salesforce through the `@lightning-out/bridge`. You are free to use your own application built with any framework — just make sure it integrates the bridge and is served at a URL that matches your CSP trusted site and LWC `baseUrl` configuration. This directory is fully self-contained and can be extracted into a separate repository if needed.

### Install & Run

```bash
cd sample-react-app
npm install
```

> **Note:** The `@lightning-out/bridge` package has a transitive dependency on `utils`, which is a private/internal package. The `overrides` section in `package.json` replaces it with an empty stub so `npm install` succeeds without access to the private registry. This is a temporary workaround and will be fixed in a future release of `@lightning-out/bridge`, at which point the override can be removed.

### Run with HTTPS (SSL)

1. **Install mkcert** (one-time):

   ```bash
   brew install mkcert
   mkcert -install
   ```

2. **Add the hostname to `/private/etc/hosts`** (one-time):

   ```
   127.0.0.1  dvag-demo.com
   ```

3. **Generate local certificates** (one-time):

   ```bash
   cd sample-react-app
   npm run generate-cert
   ```

4. **Start the HTTPS dev server:**

   ```bash
   npm run start:ssl
   ```

   The app is now available at **https://dvag-demo.com:4300**.

### Available Routes

| Route | Purpose | Consumed by LWC |
|-------|---------|-----------------|
| `/` | Home page with navigation links | — |
| `/dealer-locator` | Dealer locator widget | `dealerLocatorWidgetLo` |
| `/register` | Product registration form (accepts `?productId=`) | `productRegistrationWidgetLo` |

