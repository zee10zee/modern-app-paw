// // app.js (loaded FIRST in your HTML)
window.commentObserver = new MutationObserver(() => {
    
  if (window.attachCommentListeners) {
    window.attachCommentListeners(); // Defined in other files
  }
});

// // Start observing (call this after DOM is ready)
function initCommentObserver() {
  const container = document.getElementById('comments-container');
  if (container) {
    window.commentObserver.observe(container, { childList: true, subtree: true });
  }
}

// // Initialize when DOM loads
document.addEventListener('DOMContentLoaded', initCommentObserver);

// const CommentObserver = (function() {
//   const observer = new MutationObserver(() => {
//     if (typeof attachCommentListeners === 'function') {
//       attachCommentListeners();
//     }
//   });
//   return { observer };
// })();

// Usage
           