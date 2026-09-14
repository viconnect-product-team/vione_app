const Minio = require('minio');

const minioClient = new Minio.Client({
  endPoint: '14.225.217.232',
  port: 9050,
  useSSL: false,
  accessKey: 'minioadmin',
  secretKey: 'minioadmin',
});

minioClient.listBuckets().then(buckets => {
  console.log('MinIO Connected! Buckets:', buckets);
}).catch(err => {
  console.error('MinIO connection error:', err);
});
