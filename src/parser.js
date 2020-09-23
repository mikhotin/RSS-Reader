const parse = (data) => {
  const parser = new DOMParser();
  const feed = parser.parseFromString(data, 'text/html');
  const feedChannel = feed.body.querySelector('channel');
  const feedTitle = feedChannel.querySelector('title');
  const posts = [...feedChannel.querySelectorAll('item')]
    .map((post) => {
      const postTitle = post.querySelector('title');
      const postLink = post.querySelector('link').nextSibling;
      const pubDate = post.querySelector('pubdate');
      return {
        postTitle: postTitle.textContent,
        postLink: postLink.textContent.trim(),
        pubDate: new Date(pubDate.textContent),
      };
    });

  return { feedTitle: feedTitle.textContent, posts };
};

export default parse;
