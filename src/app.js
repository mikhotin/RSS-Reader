import 'bootstrap/js/dist/alert';
import 'bootstrap/js/dist/util';
import 'bootstrap/dist/css/bootstrap.min.css';
import * as yup from 'yup';
import _ from 'lodash';
import axios from 'axios';
import i18next from 'i18next';
import initView from './view';
import parse from './parser';
import { ru, en } from './locales';

const getLastDatePost = (posts) => {
  const dateColl = posts.map(({ pubDate }) => pubDate).sort();
  return dateColl[dateColl.length - 1];
};

const app = () => {
  i18next.init({
    lng: 'en',
    resources: {
      ru,
      en,
    },
  }).then(() => {
    document.querySelector('.example').textContent = i18next.t('example');
    document.querySelector('button').textContent = i18next.t('btnText');
    document.querySelector('.lead').textContent = i18next.t('text');
  });
  const state = {
    form: {
      status: 'initial',
      field: {
        url: {
          valid: true,
          error: null,
        },
      },
      error: null,
    },
    feeds: [],
    posts: [],
  };
  const elements = {
    container: document.querySelector('main'),
    input: document.querySelector('input'),
    btn: document.querySelector('button'),
    feedback: document.querySelector('.feedback'),
    form: document.querySelector('form'),
  };
  const watched = initView(state, elements);
  const validate = (field, links) => {
    const schema = yup.string()
      .url(i18next.t('errors.notValidUrl'))
      .required(i18next.t('errors.requiredField'))
      .notOneOf(links, i18next.t('errors.alreadyLoaded'));

    try {
      schema.validateSync(field, { abortEarly: false });
      return null;
    } catch (error) {
      return error.message;
    }
  };
  const hasNewPost = ({ url, id }) => {
    axios.get(url).then(({ data }) => {
      const { posts } = parse(data);
      const newLastPost = getLastDatePost(posts);
      const [{ lastPost }] = state.posts.filter((item) => item.id === id);
      return newLastPost < lastPost;
    });
  };

  let timerUpdateFeeds;
  const updateFeeds = (feeds) => {
    const checkFeed = () => Promise.all(feeds.map(hasNewPost)).then(() => updateFeeds(feeds));
    timerUpdateFeeds = setTimeout(checkFeed, 5000);
  };

  elements.form.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const value = formData.get('url');
    const links = state.feeds.map(({ link }) => link);
    const error = validate(value, links);

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
      watched.form.field.url = {
        valid: true,
        error: null,
      };
      watched.form.error = null;
      watched.form.status = 'loading';

      axios.get(url).then(({ data }) => {
        const { feedTitle, posts } = parse(data);
        const lastPost = getLastDatePost(posts);
        const rssFeedId = _.uniqueId();
        watched.feeds.push({ url, link: value, id: rssFeedId });
        watched.posts.push({
          feedTitle, posts, id: rssFeedId, lastPost,
        });

        clearTimeout(timerUpdateFeeds);
        updateFeeds(watched.feeds);
      });
      watched.form.status = 'success';
    } catch (err) {
      watched.form.status = 'failed';
      watched.form.error = err.message;
    }
  });
};

export default app;
