const BookmarksFolderName = "Bookmark for Later";
var BookmarkFolderId;

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
          BookmarkFolderId = bf.id;
        });
      });
    } else {
      BookmarkFolderId = res[0].id;
      chrome.storage.local.set({ "bookmark_folder": res[0].id });
      updateBookmarkIconsCache();
    }
  });
});

// Create context menu
chrome.contextMenus.create({ id: "bfcm", title: "Bookmark this site" }, () => {
  if (chrome.runtime.lastError) {
    console.error("ContextMenu: " + chrome.runtime.lastError.message);
  }
});

// ContextMenu onClick listener
chrome.contextMenus.onClicked.addListener((info) => {
  if (info.menuItemId === "bfcm") {
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

chrome.bookmarks.onCreated.addListener(updateBookmarkIconsCache);
chrome.bookmarks.onChanged.addListener(updateBookmarkIconsCache);
chrome.bookmarks.onRemoved.addListener(updateBookmarkIconsCache);
chrome.bookmarks.onMoved.addListener(updateBookmarkIconsCache);
chrome.bookmarks.onChildrenReordered.addListener(updateBookmarkIconsCache);
chrome.bookmarks.onImportEnded.addListener(updateBookmarkIconsCache);

// Transform url image to base64 string
function toDataUrl(url, callback) {
  var xhr = new XMLHttpRequest();
  xhr.onload = function () {
    var reader = new FileReader();
    reader.onloadend = function () {
      callback(reader.result);
    }
    reader.readAsDataURL(xhr.response);
  };
  xhr.open('GET', url);
  xhr.responseType = 'blob';
  xhr.send();
}

// Updates the icon cache
function updateBookmarkIconsCache() {
  // Remove the icons in storage first
  chrome.storage.local.remove("bookmark_icons");

  // Retrieve bookmarks
  chrome.bookmarks.getChildren(BookmarkFolderId, (bookmarks) => {
    var icons = [];
    let bookmarkCount = bookmarks.length;
    for (let i = 1; i <= bookmarkCount; i++) {
      let bNumber = bookmarkCount - i;
      // Get base64 from icon's chrome://favicon url
      toDataUrl("chrome://favicon/" + bookmarks[bNumber].url, (i64) => {
        icons[bNumber] = i64;

        // Build the array with the icons in localstorage
        chrome.storage.local.set({ "bookmark_icons": [...icons] }, () => {
          if (chrome.runtime.lastError) {
            console.error("IconsCache: " + chrome.runtime.lastError.message);
          }
        });
      });
    }
  });
}