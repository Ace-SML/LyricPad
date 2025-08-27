document.addEventListener('DOMContentLoaded', () => {
  const songList = document.getElementById('song-list');
  const editor = document.getElementById('editor');
  const titleInput = document.getElementById('song-title');
  const editorArea = document.getElementById('editor-area');
  const btnNew = document.getElementById('btn-new');
  const btnTheme = document.getElementById('btn-theme');
  const searchInput = document.getElementById('search-input');
  const btnExport = document.getElementById('btn-export');
  const exportFormat = document.getElementById('export-format');
  const wordCount = document.getElementById('word-count');
  const charCount = document.getElementById('char-count');
  const btnClose = document.getElementById('btn-close');

  let songs = JSON.parse(localStorage.getItem('songs') || '[]');
  let currentId = null;
  let theme = localStorage.getItem('theme') || 'dark';
  document.body.setAttribute('data-theme', theme);
  btnTheme.textContent = theme === 'dark' ? 'Light' : 'Dark';

  const sanitize = str => str.replace(/</g, '&lt;').replace(/>/g, '&gt;');

  const renderList = () => {
    songList.innerHTML = '';
    const q = searchInput.value.toLowerCase();
    songs.filter(s => s.title.toLowerCase().includes(q))
      .forEach(song => {
        const div = document.createElement('div');
        div.className = 'song-item';
        div.innerHTML = `<div>
          <div class="song-title">${sanitize(song.title)}</div>
          <div class="song-preview">${sanitize(song.content).slice(0,15)}...</div>
        </div>
        <div>
        <button class="btn small" data-id="${song.id}">Open</button>
        <button class="btn small" data-id="${song.id}">Delete</button>
        </div>`;
        songList.appendChild(div);
      });
  };

  const saveSongs = () => localStorage.setItem('songs', JSON.stringify(songs));

  const updateCounts = () => {
    const text = editorArea.innerText.trim();
    wordCount.textContent = `${text.split(/\s+/).filter(Boolean).length} words`;
    charCount.textContent = `${text.length} chars`;
  };

  const openSong = id => {
    const song = songs.find(s => s.id === id);
    if (!song) return;
    currentId = id;
    titleInput.value = song.title;
    editorArea.innerHTML = song.content;
    editor.classList.remove('hidden');
    updateCounts();
  };

  btnNew.addEventListener('click', () => {
  currentId = null; // No ID yet
  titleInput.value = 'Untitled';
  editorArea.innerHTML = '';
  editor.classList.remove('hidden');
  editor.style.visibility = "visible";
});


  songList.addEventListener('click', e => {
    if (e.target.tagName === 'BUTTON') openSong(e.target.dataset.id);
    editor.style.visibility = "visible";
  });

  const ensureSongExists = () => {
  if (!currentId) {
    // Only create if there's real content
    const text = editorArea.innerText.trim();
    const title = titleInput.value.trim();
    if (text || title !== 'Untitled') {
      currentId = Date.now().toString();
      songs.push({ id: currentId, title: titleInput.value, content: editorArea.innerHTML });
      saveSongs();
    }
  }
};

titleInput.addEventListener('input', () => {
  ensureSongExists();
  if (currentId) {
    const song = songs.find(s => s.id === currentId);
    song.title = titleInput.value;
    saveSongs();
    renderList();
  }
});

editorArea.addEventListener('input', () => {
  ensureSongExists();
  if (currentId) {
    const song = songs.find(s => s.id === currentId);
    song.content = editorArea.innerHTML;
    saveSongs();
  }
  updateCounts();
});

  btnTheme.addEventListener('click', () => {
    theme = theme === 'dark' ? 'light' : 'dark';
    document.body.setAttribute('data-theme', theme);
    btnTheme.textContent = theme === 'dark' ? 'Light' : 'Dark';
    localStorage.setItem('theme', theme);
  });

  searchInput.addEventListener('input', renderList);

  document.querySelectorAll('.toolbtn').forEach(btn => {
    btn.addEventListener('click', () => {
      const action = btn.dataset.action;
      if (action === 'bold') document.execCommand('bold');
      else if (action === 'italic') document.execCommand('italic');
      else if (action === 'underline') document.execCommand('underline');
      else if (action === 'undo') document.execCommand('undo');
      else if (action === 'redo') document.execCommand('redo');
      else if (action === 'copy') navigator.clipboard.writeText(editorArea.innerText);
    });
  });

  document.getElementById('font-size').addEventListener('change', e => {
  const size = parseInt(e.target.value);
  editorArea.style.fontSize = `${size}px`;

  // Adjust CSS variables dynamically
  document.documentElement.style.setProperty('--editor-font-size', `${size}px`);
  document.documentElement.style.setProperty('--editor-line-height', `${size + 8}px`);
});


  btnExport.addEventListener('click', () => {
    const format = exportFormat.value;
    const song = songs.find(s => s.id === currentId);
    if (!song) return;
    const blob = new Blob([song.content.replace(/<[^>]+>/g, '')], { type: format === 'txt' ? 'text/plain' : 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${song.title}.${format}`;
    a.click();
    URL.revokeObjectURL(url);
  });

  btnClose.addEventListener('click', () => {
    editor.style.visibility = "hidden";
  });

  renderList();
});
