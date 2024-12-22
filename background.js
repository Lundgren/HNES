// Service worker activation
chrome.runtime.onInstalled.addListener(() => {
  console.log('Extension installed');
});

// Keep service worker alive
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  return true;
});

// Message handling with async storage
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('REQUEST', request.method, request);
  
  handleMessage(request).then(sendResponse);
  return true;
});

async function handleMessage(request) {
  try {
    switch (request.method) {
      case "getAllLocalStorage":
        const all = await chrome.storage.local.get(null);
        return {data: all};
      
      case "getLocalStorage":
        const key = request.key.toString();
        const item = await chrome.storage.local.get(key);
        return {data: item[key]};
      
      case "setLocalStorage":
        await chrome.storage.local.set({
          [request.key.toString()]: request.value
        });
        return {};
      
      case "getUserData":
        const userData = await getUserData(request.usernames);
        return {data: userData};
      
      default:
        return {};
    }
  } catch (error) {
    console.error('Error handling message:', error);
    return {error: error.message};
  }
}

async function getUserData(usernames) {
  try {
    const keys = Array.isArray(usernames) ? 
      usernames.map(u => u.toString()) : 
      [usernames.toString()];
    
    const results = {};
    const data = await chrome.storage.local.get(keys);
    for (const username of keys) {
      results[username] = data[username];
    }
    return results;
  } catch (error) {
    console.error('Error getting user data:', error);
    return {};
  }
}

// Cleanup function
(async function() {
  try {
    const all = await chrome.storage.local.get(null);
    const now = new Date().getTime();
    
    for (const [key, value] of Object.entries(all)) {
      try {
        const info = JSON.parse(value);
        if (info.expire && now > info.expire) {
          await chrome.storage.local.remove(key);
        }
      } catch (e) {
        console.error('Error parsing stored data:', e);
      }
    }
  } catch (error) {
    console.error('Error in cleanup:', error);
  }
})();