const BookmarksFolderName = "Bookmark for Later";

chrome.runtime.onInstalled.addListener((details) => {

  // Clean storage
  chrome.storage.local.clear();

  // Look for designed folder
  chrome.bookmarks.search(BookmarksFolderName, (res) => {
    if (res === undefined || res.length == 0) {
      // If main folder doesn't exist, create it and then save its Id in storage
      chrome.bookmarks.create({ parentId: "2", title: BookmarksFolderName }, (bf) => {
        // Now that it has been created, save it
        chrome.storage.local.set({ "bookmark_folder": bf.id }, () => {
          if (chrome.runtime.lastError) {
            console.error("SetBookmarkFolder " + chrome.runtime.lastError.message);
          }
        });
      });
    } else {
      chrome.storage.local.set({ "bookmark_folder": res[0].id });
    }
  });

  /*
    Later

  */

});

// Create context menu
chrome.contextMenus.create({ id: "bfcm", title: "Bookmark this site" }, () => {
  if (chrome.runtime.lastError) {
    console.error("ContextMenu: " + chrome.runtime.lastError.message);
  }
});

// ContextMenu onClick listener
chrome.contextMenus.onClicked.addListener((info) => {
  if (info.menuItemId === "bcfm") {
    chrome.tabs.getSelected((tab) => {
      chrome.storage.local.get("bookmark_folder", (data) => {
        chrome.bookmarks.create({
          parentId: data.bookmark_folder,
          title: tab.title,
          url: tab.url
        }, (res) => {
          if (chrome.runtime.lastError) {
            console.error("ContextMenuAddBk: " + chrome.runtime.lastError.message);
          }
        });
      });
    });
  }
});