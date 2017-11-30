const config = require('./config.json');
const timeParser = require('d3-time-format').utcParse('%B %d, %Y at %I:%M%p %Z');
const strftime = require('strftime').timezone(config.LOCAL_TIMEZONE);
const rp = require('request-promise-native');

exports.formatWithingsWebHook = function formatWithingsWebHook(req, res) {
  if (req.get('content-type') != 'application/json') {
    res.status(400).send('JSON Only!');
    return;
  }
  if (req.method != 'POST') {
    res.status(400).send('POST Only!');
    return;
  }

  notFormattedTime = req.body.at;
  weight = req.body.weight;
  fatWeight = req.body.fat;

  at = timeParser(`${notFormattedTime} ${config.LOCAL_TIMEZONE}`);
  if (!at) {
    res.status(400).send('Time parse failed!');
    return;
  }
  formattedAt = strftime(config.IFTTT_WEBHOOK_TIME_FORMAT, at);

  requestOptions = {
    method: 'POST',
    uri: `https://maker.ifttt.com/trigger/${config.IFTTT_WEBHOOK_EVENT}/with/key/${config.IFTTT_WEBHOOK_TOKEN}`,
    json: true,
    body: {
      value1: formattedAt,
      value2: weight,
      value3: fatWeight
    }
  };
  rp(requestOptions).then(function (body) { }).catch(function (err) {
    console.log('IFTTT Webhook Failed.');
    console.log(err);
    res.status(500).send('IFTTT Webhook Failed!');
    return;
  });

  res.send(JSON.stringify({}));
};
