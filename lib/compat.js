const { Text, Input, Container, Fragment, Style, Details, Summary } = require('./cells')

module.exports = {
  '': Fragment,
  h1: Text.Styled({ heading: 1 }),
  h2: Text.Styled({ heading: 2 }),
  h3: Text.Styled({ heading: 3 }),
  h4: Text.Styled({ heading: 4 }),
  h5: Text.Styled({ heading: 5 }),
  h6: Text.Styled({ heading: 6 }),
  pre: Text.Styled({ pre: true }),
  div: Container,
  input: Input.Styled({ multiline: false }),
  textbox: Input.Styled({ multiline: true }),
  span: Text,
  button: Container.Styled({ events: ['click'] }),
  p: Text.Styled({ paragraph: true }),
  details: Details,
  summary: Summary,
  style: Style
}
