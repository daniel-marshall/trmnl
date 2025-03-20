import { SignatureV4 } from '@aws-sdk/signature-v4';
import { Sha256 } from '@aws-crypto/sha256-js';
import axios from 'axios';

export async function callFunction(method: string, service: string, region: string, host: string, accessKeyId: string, secretAccessKey: string, data: any) {
    const signer = new SignatureV4({
        applyChecksum: false,
        credentials: { accessKeyId: accessKeyId, secretAccessKey: secretAccessKey },
        region: region,
        service: service,
        sha256: Sha256
    });

    const options = {
        hostname: host,
        path: '/',
        method: method,
        headers: {
            'Host': host,
            'Content-Type': 'application/json',
        },
        protocol: '',
        body: JSON.stringify(data)
    };

    const result = await signer.sign(options)
        .then((signed) => {
            const mutated = { ...signed };
            delete mutated.headers['Host'];
            return mutated;
        })
        .then((signed) => axios({
            ...signed,
            url: 'https://' + host,
            data: data
        }))
        .then((result) => JSON.stringify(result))
        .then((result) => document.body.innerText = result)
        .catch((err) => document.body.innerText = err);
}
