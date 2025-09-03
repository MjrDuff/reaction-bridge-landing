document.addEventListener('DOMContentLoaded', () => {
    const installButton = document.getElementById('install-button');
    const onboardingStatus = document.getElementById('onboarding-status');

    const CHROME_EXTENSION_ID = "YOUR_EXTENSION_ID_HERE";
    const CHROME_WEB_STORE_URL = `https://chrome.google.com/webstore/detail/reaction-bridge/${CHROME_EXTENSION_ID}`;

    const setStatus = (message, isError = false) => {
        onboardingStatus.textContent = message;
        onboardingStatus.className = isError ? 'error' : (message ? 'success' : '');
    };

    const checkExtensionAndSetupButton = async () => {
        if (!CHROME_EXTENSION_ID || CHROME_EXTENSION_ID === "YOUR_EXTENSION_ID_HERE") {
            setStatus("Extension ID is not configured.", true);
            installButton.href = "#";
            installButton.onclick = (e) => e.preventDefault();
            return;
        }

        try {
            const response = await chrome.runtime.sendMessage(CHROME_EXTENSION_ID, { action: "ping" });
            if (response?.status === 'pong') {
                installButton.textContent = 'Connect with Google';
                installButton.href = '#';
                installButton.onclick = handleConnectWithGoogle;
                setStatus('Extension installed. Click to connect your Google Account.');
            } else {
                throw new Error("Invalid response from extension.");
            }
        } catch (error) {
            installButton.textContent = 'Install for Chrome';
            installButton.href = CHROME_WEB_STORE_URL;
            installButton.onclick = null;
            setStatus('');
        }
    };

    const handleConnectWithGoogle = async (event) => {
        event.preventDefault();
        setStatus('Opening Google sign-in...');
        installButton.disabled = true;

        try {
            const response = await chrome.runtime.sendMessage(CHROME_EXTENSION_ID, { action: "ensureAuthExternal" });
            if (response && response.authenticated) {
                setStatus('Successfully connected! You can now close this page.');
                installButton.textContent = 'Connected!';
                installButton.style.backgroundColor = '#2ba640';
                installButton.onclick = (e) => e.preventDefault();
            } else {
                throw new Error(response.error || 'Authentication failed or was cancelled.');
            }
        } catch (error) {
            setStatus('Sign-in failed or was canceled. Please try again.', true);
            console.error("External Onboarding Error:", error);
        } finally {
            installButton.disabled = false;
        }
    };

    if (typeof chrome !== 'undefined' && chrome.runtime) {
        checkExtensionAndSetupButton();
    } else {
        installButton.textContent = 'Install for Chrome';
        installButton.href = CHROME_WEB_STORE_URL;
    }
});