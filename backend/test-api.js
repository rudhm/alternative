const jwt = require('jsonwebtoken');

const token = jwt.sign(
  { id: 'Rudh', username: 'Rudh' },
  '350e20a49b499f9e0d45cc6cf17d444cadd6028e6380a9236ff827013fa7aa9ab0d7c597141488c8e4285ffcd97f3007a2b59a1d2d3e479b05a0660aac7d2830'
);

fetch("https://rudhasi.mooo.com/api/folders", {
  headers: { "Authorization": `Bearer ${token}` }
}).then(res => res.text()).then(text => console.log("Folders API:", text));

fetch("https://rudhasi.mooo.com/api/messages?folderId=main-folder-id", {
  headers: { "Authorization": `Bearer ${token}` }
}).then(res => res.text()).then(text => console.log("Messages API:", text.slice(0, 500)));
