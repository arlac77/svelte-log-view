const { createReadStream } = require("fs");
const { join } = require("path");

exports.handler = async (event, context) => {
  const cursor =
    event.queryStringParameters && event.queryStringParameters.cursor;
  const offset =
    event.queryStringParameters && event.queryStringParameters.offset;
  const number =
    event.queryStringParameters && event.queryStringParameters.number;

  return {
    statusCode: 200,
    body: createReadStream(join(__dirname, __filename))
    //body: `${cursor}:${offset}:${number}\nline 1\nline 2\nline 3`
  };
};
