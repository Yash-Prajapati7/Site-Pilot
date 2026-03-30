import express from 'express';
import archiver from 'archiver';
import { auth } from '../middleware/auth.js';
import Website from '../models/Website.js';
import SiteBackend from '../models/SiteBackend.js';

const router = express.Router();

router.get('/:websiteId/docker', auth, async (req, res) => {
    try {
        const website = await Website.findOne({ _id: req.params.websiteId, tenant: req.tenantId });
        if (!website) return res.status(404).json({ error: 'Website not found' });

        const backend = await SiteBackend.findOne({ website: website._id });

        res.setHeader('Content-Type', 'application/zip');
        res.setHeader('Content-Disposition', 'attachment; filename="' + website.slug + '-docker-bundle.zip"');

        const archive = archiver('zip', { zlib: { level: 9 } });

        archive.on('error', (err) => {
            console.error('Archiver error:', err);
            res.status(500).send({ error: err.message });
        });

        archive.pipe(res);

        archive.append(website.generatedHTML || '<h1>No content generated yet</h1>', { name: 'public/index.html' });

        const dbSnapshot = {
            apiDefinition: backend ? backend.apiDefinition : { endpoints: [], collections: [] },
            data: backend && backend.data ? backend.data : {}
        };
        archive.append(JSON.stringify(dbSnapshot, null, 2), { name: 'database.json' });

        const serverCode = [
            "const express = require('express');",
            "const cors = require('cors');",
            "const fs = require('fs');",
            "const app = express();",
            "app.use(cors());",
            "app.use(express.json());",
            "app.use(express.static('public'));",
            "let db = { apiDefinition: { endpoints: [], collections: [] }, data: {} };",
            "try { db = JSON.parse(fs.readFileSync('./database.json', 'utf-8')); } catch (err) { console.log('No existing data found, starting fresh.'); }",
            "function saveDB() { fs.writeFileSync('./database.json', JSON.stringify(db, null, 2)); }",
            "function handleRequest(req, res, endpoint) {",
            "   const method = req.method;",
            "   const ep = db.apiDefinition.endpoints.find(e => e.path === '/' + endpoint && e.method === method);",
            "   if (!ep) { if (method === 'GET') return res.json({ success: true, data: db.data[endpoint] || [] }); return res.status(404).json({ error: 'Endpoint not found in schema' }); }",
            "   const collName = endpoint;",
            "   if (!db.data[collName]) db.data[collName] = [];",
            "   if (method === 'GET') { res.json({ success: true, data: db.data[collName] }); }",
            "   else if (method === 'POST') { const newEntry = { ...req.body, _id: Date.now().toString(36), createdAt: new Date().toISOString() }; db.data[collName].push(newEntry); saveDB(); res.json({ success: true, data: newEntry, message: 'Submission received!' }); }",
            "   else { res.status(405).json({ error: 'Method not allowed' }); }",
            "}",
            "app.all('/api/sites/:websiteId/:endpoint', (req, res) => { handleRequest(req, res, req.params.endpoint); });",
            "const PORT = process.env.PORT || 8080;",
            "app.listen(PORT, () => { console.log('Server running locally on port ' + PORT); console.log('Serving frontend at http://localhost:' + PORT); });"
        ].join('\n');

        archive.append(serverCode, { name: 'server.js' });

        const pkgJsonObj = {
            name: website.slug + '-docker',
            version: '1.0.0',
            main: 'server.js',
            scripts: { start: 'node server.js' },
            dependencies: { express: '^4.18.2', cors: '^2.8.5' }
        };
        archive.append(JSON.stringify(pkgJsonObj, null, 2), { name: 'package.json' });

        const dockerfile = [
            'FROM node:20-alpine',
            'WORKDIR /app',
            'COPY package*.json ./',
            'RUN npm install --production',
            'COPY . .',
            'EXPOSE 8080',
            'CMD ["npm", "start"]'
        ].join('\n');

        archive.append(dockerfile, { name: 'Dockerfile' });

        await archive.finalize();
    } catch (err) {
        console.error('Export error:', err);
        if (!res.headersSent) res.status(500).json({ error: 'Internal server error exporting site' });
    }
});

export default router;
