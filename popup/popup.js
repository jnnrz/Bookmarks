/*global chrome*/
const bookmarkList = document.getElementById("bookmark-list");

class Popup {
  constructor() {

  }

  init() {
    this.loadBookmarks();
  }

  loadBookmarks() {
    // Get bookmark's folder
    chrome.storage.local.get("bookmark_folder", (items) => {
      // Retrieve the bookmarks
      chrome.bookmarks.getChildren(items.bookmark_folder, (bookmarks) => {
        let bookmarkCount = bookmarks.length;
        for (let i = 1; i <= bookmarkCount; i++) {
          this.addBookmark(bookmarks[bookmarkCount - i]);
        }
      });
    });
  }

  addBookmark(bookmark) {
    // Create row
    let row = document.createElement("tr");
    let rowContent = "<td>" +
      "<img src='chrome://favicon/" + bookmark.url + "'/></td>" +
      "<td><a class='truncate' href='" + bookmark.url + "'>" + bookmark.title + "</a></td>" +
      "<td>d</td>";
    row.innerHTML = rowContent;

    // Append row to table
    bookmarkList.appendChild(row);
  }
}

const popup = new Popup();
popup.init();

