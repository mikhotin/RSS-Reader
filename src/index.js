import 'bootstrap/js/dist/alert';
import 'bootstrap/js/dist/util';
import 'bootstrap/dist/css/bootstrap.min.css';
import * as yup from 'yup';
import onChange from 'on-change';
import _ from 'lodash';
import axios from 'axios';

const app = () => {
  const schema = yup.object().shape({
    url: yup.string().required().url(),
  });

  const elements = {
    container: document.querySelector('main'),
    form: document.querySelector('form'),
    input: document.querySelector('input'),
    btn: document.querySelector('button'),
    feedback: document.querySelector('.feedback'),
  };

  const state = {
    form: {
      processState: 'filling',
      processError: null,
      valid: true,
      field: {
        url: '',
      },
      errors: {},
    },
    feeds: [],
  };

  const processStateHandler = (processState) => {
    switch (processState) {
      case 'failed':
        // submitButton.disabled = false;
        // TODO render error
        break;
      case 'filling':
        // submitBtn.disabled = false;
        break;
      case 'sending':
        elements.btn.disabled = true;
        break;
      default:
        throw new Error(`Unknown state: ${processState}`);
    }
  };

  const renderError = (element, data) => {
    const { name } = element;
    if (_.isEqual(data, {})) {
      element.classList.remove('is-invalid');
      elements.feedback.classList.remove('text-danger');
      elements.feedback.textContent = '';
    } else {
      element.classList.add('is-invalid');
      elements.feedback.classList.add('text-danger');
      elements.feedback.textContent = data[name].message;
    }
  };

  const parse = (responseData) => {
    const parser = new DOMParser();
    return parser.parseFromString(responseData, 'text/html');
  };

  const renderFeeds = (data) => {
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

    const feedsContainer = document.createElement('div');
    feedsContainer.classList.add('container-xl');
    const row = document.createElement('div');
    row.classList.add('row');
    const feedList = document.createElement('div');
    feedList.classList.add('feeds', 'col-md-10', 'col-lg-8', 'mx-auto');
    feedList.appendChild(feedTitle);
    feedList.appendChild(postsList);
    row.appendChild(feedList);
    feedsContainer.appendChild(row);

    elements.container.appendChild(feedsContainer);
  };

  const watchedState = onChange(state, (path, value) => {
    switch (path) {
      // case 'form.processState':
      //   processStateHandler(value);
      //   break;
      case 'form.valid':
        elements.btn.disabled = !value;
        break;
      case 'form.errors':
        renderError(elements.input, value);
        break;
      case 'feeds':
        renderFeeds(state.feeds[state.feeds.length - 1]);
        break;
      default:
        break;
    }
  });

  const validate = (field) => {
    try {
      schema.validateSync(field, { abortEarly: false });
      return {};
    } catch (e) {
      return _.keyBy(e.inner, 'path');
    }
  };

  const updateValidationState = () => {
    const errors = validate(watchedState.form.field);
    watchedState.form.valid = _.isEqual(errors, {});
    watchedState.form.errors = errors;
  };

  const validateFeeds = (responce, url) => {
    if (state.feeds.includes(url)) {
      throw new Error('RRS feed already exist');
    }
    watchedState.feeds.push({ url, responce });
  };

  elements.input.addEventListener('input', ({ target }) => {
    watchedState.form.field[elements.input.name] = target.value;
    updateValidationState(watchedState);
  });

  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();
    const url = elements.input.value;
    axios.get(url)
      .then((responce) => {
        validateFeeds(responce, url);
      })
      .catch((err) => {
        console.log(err);
      });
  });
};

app();
