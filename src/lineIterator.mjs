
/**
 * Produces lines from a reader
 * @param {Reader} reader
 * @return {AsyncIterator<string>} lines
 */
export async function* lineIterator(reader) {
  let { value, done } = await reader.read();

  if(done) { return; }
  
  const utf8Decoder = new TextDecoder("utf-8");

  value = value ? utf8Decoder.decode(value) : "";

  const re = /\n|\r\n/gm;
  let startIndex = 0;

  for (;;) {
    const result = re.exec(value);
    if (!result) {
      if (done) {
        break;
      }
      const remainder = value.substr(startIndex);
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

/**
 * Decodes json lines
 * @param {AsyncIterator<string>} source 
 * @return {AsyncIterator<Object>} decoded json 
 */
export async function* decodeJson(source) {
  for await (const line of source) {
    yield JSON.parse(line);
  }
}
