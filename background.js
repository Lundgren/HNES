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
  
  async function handleMessage() {
    try {
      switch (request.method) {
        case "getAllLocalStorage":
          const all = await chrome.storage.local.get(null);
          sendResponse({data: all});
          break;
        
        case "getLocalStorage":
          const item = await chrome.storage.local.get(request.key);
          sendResponse({data: item[request.key]});
          break;
        
        case "setLocalStorage":
          await chrome.storage.local.set({
            [request.key]: request.value
          });
          sendResponse({});
          break;
        
        case "getUserData":
          const userData = await getUserData(request.usernames);
          sendResponse({data: userData});
          break;
        
        default:
          sendResponse({});
      }
    } catch (error) {
      console.error('Error handling message:', error);
      sendResponse({error: error.message});
    }
  }

  handleMessage();
  return true; 
});

async function getUserData(usernames) {
  const results = {};
  for (const username of usernames) {
    const data = await chrome.storage.local.get(username);
    results[username] = data[username];
  }
  return results;
}

//expire old entries
(function() {
  for (i=0; i<localStorage.length; i++) {
    var info = JSON.parse(localStorage[localStorage.key(i)]);
    var now = new Date().getTime();
    if (now > info.expire)
      localStorage.removeItem(localStorage.key(i));
  }
});