import 'bootstrap/js/dist/alert';
import 'bootstrap/js/dist/util';
import 'bootstrap/dist/css/bootstrap.min.css';
import * as yup from 'yup';
import _ from 'lodash';
import axios from 'axios';
import state from './state';
import watchedState from './view';

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
  const changeState = (type, data) => {
    const transitions = {
      SUCCESS: (val) => watchedState.feeds.push(val),
      ERROR: (val) => watchedState.form.errors = val,
    };
    return transitions[type](data);
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const url = input.value;
    watchedState.form.field.url = url;
    const errors = validate(url);
    if (_.isEqual(errors, {}) && !isLoaded(url)) {
      axios.get(url)
        .then((responce) => {
          changeState('SUCCESS', { url, responce, id: 0 });
        })
        .catch((err) => {
          changeState('ERROR', err);
        });
    } else {
      const notice = isLoaded(url) ? 'RRS feed has already exist' : errors;
      changeState('ERROR', notice);
    }
  });
};

app();
