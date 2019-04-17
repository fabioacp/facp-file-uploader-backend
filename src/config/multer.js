const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const aws = require('aws-sdk');
const multerS3 = require('multer-s3');

const storageTypes = {
    local: multer.diskStorage({
        destination: (req, file, callback) => {
            callback(null, path.resolve(__dirname, '..', '..', 'tmp', 'uploads'));
        },
        filename: (req, file, callback) => {
            crypto.randomBytes(16, (err, hash) => {
                if(err) callback(err);

                file.key = `${hash.toString('hex')}-${file.originalname}`;
                callback(null, file.key)
            });
        }
    }),
    s3: multerS3({
        s3: new aws.S3(),
        bucket: 'facp-file-uploader',
        contentType: multerS3.AUTO_CONTENT_TYPE,
        acl: 'public-read',
        key: (req, file, callback) => {
            crypto.randomBytes(16, (err, hash) => {
                if(err) callback(err);

                const fileName = `${hash.toString('hex')}-${file.originalname}`;
                callback(null, fileName)
            });
        }
    }),
};

module.exports = {
    destination: path.resolve(__dirname, '..', '..', 'tmp', 'uploads'),
    storage: storageTypes["s3"], 
    limits: {
        fileSize: 2 * 1024 * 1024
    },
    fileFilter: (req, file, callback) => {
        const allowedmimes = [
            'image/jpeg',
            'image/pjpeg',
            'image/png',
            'image/gif'
        ];

        if(allowedmimes.includes(file.mimetype)){
            callback(null, true);
        }
        else{
            callback(new Error('Invalid File Type'));
        }
    }
};