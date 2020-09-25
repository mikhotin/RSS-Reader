import onChange from 'on-change';
import i18next from 'i18next';
import initLang from './locales';

initLang();
document.querySelector('.example').textContent = i18next.t('example');
document.querySelector('button').textContent = i18next.t('btn');
document.querySelector('.lead').textContent = i18next.t('text');

const renderFeed = (feed, elements) => {
  const { feedTitle, posts } = feed[feed.length - 1];
  const title = document.createElement('h2');
  title.textContent = feedTitle;

  const postsList = document.createElement('ul');
  postsList.innerHTML = posts.map(({ postTitle, postLink }) => `<li><a href="${postLink}">${postTitle}</a></li>`)
    .join('\n');

  const feedContainer = document.createElement('div');
  feedContainer.classList.add('container-xl');
  const row = document.createElement('div');
  row.classList.add('row');
  const feedList = document.createElement('div');
  feedList.classList.add('feeds', 'col-md-10', 'col-lg-8', 'mx-auto');
  feedList.appendChild(title);
  feedList.appendChild(postsList);
  row.appendChild(feedList);
  feedContainer.appendChild(row);

  elements.container.appendChild(feedContainer);
};

const renderForm = (form, elements) => {
  switch (form.status) {
    case 'success':
      elements.input.value = ''; // no-param-reassign
      elements.btn.removeAttribute('disabled');
      break;
    case 'loading':
      elements.btn.setAttribute('disabled', true);
      break;
    case 'failed':
      elements.btn.removeAttribute('disabled');
      break;
    default:
      throw Error(`Unknown form status: ${form.status}`);
  }
};

const renderAppError = (err) => {
  if (err === null) {
    return;
  }
  const error = document.querySelector('.feedback');
  error.classList.add('text-danger');
  error.textContent = err;
};

const renderFormError = (form, elements) => {
  elements.input.focus();
  const error = document.querySelector('.text-danger');
  if (error) {
    error.classList.remove('text-danger');
    error.textContent = '';
    elements.input.classList.remove('is-invalid');
  }

  if (form.field.url.valid) {
    elements.feedback.classList.add('text-success');
    elements.feedback.textContent = i18next.t('success');
  } else {
    elements.input.classList.add('is-invalid');
    elements.feedback.classList.add('text-danger');
    elements.feedback.textContent = form.field.url.error === 'loaded' ? i18next.t('error') : form.field.url.error;
  }
};

const initView = (state, elements) => {
  const mapping = {
    'form.status': () => renderForm(state.form, elements),
    'form.field.url': () => renderFormError(state.form, elements),
    posts: () => renderFeed(state.posts, elements),
    error: () => renderAppError(state.error, elements),
  };

  const watchedState = onChange(state, (path, value) => {
    console.log(path, value);
    if (mapping[path]) {
      mapping[path]();
    }
  });

  return watchedState;
};

export default initView;
