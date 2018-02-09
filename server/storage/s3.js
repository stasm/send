const AWS = require('aws-sdk');
const s3 = new AWS.S3();

class S3Storage {
  constructor(config, log) {
    this.bucket = config.s3_bucket;
    this.log = log;
  }

  async length(id) {
    const result = await s3
      .headObject({ Bucket: this.bucket, Key: id })
      .promise();
    return result.ContentLength;
  }

  getStream(id) {
    return s3.getObject({ Bucket: this.bucket, Key: id }).createReadStream();
  }

  async set(id, file) {
    let hitLimit = false;
    const upload = s3.upload({
      Bucket: this.bucket,
      Key: id,
      Body: file
    });
    file.on('limit', () => {
      hitLimit = true;
      upload.abort();
    });
    try {
      await upload.promise();
    } catch (e) {
      if (hitLimit) {
        throw new Error('limit');
      }
      throw e;
    }
  }

  del(id) {
    return s3.deleteObject({ Bucket: this.bucket, Key: id }).promise();
  }

  ping() {
    return s3.headBucket({ Bucket: this.bucket }).promise();
  }
}

module.exports = S3Storage;
