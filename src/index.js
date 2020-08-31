import 'bootstrap/js/dist/alert';
import 'bootstrap/js/dist/util';
import 'bootstrap/dist/css/bootstrap.min.css';
import * as yup from 'yup';
import _ from 'lodash';
import axios from 'axios';
import state from './state';
import watchedState from './view';
import parse from './parser';

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
        .then((responce) => {
          const feed = parse(responce.data);
          const dataChannel = feed.body.querySelector('channel');
          const dataTitle = dataChannel.querySelector('title');
          const dataPosts = [...dataChannel.querySelectorAll('item')];
          const rrsId = _.uniqueId();
          watchedState.feeds.push({ url, id: rrsId });
          watchedState.posts.push({ title: dataTitle.textContent, items: dataPosts, id: rrsId });
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
