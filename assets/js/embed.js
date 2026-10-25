// Click-to-load: the app is only requested after the visitor asks for it.
document.querySelectorAll('.embed').forEach(function (box) {
  var btn = box.querySelector('button');
  if (!btn) return;
  btn.addEventListener('click', function () {
    var f = document.createElement('iframe');
    f.src = box.dataset.src;
    f.title = box.dataset.title;
    f.loading = 'lazy';
    f.setAttribute('referrerpolicy', 'no-referrer');
    box.querySelector('.embed-body').replaceChildren(f);
    box.classList.add('loaded');
  });
});
