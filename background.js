// Register context menu when the extension is installed or reloaded
chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "getIdea",
        title: "Idea",
        contexts: ["selection"]
    });
});

// Handle right-click on selected text
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
    if (info.menuItemId !== "getIdea" || !info.selectionText) return;

    const prompt = `
You are a quiz assistant. Only output the correct option. No explanation.

${info.selectionText}
  `;

    try {
        const result = await fetch(
            'Sample.API',
            // 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyBCRUnr2-IqKgyjznbyOJ-CgbdQL9pxq8Q',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    contents: [
                        {
                            parts: [{ text: prompt }]
                        }
                    ]
                })
            }
        );

        const data = await result.json();
        const answer = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "No answer found.";

        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs.length === 0) return;

            chrome.scripting.executeScript({
                target: { tabId: tabs[0].id },
                func: (answer) => {
                    const selection = window.getSelection();
                    if (!selection.rangeCount) return;

                    const correctAnswer = answer.trim().toLowerCase();
                    const labels = document.querySelectorAll("label");

                    let matched = false;

                    labels.forEach(label => {
                        const text = label.textContent.trim().toLowerCase();
                        if (text.includes(correctAnswer)) {
                            const dot = document.createElement("span");
                            dot.style.display = "inline-block";
                            dot.style.width = "6px";
                            dot.style.height = "6px";
                            dot.style.backgroundColor = "green";
                            dot.style.borderRadius = "50%";
                            dot.style.marginLeft = "6px";
                            dot.title = "Correct answer";
                            dot.style.opacity = "0.7";
                            label.appendChild(dot);
                            matched = true;
                        }
                    });

                    // If no match, show fallback
                    if (!matched) {
                        const range = selection.getRangeAt(0);
                        const fallback = document.createElement("div");
                        fallback.textContent = "✅ Answer: " + answer;
                        fallback.style.color = "#0a0";
                        fallback.style.fontSize = "12px";
                        fallback.style.background = "#eefae6";
                        fallback.style.padding = "2px 6px";
                        fallback.style.borderRadius = "4px";
                        fallback.style.marginTop = "4px";
                        range.endContainer.parentNode.insertAdjacentElement("afterend", fallback);
                    }
                },
                args: [answer]
            });
        });
    } catch (err) {
        console.error("Failed to fetch answer:", err);
    }
});
