import 'bootstrap/js/dist/alert';
import 'bootstrap/js/dist/util';
import 'bootstrap/dist/css/bootstrap.min.css';
import * as yup from 'yup';
import _ from 'lodash';
import axios from 'axios';
import initView from './view';
import parse from './parser';

let timerUpdateFeeds;
const validate = (field) => {
  const schema = yup
    .string()
    .url()
    .required();

  try {
    schema.validateSync(field, { abortEarly: false });
    return null;
  } catch (error) {
    return error.message;
  }
};
const getLastDatePost = (posts) => {
  const pubDateColl = posts.map(({ pubDate }) => pubDate).sort();
  return pubDateColl[pubDateColl.length - 1];
};
const updateFeeds = (feeds) => {
  const checkFeed = () => {
    feeds.forEach(({ url, lastPost }) => {
      axios.get(url)
        .then(({ data }) => {
          const { posts } = parse(data);
          const newLastPost = getLastDatePost(posts);
          return newLastPost < lastPost;
        });
    });
    updateFeeds(feeds);
  };
  timerUpdateFeeds = setTimeout(checkFeed, 5000);
};
const isFeedLoaded = (url, feeds) => {
  if (feeds.length === 0) {
    return false;
  }
  const collFeeds = feeds.map((feed) => feed.url);
  return collFeeds.includes(url);
};

const app = () => {
  const state = {
    form: {
      status: 'initial',
      field: {
        url: {
          value: '',
          valid: true,
          error: null,
        },
      },
    },
    feeds: [],
    posts: [],
    error: null,
  };
  const elements = {
    container: document.querySelector('main'),
    input: document.querySelector('input'),
    btn: document.querySelector('button'),
    feedback: document.querySelector('.feedback'),
    form: document.querySelector('form'),
  };
  const watched = initView(state, elements);

  elements.form.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const value = formData.get('url');
    const error = validate(value);

    if (error) {
      watched.form.field.url = {
        error,
        valid: false,
      };
      return;
    }

    try {
      const [, link] = value.split('//');
      const url = `https://cors-anywhere.herokuapp.com/${link}`;
      const loadedFeed = isFeedLoaded(url, watched.feeds);
      if (loadedFeed) {
        watched.form.field.url = {
          valid: false,
          error: 'loaded',
        };
        return;
      }
      watched.form.field.url = {
        valid: true,
        error: null,
      };
      watched.error = null;
      watched.form.status = 'loading';
      watched.form.field.url.value = url;

      axios.get(url).then(({ data }) => {
        const { feedTitle, posts } = parse(data);
        const lastPost = getLastDatePost(posts);
        const rssFeedId = _.uniqueId();
        watched.feeds.push({ url, id: rssFeedId, lastPost });
        watched.posts.push({ feedTitle, posts, id: rssFeedId });

        clearTimeout(timerUpdateFeeds);
        updateFeeds(watched.feeds);
      });
      watched.form.status = 'success';
    } catch (err) {
      watched.form.status = 'failed';
      watched.error = err.message;
    }
  });
};

export default app;
