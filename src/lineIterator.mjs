
/**
 *
 * @param reader
 */
export async function* lineIterator(reader) {
  const utf8Decoder = new TextDecoder("utf-8");
  let { value, done } = await reader.read();
  value = value ? utf8Decoder.decode(value) : "";

  let re = /\n|\r|\r\n/gm;
  let startIndex = 0;

  for (;;) {
    let result = re.exec(value);
    if (!result) {
      if (done) {
        break;
      }
      let remainder = value.substr(startIndex);
      ({ value, done } = await reader.read());

      value = remainder + (value ? utf8Decoder.decode(value) : "");
      startIndex = re.lastIndex = 0;
      continue;
    }
    yield value.substring(startIndex, result.index);
    startIndex = re.lastIndex;
  }
  if (startIndex < value.length) {
    yield value.substr(startIndex);
  }
}

export async function* parseJson(source) {
  for await (const line of source) {
    yield JSON.parse(line);
  }
}
