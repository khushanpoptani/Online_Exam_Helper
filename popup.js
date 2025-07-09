document.getElementById("askBtn").addEventListener("click", async () => {
    const question = document.getElementById("question").value.trim();
    const chatWindow = document.getElementById("chatWindow");
    const loaderOverlay = document.getElementById("loaderOverlay"); // Corrected

    if (!question) return;

    // Add user message
    const userMsg = document.createElement("div");
    userMsg.className = "chat-message user-message";
    userMsg.innerText = question;
    chatWindow.appendChild(userMsg);
    chatWindow.scrollTop = chatWindow.scrollHeight;

    // ✅ Show full-screen loader
    loaderOverlay.style.display = "flex";

    const prompt = `
You are a quiz assistant. Only output the correct option. No explanation.

${question}
`;

    try {
        const result = await fetch(
            'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyBCRUnr2-IqKgyjznbyOJ-CgbdQL9pxq8Q',
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

        const botMsg = document.createElement("div");
        botMsg.className = "chat-message bot-message";
        botMsg.innerText = answer;
        chatWindow.appendChild(botMsg);
        chatWindow.scrollTop = chatWindow.scrollHeight;
    } catch (err) {
        const errMsg = document.createElement("div");
        errMsg.className = "chat-message bot-message";
        errMsg.innerText = "⚠️ Error: " + err.message;
        chatWindow.appendChild(errMsg);
    } finally {
        // ✅ Hide loader
        loaderOverlay.style.display = "none";
        document.getElementById("question").value = "";
    }
});
