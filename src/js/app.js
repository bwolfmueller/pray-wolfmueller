// Small bits of behavior: the QR share pop-up, the back link, and offline support.

const dialog = document.querySelector("[data-share-dialog]");

document.querySelector("[data-share-open]")?.addEventListener("click", () => dialog?.showModal());

// Close the pop-up when tapping outside it.
dialog?.addEventListener("click", (event) => {
  if (event.target === dialog) dialog.close();
});

document.querySelector("[data-copy]")?.addEventListener("click", async (event) => {
  const button = event.currentTarget;
  try {
    await navigator.clipboard.writeText(button.dataset.copy);
    button.textContent = "Copied!";
  } catch {
    button.textContent = "Copy failed";
  }
  setTimeout(() => (button.textContent = "Copy link"), 2000);
});

// Phones can hand the link to Messages, Mail, etc.
const nativeShare = document.querySelector("[data-native-share]");
if (nativeShare && navigator.share) {
  nativeShare.hidden = false;
  nativeShare.addEventListener("click", () => {
    navigator.share({ title: nativeShare.dataset.title, url: nativeShare.dataset.url }).catch(() => {});
  });
}

// "‹ All prayers" goes back if you came from this site, so your place is kept.
document.querySelector("[data-back]")?.addEventListener("click", (event) => {
  if (document.referrer.startsWith(location.origin) && history.length > 1) {
    event.preventDefault();
    history.back();
  }
});

// The Mini Hymnal's front page saves the whole book on this device, so it can be
// read in a hospital or on a plane without a connection. The cache name matches /sw.js.
const offlinePages = document.querySelector("[data-offline-pages]");
const offlineStatus = document.querySelector("[data-offline-status]");
if (offlinePages && "caches" in window && "serviceWorker" in navigator && location.hostname !== "localhost") {
  const urls = JSON.parse(offlinePages.textContent);
  caches.open("pray-v1")
    .then((cache) => cache.addAll(urls))
    .then(() => {
      if (offlineStatus) {
        offlineStatus.textContent = "✓ Saved on this device for reading without an internet connection.";
        offlineStatus.hidden = false;
      }
    })
    .catch(() => {});
}

// Remember pages for reading offline (see /sw.js).
if ("serviceWorker" in navigator && location.hostname !== "localhost") {
  navigator.serviceWorker.register("/sw.js").catch(() => {});
}
