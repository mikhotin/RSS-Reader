import onChange from 'on-change';
import i18next from 'i18next';

const renderFeed = (feedPosts, elements) => {
  const { feedTitle, posts } = feedPosts[feedPosts.length - 1];
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
      elements.input.value = '';
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

const renderFormError = (err) => {
  if (err === null) {
    return;
  }
  const error = document.querySelector('.feedback');
  error.classList.add('text-danger');
  error.textContent = err;
};

const renderFormNotice = (form, elements) => {
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
    elements.feedback.textContent = form.field.url.error;
  }
};

const initView = (state, elements) => {
  const mapping = {
    'form.status': () => renderForm(state.form, elements),
    'form.field.url': () => renderFormNotice(state.form, elements),
    'form.error': () => renderFormError(state.form.error, elements),
    posts: () => renderFeed(state.posts, elements),
  };

  const watchedState = onChange(state, (path) => {
    if (mapping[path]) {
      mapping[path]();
    }
  });

  return watchedState;
};

export default initView;
