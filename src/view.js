import onChange from 'on-change';
import _ from 'lodash';
import parse from './parser';
import state from './state';

const elements = {
  container: document.querySelector('main'),
  input: document.querySelector('input'),
  btn: document.querySelector('button'),
  feedback: document.querySelector('.feedback'),
};

const renderError = (data) => {
  if (_.isEqual(data, {})) {
    elements.input.classList.remove('is-invalid');
    elements.feedback.classList.remove('text-danger');
    elements.feedback.textContent = '';
  } else {
    elements.input.classList.add('is-invalid');
    elements.feedback.classList.add('text-danger');
    elements.feedback.textContent = data;
  }
};

const renderFeed = (data) => {
  const { responce } = data;
  const feed = parse(responce.data);
  const dataChannel = feed.body.querySelector('channel');
  const dataTitle = dataChannel.querySelector('title');
  const dataPosts = [...dataChannel.querySelectorAll('item')];

  const feedTitle = document.createElement('h2');
  feedTitle.textContent = dataTitle.textContent;
  const postsList = document.createElement('ul');
  postsList.innerHTML = dataPosts.map((item) => {
    const itemTitle = item.querySelector('title');
    const itemLink = item.querySelector('link');
    const href = itemLink.nextSibling.textContent.trim();
    return `<li><a href="${href}">${itemTitle.textContent}</a></li>`;
  }).join('\n');

  const feedContainer = document.createElement('div');
  feedContainer.classList.add('container-xl');
  const row = document.createElement('div');
  row.classList.add('row');
  const feedList = document.createElement('div');
  feedList.classList.add('feeds', 'col-md-10', 'col-lg-8', 'mx-auto');
  feedList.appendChild(feedTitle);
  feedList.appendChild(postsList);
  row.appendChild(feedList);
  feedContainer.appendChild(row);

  elements.container.appendChild(feedContainer);
  elements.input.classList.remove('is-invalid');
  elements.feedback.classList.remove('text-danger');
  elements.feedback.classList.add('text-success');
  elements.feedback.innerHTML = 'Rss has been loaded';
  elements.input.value = '';
};

const watchedState = onChange(state, (path, value) => {
  console.log(path, value);
  switch (path) {
    case 'form.errors':
      renderError(value);
      break;
    case 'feeds':
      renderFeed(watchedState.feeds[watchedState.feeds.length - 1]);
      break;
    default:
      break;
  }
});

export default watchedState;
