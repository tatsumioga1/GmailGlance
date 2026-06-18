# 📧 Gmail Glance

A lightweight, visually striking Chrome extension built with Manifest V3 that allows you to quickly check your Gmail inbox, view unread counts, and manage emails directly from your browser toolbar.

![Extension Preview](images/icon128.png) 

## ✨ Features
* **Live Background Syncing:** Automatically fetches your unread email count every 5 minutes and updates the extension badge.
* **Vaporwave Dark Mode UI:** A custom-designed, high-contrast dark theme with neon accents to reduce eye strain.
* **Instant Inbox Management:** View the sender, subject, and snippet of your latest emails, and use the inline `✓` button to mark them as read instantly.
* **Seamless Authentication:** Utilizes the native `chrome.identity` API for secure, frictionless Google SSO.

## 🛠️ Technology Stack
* **HTML/CSS/JavaScript:** Pure vanilla web technologies.
* **Chrome Extension API:** Built using the modern Manifest V3 standard (`service_workers`, `alarms`, `action`, `identity`).
* **Google REST API:** Interfaces directly with the `gmail/v1` endpoints.

## 🚀 Setup & Installation (Local Development)

Because this extension interacts with the private Gmail API, you must generate your own Google Cloud Client ID to run it locally.

### 1. Google Cloud Configuration
1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a **New Project** and navigate to **APIs & Services > Library**. 
3. Search for the **Gmail API** and click **Enable**.
4. Go to **APIs & Services > OAuth consent screen**.
   * Select **External** and fill in the required app details.
   * Under the **Test users** section, add the email address you plan to use for testing.
5. Go to **APIs & Services > Credentials**.
   * Click **Create Credentials** > **OAuth client ID**.
   * Select **Chrome extension** as the application type.
   * *Keep this window open, you will need to paste your Extension ID here shortly.*

### 2. Loading the Extension
1. Clone this repository to your local machine:
   ```bash
   git clone [https://github.com/YOUR-USERNAME/GmailGlance.git](https://github.com/YOUR-USERNAME/GmailGlance.git)