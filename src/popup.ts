/*global chrome*/
import { Bookmark } from './types';

class Popup {
  bookmarks: Bookmark[];
  icons: string[];
  bookmarkList: HTMLElement;
  searchBox: HTMLInputElement;
  bookmarksCurrentlyInList: number;

  init = () => {
    this.bookmarkList = document.getElementById('bookmarkList');
    this.searchBox = <HTMLInputElement>document.getElementById('search-box');
    this.bookmarks = [];
    this.loadBookmarks();

    this.searchBox.addEventListener('keyup', (ev: KeyboardEvent) => {
      if (this.bookmarks.length == 0) {
        return;
      }

      this.cleanList();
      const foundBookmarks = this.bookmarks.filter((val, index) => {
        return val.info.title.toLowerCase().includes(this.searchBox.value);
      });

      if (foundBookmarks.length > 0) {
        this.addBookmarks(foundBookmarks);
      }
    });
  };

  loadBookmarks = () => {
    // Get bookmark's folder
    chrome.storage.local.get('bookmark_folder', (items) => {
      chrome.storage.local.get('bookmark_icons', (icons) => {
        // Retrieve the bookmarks
        chrome.bookmarks.getChildren(
          items.bookmark_folder,
          (bkms: chrome.bookmarks.BookmarkTreeNode[]) => {
            bkms.map((b: chrome.bookmarks.BookmarkTreeNode, index: number) => {
              const bookmark: Bookmark = {
                info: b,
                position: index,
                icon: <string>icons.bookmark_icons[index],
              };

              this.bookmarks.push(bookmark);
            });

            this.icons = icons.bookmark_icons;
            this.bookmarks = this.bookmarks.reverse();
            this.addBookmarks(this.bookmarks);
          }
        );
      });
    });
  };

  addBookmarks = (bookmarks: Bookmark[]) => {
    bookmarks.map((b: Bookmark, index: number) => {
      // Adds bookmark to the list
      this.addBookmarkToHTML(b);

      const urlLink = document.getElementById(`l${b.info.id}`);

      // Add click event listener to bookmark's URL
      urlLink.addEventListener('click', (e) => {
        e.preventDefault();

        // Create background tab
        chrome.tabs.create({
          url: b.info.url,
          active: false,
        });
      });

      // Adds event listener to 'delete' button
      const removeLink = document.getElementById(`d${b.info.id}`);

      removeLink.addEventListener('click', (e) => {
        e.preventDefault();

        // Removes bookmark from list
        this.removeBookmark(b.info.id);
        this.removeBookmark(this.bookmarks[index].info.id);
      });
    });
  };

  addBookmarkToHTML = (bookmark: Bookmark) => {
    // Create row
    const row = document.createElement('tr');
    row.id = 'b' + bookmark.info.id;
    const rowContent =
      '<td>' +
      "<img src='" +
      bookmark.icon +
      "'/></td>" +
      "<td><a id='" +
      'l' +
      bookmark.info.id +
      "' class='truncate' href='" +
      bookmark.info.url +
      "'>" +
      bookmark.info.title +
      '</a></td>' +
      "<td><a href='#' id='d" +
      bookmark.info.id +
      "'>❌</a></td>";
    row.innerHTML = rowContent;

    // Append row to table
    this.bookmarkList.appendChild(row);
    this.bookmarksCurrentlyInList++;
  };

  removeBookmark = (bookmarkId: string) => {
    chrome.bookmarks.remove(bookmarkId, () => {
      if (chrome.runtime.lastError) {
        console.error('RemoveBookmark: ' + chrome.runtime.lastError.message);
      }

      // If the bookmark is deleted proceed to remove its row from the table
      const row = document.getElementById('b' + bookmarkId);
      this.bookmarkList.removeChild(row);
    });
  };

  cleanList = () => {
    this.bookmarkList.innerHTML = '';
    this.bookmarksCurrentlyInList = 0;
  };
}

const popup = new Popup();
popup.init();
