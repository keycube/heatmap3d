document.addEventListener('DOMContentLoaded', function () {
  setTimeout(function () {
    document.body.classList.add('fade-out');
    setTimeout(function () {
      var baseUrl = document.querySelector('meta[name="baseurl"]').getAttribute('content');
      window.location.href = baseUrl + '/dataviz';
    }, 1000);
  }, 4000);
});
