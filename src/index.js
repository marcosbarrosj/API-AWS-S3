require('dotenv').config();
const express = require('express');
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');
const path = require('path');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

const upload = multer({
    storage: multer.memoryStorage(), // Armazena o arquivo na memória antes de enviar para o S3
});

const app = express();

app.post('/file', upload.single('imagem'), async (req, res) => {
    try {
        const file = req.file;

        if (!file) {
            return res.status(400).send('Nenhum arquivo enviado.');
        }

        const fileName = `${uuidv4()}${path.extname(file.originalname)}`;

        const params = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: fileName,
            Body: file.buffer,
            ContentType: file.mimetype,
        };

        const command = new PutObjectCommand(params);
        await s3.send(command);

        res.status(200).send(`Upload realizado com sucesso: ${fileName}`);
    } catch (err) {
        console.error(err);
        res.status(500).send('Erro ao realizar upload.');
    }
});

app.listen(3333, () => {
    console.log('Servidor rodando na porta 3333');
});
