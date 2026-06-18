document.addEventListener("DOMContentLoaded", () => {
    const authBtn = document.getElementById("auth-btn");
    const emailList = document.getElementById("email-list");

    function loadEmails(isInteractive) {
        chrome.identity.getAuthToken({ interactive: isInteractive }, async function (token) {
            if (chrome.runtime.lastError || !token) {
                authBtn.style.display = "block";
                emailList.innerHTML = "<li class='email-item'>Please authorize the extension to view emails.</li>";
                return;
            }

            authBtn.style.display = "none";
            emailList.innerHTML = "<li class='email-item'>Loading new emails...</li>";

            try {
                const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages?q=is:unread in:inbox&maxResults=5', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await response.json();

                if (!data.messages || data.messages.length === 0) {
                    emailList.innerHTML = "<li class='email-item'>No new emails! 🎉</li>";
                    return;
                }

                emailList.innerHTML = "";

                for (let msg of data.messages) {
                    const msgResponse = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=metadata&metadataHeaders=Subject&metadataHeaders=From`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    const msgDetails = await msgResponse.json();

                    const headers = msgDetails.payload.headers;
                    const subject = headers.find(h => h.name === 'Subject')?.value || '(No Subject)';
                    let from = headers.find(h => h.name === 'From')?.value || 'Unknown';
                    from = from.split('<')[0].trim();

                    // Create row structure
                    const li = document.createElement("li");
                    li.className = "email-item";
                    li.id = `msg-${msg.id}`;

                    const contentDiv = document.createElement("div");
                    contentDiv.className = "email-content";
                    contentDiv.innerHTML = `<strong>${from}</strong><br><span class="subject">${subject}</span><br><span class="snippet">${msgDetails.snippet}</span>`;

                    const checkBtn = document.createElement("button");
                    checkBtn.className = "read-btn";
                    checkBtn.innerHTML = "✓";
                    checkBtn.title = "Mark as read";

                    // Action logic for marking read
                    checkBtn.addEventListener("click", () => markAsRead(msg.id, token));

                    li.appendChild(contentDiv);
                    li.appendChild(checkBtn);
                    emailList.appendChild(li);
                }
            } catch (error) {
                emailList.innerHTML = "<li class='email-item'>Error fetching emails. Please try again.</li>";
            }
        });
    }

    async function markAsRead(messageId, token) {
        try {
            const row = document.getElementById(`msg-${messageId}`);
            if (row) row.style.opacity = "0.3"; // Visual feedback immediately

            // Tell Gmail API to remove the UNREAD label
            const response = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}/modify`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ removeLabelIds: ['UNREAD'] })
            });

            if (response.ok) {
                if (row) row.remove(); // Cleanly slide it out of the UI

                // If the list is now empty, let the user know
                if (emailList.children.length === 0) {
                    emailList.innerHTML = "<li class='email-item'>No new emails! 🎉</li>";
                }

                // Send a message to background.js to force update the badge immediately
                chrome.runtime.sendMessage({ action: "refreshBadge" });
            } else {
                if (row) row.style.opacity = "1";
                alert("Failed to update email status.");
            }
        } catch (error) {
            console.error(error);
        }
    }

    authBtn.addEventListener("click", () => loadEmails(true));
    loadEmails(false);
});