# Mallea

**Software that takes your shape. Powered By Meta Muse**

Mallea’s vision is software that adapts to the person using it. Describe what you need, reshape an interface while you work, and let your apps cooperate through explicit permissions.

We think this is how software will be made next. Today, the people who build an app decide how everyone uses it. Mallea lets the person using an app change it while they use it, in plain English.

In 1913, Henry Ford’s moving assembly line changed how cars were built and who could afford one. Mallea aims to change how software is built and who gets to build it. If you can describe what you want, you can shape the software you use. And your apps can work together, sharing data only with the permission you give.

**No more 'Connectors', 'Agents', 'Computer Use Permission'. Yet, all the good things of having a powerful AI model by your side.**

Mallea is a desktop application framework built around **Surfaces**: editable interfaces with their own data bindings, events and actions. **Mallea Core** runs locally and supplies shared Meta Muse-powered authoring, persistence and communication. Each app runs in its own native window. Start with a blank app, then use **Shape this app** to build it in plain English.

## Contents

- [Installed preview](#installed-preview)
- [First-Time Setup](#first-time-setup): [prerequisites](#1-install-the-prerequisites), [download](#2-download-mallea), [model configuration](#3-configure-the-model), [install and build](#4-install-dependencies-and-build)
- [Run Mallea Core](#run-mallea-core): [first launch](#first-launch), [subsequent launches](#subsequent-launches)
- [Build Your First App](#build-your-first-app)
  - [Create a blank app](#1-create-a-blank-app)
  - [Describe the interface](#2-describe-the-interface)
  - [Preview and install](#3-preview-and-install)
  - [Use and reshape it](#4-use-and-reshape-it)
  - [Reopen your app](#5-reopen-your-app)
  - [Add an Automation](#6-add-an-automation)
  - [Share the result with another app](#7-share-the-result-with-another-app)
- [Present and Future](#present-and-future)

## Installed preview

The development branch includes a Windows installer preview with the dashboard, Core, Fieldnote and Parcel. Installed users need no developer tools: open Mallea, then launch either app from the dashboard. Ordinary app functions work without a model; Shape and Muse processing require your own model access in **Model settings**. Configuration is session-only. New-app creation is unavailable in the installed edition.

See [installer instructions and platform limits](docs/INSTALLER.md). This is a local development preview, not a published signed release. macOS installation and native verification are the required next gate. The source setup below remains available for developers, including project creation.

## First-Time Setup

Windows and macOS have been tested. Use PowerShell on Windows and Terminal with Bash or Zsh on macOS. Linux is untested; the Bash commands below also apply after installing its platform prerequisites.

### 1. Install the prerequisites

Install these tools before continuing:

- **[Git](https://git-scm.com/downloads)** to download the source.
- **[Node.js 24](https://nodejs.org/en/download)**, including npm. Select version 24; Mallea requires this major version.
- **[Rust](https://rust-lang.org/tools/install/)**, including Cargo, using the stable toolchain.
- **[Tauri’s platform prerequisites](https://v2.tauri.app/start/prerequisites/)** for your operating system:

| Windows | macOS |
| --- | --- |
| Microsoft C++ Build Tools with **Desktop development with C++**, and Microsoft Edge WebView2. Follow Tauri’s Windows instructions. | Xcode Command Line Tools. Follow Tauri’s macOS instructions. |

Open a new terminal after installation and check:

```sh
node --version
cargo --version
```

The Node version must begin with `v24.`. Cargo should print its version. If either command is unavailable, finish installing the tools before continuing.

### 2. Download Mallea

```sh
git clone https://github.com/rcshubhadeep/mallea.git
cd mallea
```

If you already have the source, open a terminal in its root folder instead. Run all remaining terminal commands from this folder unless instructed otherwise.

### 3. Configure the model

Create a local `.env` file from the supplied template. These commands preserve an existing `.env` file.

**Windows — PowerShell**

```powershell
if (-not (Test-Path .env)) { Copy-Item .env.example .env }
```

**macOS / Linux — Bash or Zsh**

```sh
if [ ! -f .env ]; then cp .env.example .env; fi
```

Open `.env` in a text editor and fill in these three settings for a Meta model supported by Mallea:

| Setting | What to enter |
| --- | --- |
| `DEV_BASE_URL` | The API End Point, such as `https://api.meta.ai/v1/responses` |
| `DEV_API_KEY` | Your API key. |
| `DEV_MODEL` | The exact identifier for a supported Muse model, such as  `muse-spark-1.3` or `muse-wonder-1.0`. If using Muse Spark Open then check with the provider |

You need access to that model through your provider; inference may incur usage charges. Keep `.env` private. It is ignored by Git, and no model key belongs in a generated app project. The optional `PROD_` settings can remain empty for this setup.

**Optional: generated app icons.** Each new app can get its own icon from Meta Muse Image. To turn this on, fill `PROD_BASE_URL` and `PROD_LLM_KEY` for the Meta API and set `PROD_IMAGE_MODEL` to an image model such as `muse-image-1.0`. Each icon is one paid image request, made when the app is created. Without these settings, new apps use the Mallea icon. To give an existing app an icon, run `node --env-file=.env scripts/generate-icons.mjs app <app-id>` with Core's app ID (shown in **Inspect app**).

### 4. Install dependencies and build

Close any existing Mallea app windows and stop Core before installing dependencies. Run the commands for your platform in order.

**Windows — PowerShell**

```powershell
npm.cmd ci
npm.cmd --script-shell=cmd.exe run build
npm.cmd --script-shell=cmd.exe run desktop -- build
```

**macOS / Linux — Bash or Zsh**

```sh
npm ci
npm run build
npm run desktop -- build
```

Wait for each command to finish successfully before running the next. The first native build downloads dependencies and can take several minutes. Once it completes, continue below.

## Run Mallea Core

### First launch

**1. Start Engine.** In a terminal at the repository root, run:

```sh
node --env-file=.env scripts/engine.mjs
```

Wait for `Mallea Core: http://127.0.0.1:4318`. Leave this terminal open; Engine must stay running while you use Mallea apps.

**2. Open the dashboard.** Open a second terminal in the same repository folder and run:

```sh
node scripts/launch-app.mjs mallea-core
```

These commands are the same on Windows, macOS and Linux. The native dashboard opens with local apps and a **Create an app** button. **Model settings** shows the configured model profile. You can open the included Fieldnote and Parcel apps using **Open app** on their cards. The **Mallea App Store** section shows planned example apps; they are previews only and cannot be installed yet.

### Subsequent launches

You do not need to reinstall dependencies or rebuild just to reopen Mallea.

- **If Core is stopped:** run the Core command above, then open the dashboard from a second terminal.
- **If Core is already running:** run only the dashboard command. Start just one Core instance.
- **To reopen a created app:** use **Open app** on its dashboard card. If it is already running, switch to its existing window.

To delete an app you created, close its windows, click **Delete app** on its dashboard card, type its name exactly and confirm **Delete app permanently**. This removes its saved Core data and registration; its project folder stays on disk. Automations in other apps that depend on it are paused. Core, Fieldnote and Parcel cannot be deleted.

Closing the dashboard leaves Core and other apps running. To stop Core, save your work, close the app windows and press **Ctrl+C** in its terminal. After restarting Core, reopen the dashboard too.

For developer text/JSON export options, add `--dev` to the Core command:

```sh
node --env-file=.env scripts/engine.mjs --dev
```

Without `--dev`, those right-click options are hidden. This switch is separate from model selection.

## Build Your First App

Keep Core running and open the dashboard. This walkthrough creates a small notes app without writing application code.

### 1. Create a blank app

1. Click **Create an app**.
2. Enter **My Notes** as the name.
3. Click **Choose parent folder** and select an existing folder where you want to keep the project.
4. Click **Create, compile and open**.
5. Wait for compilation to finish. A new native app window opens with Mallea’s framework controls and no app content yet.

Mallea creates a new `my-notes` subfolder inside your chosen folder. If that folder already exists, choose a different app name or parent folder. Keep Core running throughout compilation.

### 2. Describe the interface

In the new app, click **Shape this app** and enter:

> Create a simple notes app with two persistent Surfaces side by side. On the left, add a multiline text editor labelled New note and a Save note button. Clicking Save note should append the editor text to a saved notes collection. On the right, display that collection as a list. Keep the notes when I close and reopen the app.

Click **Build changes** and wait for **Ready to preview**. Generation may take time. If it fails, expand **Validation details** to see the reason; no failed proposal is installed.

### 3. Preview and install

1. Review the proposed editor, button and saved list in the preview.
2. Select the approval checkbox.
3. Click **Install changes**.

The interface updates in the running app. You do not need to rebuild its native executable for Surface changes.

### 4. Use and reshape it

Type a note and click **Save note**. It should appear in the saved list. Save a second note and check that both are present.

To change the list’s appearance, right-click its text and choose **Modify this surface**. Ask:

> Make the saved notes text larger. Keep the layout, data bindings and behavior unchanged.

Build, review and install the change as before. The notes should remain intact.

To restyle the whole app, open **Shape this app** and ask:

> Make the whole app dark with a teal accent.

Every Surface, button and field changes together, because all Mallea apps share one design system with a per-app accent colour, light, dark or system mode, and density. Ask for app-wide changes like this in **Shape this app**; **Modify this surface** only changes one Surface and offers **Edit the whole app instead**. If you don't like an installed change, click **Undo last change** in the top bar. It restores the previous Surfaces, layout and theme; your saved notes stay.

### 5. Reopen your app

Wait for **Local changes saved**, then close the app window. In the dashboard, find **My Notes** and click **Open app**. Your interface and saved notes should still be there.


### 6. Add an Automation

Turn the text you type into a list of ideas. In **My Notes**, open **Shape this app** and ask:

> Add a persistent Surface called Ideas without changing my existing notes or editor. Give it a list backed by a new, empty collection. Each item must have one text field named text. Display that field and expose a data-change trigger on the list so it can start an Automation.

Build, preview, approve and install the change. Then connect the editor to the new list:

1. Right-click the **New note** editor and choose **Set Automation**.
2. Under **When should it run?**, select **When I type**, then click **Next**.
3. Under **Which data should it read?**, select the **New note** editor in My Notes. Under **What should happen?**, select **Ask Meta Muse**.
4. In **Describe the transformation for Muse**, enter: “Extract the key ideas and constraints from this note as short list items.” Click **Next**.
5. Under **Where should the result go?**, select the list in **My Notes / Ideas**. Choose **Replace the current value or list** and name the Automation **Note to ideas**.
6. Review the summary, select the approval checkbox and click **Enable Automation**.

Type a note such as “Plan a community garden poster with monochrome colors and no photographs.” Pause briefly. Ideas should fill with model-generated items. Change the note to request bright colors and photographs; after another pause, the list should reflect the new constraints.

Open **Sharing & Automations** to see the latest outcome. **Pause / resume** controls whether the Automation runs, and **Run now** starts it manually. Typing waits for a short pause rather than making a request for every keypress. Muse requests use your configured model and may incur usage charges; pause the Automation when you finish experimenting.

### 7. Share the result with another app

Keep My Notes open. From the dashboard, create a second blank app named **Notes Inbox**, following step 1 above. In that app’s **Shape this app**, ask:

> Add a persistent Surface called Received Ideas with a list backed by a new, empty collection. Each item must have one text field named text. Display that field. This list will receive ideas from another app.

Build, preview, approve and install. Keep both apps and Core running throughout the following steps.

**Make the destination available**

1. In **Notes Inbox**, open **Sharing & Automations**.
2. Find **Received Ideas** and click **Change sharing**. Its title should now show **shared**.

Sharing makes the Surface available for access requests. It does not grant another app permission to write to it.

**Request access from My Notes**

1. Switch to **My Notes**. Right-click the **Ideas** list and choose **Set Automation**.
2. Select **When this data changes**, then click **Next**.
3. Select the Ideas list as the input and **Copy unchanged** as the processor. Click **Next**.
4. Select **Notes Inbox / Received Ideas** as the destination and **Replace the current value or list** as the update mode.
5. Click **Request write access**. Leave the wizard open and switch to Notes Inbox.

**Approve and enable the connection**

1. In **Notes Inbox → Sharing & Automations**, find the write request from My Notes for Received Ideas. Check that it names the intended apps and Surfaces, then click **Allow**.
2. Return to the wizard in **My Notes**. Once access is available, name the Automation **Send ideas to inbox**, review the summary, select the approval checkbox and click **Enable Automation**.
3. In My Notes’ **Sharing & Automations**, click **Run now** for this copy Automation. The ideas should appear in Notes Inbox.

Later changes to Ideas should copy automatically while both apps are running. Copying unchanged data runs locally and makes no model request; generating new Ideas through Muse still uses the model.

To stop the connection, open **Notes Inbox → Sharing & Automations** and click **Deny / revoke** on that grant. A subsequent Run now in My Notes should report blocked access. Previously copied ideas remain in Notes Inbox.

## Present and Future

**Today.** Mallea is a working proof of concept. You can build simple apps for everyday use and keep reshaping them in plain English while you use them. Mallea Core, a small local engine process, runs your apps, keeps their data and connects them only where you allow it.

**Next (planned).** Mallea becomes a properly installable framework that anyone can download and use, without a developer setup.

**Further ahead (our aspiration).** We want to go one level deeper: from an engine process to a new kind of operating system, with a global app store where people and AI agents work on equal footing, and people stay in charge. To return to Ford's analogy: you decide what gets built, AI agents are the assembly line, and apps are the cars. Imagine a photo editor or a code editor built for you in minutes, from the ground up, with only the controls you want, and able to share data across app and network boundaries. Peer-to-peer discovery and data sharing come next.
