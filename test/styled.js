const test = require('brittle')
const { Text, Color, Spacing, BoxDecoration, Border } = require('..')

test('styled cells', async (t) => {
  const Button = Text.Styled({
    color: Color.from('#1447e6'),
    margin: Spacing.only({ right: 0.5 }),
    decoration: new BoxDecoration({
      border: Border.all({ color: Color.from('#f00') })
    })
  })

  const btn = new Button({
    value: 'Hello!'
  })

  t.ok(btn instanceof Text)
  t.is(btn.parent, 'Text')
  t.is(btn.value, 'Hello!')
  t.is(btn.color.toString(), 'Color(red:20,green:71,blue:230,alpha:1)')
  t.is(
    btn.decoration.toString(),
    'BoxDecoration(border: Border(width: 1,color: Color(red:255,green:0,blue:0,alpha:1)))'
  )
})
