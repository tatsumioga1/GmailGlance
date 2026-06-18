chrome.runtime.onInstalled.addListener(() => {
    // Check for emails every 5 minutes
    chrome.alarms.create("checkEmails", { periodInMinutes: 5 });
    updateBadge();
});

chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === "checkEmails") {
        updateBadge();
    }
});

// Listen for manual update requests from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "refreshBadge") {
        updateBadge();
    }
});

async function updateBadge() {
    try {
        // Attempt to get an auth token silently
        const token = await new Promise((resolve, reject) => {
            chrome.identity.getAuthToken({ interactive: false }, function (token) {
                if (chrome.runtime.lastError) reject(chrome.runtime.lastError);
                else resolve(token);
            });
        });

        if (!token) return; // User hasn't logged in yet

        // Fetch INBOX metadata to get the precise unread count
        const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/labels/INBOX', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const data = await response.json();
        const count = data.messagesUnread || 0;

        // Update the toolbar badge
        if (count > 0) {
            chrome.action.setBadgeText({ text: count.toString() });
            chrome.action.setBadgeBackgroundColor({ color: "#ff77ff" }); // Neon Magenta to match the UI
        } else {
            chrome.action.setBadgeText({ text: "" });
        }
    } catch (error) {
        console.error("Authentication or network error:", error);
    }
}