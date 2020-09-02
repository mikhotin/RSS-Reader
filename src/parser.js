const parse = (response) => {
  const parser = new DOMParser();
  const feed = parser.parseFromString(response, 'text/html');
  const feedChannel = feed.body.querySelector('channel');
  const feedTitle = feedChannel.querySelector('title');
  const posts = [...feedChannel.querySelectorAll('item')];
  return { title: feedTitle.textContent, posts };
};

export default parse;
