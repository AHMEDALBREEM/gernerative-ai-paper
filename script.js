async function clearChatCache() {
    try {
        const cache = await caches.open('chat-data');
        const keys = await cache.keys();
        await Promise.all(keys.map(key => cache.delete(key)));
        chatBody.innerHTML = ''; // Clear the chat display as well
    } catch (error) {
        console.error('Error clearing chat cache:', error);
    }
}

async function clearChatCache() {
    try {
        const cache = await caches.open('chat-data');
        const keys = await cache.keys();
        await Promise.all(keys.map(key => cache.delete(key)));
        console.log('Chat cache cleared.');
        document.getElementById('chatBody').innerHTML = ''; // Clear the chat display as well
    } catch (error) {
        console.error('Error clearing chat cache:', error);
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    const chatData = await getChatFromCache();
    chatData.forEach(chat => {
        addMessageToChat('user', chat.userMessage);
        addMessageToChat('bot', chat.botResponse);
    });
});

async function getChatFromCache() {
    try {
        const cache = await caches.open('chat-data');
        const keys = await cache.keys();

        const chatDataPromises = keys.map(async (key) => {
            const response = await cache.match(key);
            return response ? response.json() : null;
        });

        const chatData = (await Promise.all(chatDataPromises)).filter(data => data !== null);

        console.log('Retrieved chat data from cache:', chatData);
        return chatData;
    } catch (error) {
        console.error('Error retrieving chat data from cache:', error);
        return [];
    }
}

async function saveChatToCache(userMessage, botResponse) {
    try {
        const cache = await caches.open('chat-data');
        const timestamp = Date.now();
        const cacheKey = `chat-${timestamp}`;

        const chatData = {
            userMessage,
            botResponse,
            timestamp,
        };

        await cache.put(
            cacheKey,
            new Response(JSON.stringify(chatData), {
                headers: { 'Content-Type': 'application/json' },
            })
        );

        console.log('Chat data saved to cache:', chatData);
    } catch (error) {
        console.error('Error saving chat data to cache:', error);
    }
}

const chatBody = document.getElementById('chatBody');
const userInput = document.getElementById('userInput');

userInput.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
});

async function sendMessage() {
    const message = userInput.value.trim();
    if (!message) return;

    addMessageToChat('user', message);
    userInput.value = '';

    try {
        const response = await fetch('http://127.0.0.1:5000/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ prompt: message }),
        });

        if (response.ok) {
            const data = await response.json();
            addMessageToChat('bot', data.response);
            await saveChatToCache(message, data.response);
        } else {
            addMessageToChat('bot', 'Error: Unable to get response from the server.');
        }
    } catch (error) {
        addMessageToChat('bot', 'Error: Network error or server is down.');
    }
}

function addMessageToChat(sender, message) {
    const messageElement = document.createElement('div');
    messageElement.className = `chat-message ${sender === 'user' ? 'user-message' : 'bot-message'}`;
    messageElement.textContent = message;
    chatBody.appendChild(messageElement);
    chatBody.scrollTop = chatBody.scrollHeight;
}
