const parse = (response) => {
  const parser = new DOMParser();
  return parser.parseFromString(response, 'text/html');
};

export default parse;
