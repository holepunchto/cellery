export const JsonBufferEncoding = {
  encode: (data) => {
    console.log('encode?')
    return Buffer.from(JSON.stringify(data))
  },
  decode: (data) => {
    console.log('decode?')
    return JSON.parse(Buffer.from(data).toString())
  }
}
