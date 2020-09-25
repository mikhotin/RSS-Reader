import i18next from 'i18next';
import ru from './ru';
import en from './en';

export default () => {
  i18next.init({
    lng: 'en',
    resources: {
      ru,
      en,
    },
  });
};
