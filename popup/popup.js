/*global chrome*/
const bookmarkList = document.getElementById("bookmarkList");

class Popup {
  constructor() {

  }

  init() {
    this.loadBookmarks();
  }

  loadBookmarks() {
    // Get bookmark's folder
    chrome.storage.local.get("bookmark_folder", (items) => {
      chrome.storage.local.get("bookmark_icons", (icons) => {
        // Retrieve the bookmarks
        chrome.bookmarks.getChildren(items.bookmark_folder, (bookmarks) => {
          let bookmarkCount = bookmarks.length;
          for (let i = 1; i <= bookmarkCount; i++) {
            let bNumber = bookmarkCount - i;
            // Adds bookmark to the table
            this.addBookmark(bookmarks[bNumber], icons.bookmark_icons[bNumber]);

            // Adds event listener to 'delete' button
            let link = document.getElementById("d" + bookmarks[bNumber].id);
            link.addEventListener('click', () => {
              this.removeBookmark(bookmarks[bNumber].id);
            });
          }
        });
      });

    });
  }

  addBookmark(bookmark, icon) {
    // Create row
    let row = document.createElement("tr");
    row.id = 'b' + bookmark.id;
    let rowContent = "<td>" +
      "<img src='" + icon + "'/></td>" +
      "<td><a class='truncate' href='" + bookmark.url + "'>" + bookmark.title + "</a></td>" +
      "<td><a href='#' id='d" + bookmark.id + "'>❌</a></td>";
    row.innerHTML = rowContent;

    // Append row to table
    bookmarkList.appendChild(row);
  }

  removeBookmark(bookmarkId) {
    chrome.bookmarks.remove(bookmarkId, () => {
      if (chrome.runtime.lastError) {
        console.error("RemoveBookmark: " + chrome.runtime.lastError.message);
      }

      // If the bookmark is deleted proceed to remove its row from the table
      let row = document.getElementById("b" + bookmarkId);
      bookmarkList.removeChild(row);
    })
  }
}

const popup = new Popup();
popup.init();

