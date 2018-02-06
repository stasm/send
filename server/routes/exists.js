const storage = require('../storage');

module.exports = async (req, res) => {
  try {
    const meta = await storage.metadata(req.params.id);
    res.set('WWW-Authenticate', `send-v1 ${meta.nonce}`);
    res.send({
      password: meta.pwd !== '0'
    });
  } catch (e) {
    res.sendStatus(404);
  }
};
