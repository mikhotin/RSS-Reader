import 'bootstrap/js/dist/alert';
import 'bootstrap/js/dist/util';
import 'bootstrap/dist/css/bootstrap.min.css';
import * as yup from 'yup';
import _ from 'lodash';
import axios from 'axios';
import i18next from 'i18next';
import { ru, en } from './locales';
import state from './state';
import watchedState from './view';
import parse from './parser';

i18next.init({
  lng: 'en',
  debug: true,
  resources: {
    ru,
    en,
  },
}, () => {
  document.querySelector('.lead').innerHTML = i18next.t('lead');
  document.querySelector('button').innerHTML = i18next.t('btn');
  document.querySelector('.example').innerHTML = i18next.t('example');
});

let timerUpdateFeeds;
const getLastDatePost = (coll) => {
  const mappedColl = coll.map((item) => {
    const pubDate = item.querySelector('pubdate');
    return new Date(pubDate.textContent);
  }).sort();
  return mappedColl[mappedColl.length - 1];
};
const updateFeeds = (feeds) => {
  const checkFeed = () => {
    feeds.forEach(({ url, lastPost }) => {
      axios.get(url)
        .then(({ data }) => {
          const feed = parse(data);
          const newLastPost = getLastDatePost(feed.posts);
          return newLastPost < lastPost;
        })
        .catch((err) => {
          console.log(err);
        });
    });
    updateFeeds(feeds);
  };
  timerUpdateFeeds = setTimeout(checkFeed, 5000);
};

const app = () => {
  const schema = yup.string().url();
  const form = document.querySelector('form');
  const input = document.querySelector('input');

  const validate = (field) => {
    try {
      schema.validateSync(field, { abortEarly: false });
      return {};
    } catch (e) {
      return e.message;
    }
  };
  const isLoaded = (url) => {
    const collFeeds = state.feeds.map((feed) => feed.url);
    return collFeeds.includes(url);
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const url = `https://cors-anywhere.herokuapp.com/${input.value}`;
    watchedState.form.field.url = url;
    const errors = validate(url);
    if (_.isEqual(errors, {}) && !isLoaded(url)) {
      axios.get(url)
        .then(({ data }) => {
          const { title, posts } = parse(data);
          const lastPost = getLastDatePost(posts);
          const rrsId = _.uniqueId();
          watchedState.feeds.push({ url, id: rrsId, lastPost });
          watchedState.posts.push({
            title, items: posts, id: rrsId,
          });
          clearTimeout(timerUpdateFeeds);
          updateFeeds(watchedState.feeds);
        })
        .catch((err) => {
          watchedState.form.errors = err;
        });
    } else {
      const notice = isLoaded(url) ? 'RRS feed has already exist' : errors;
      watchedState.form.errors = notice;
    }
  });
};

app();
