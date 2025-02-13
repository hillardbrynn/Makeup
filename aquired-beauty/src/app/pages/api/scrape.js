// pages/api/scrape.js

import axios from 'axios';
import cheerio from 'cheerio';
import driver from '../../lib/neo4j';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Only POST requests allowed' });
    }

    const { url } = req.body;

    if (!url) {
        return res.status(400).json({ message: 'URL is required in request body' });
    }

    try {
        // 1. Fetch the webpage HTML
        const response = await axios.get(url);
        const html = response.data;

        // 2. Load HTML into cheerio
        const $ = cheerio.load(html);

        // 3. Extract the title (as an example)
        const pageTitle = $('title').text() || 'No Title Found';

        // 4. Insert/merge into Neo4j
        const session = driver.session();
        try {
            await session.writeTransaction(async (tx) => {
                await tx.run(
                    `
          MERGE (p:Page { url: $url })
          SET p.title = $pageTitle
          RETURN p
          `,
                    { url, pageTitle }
                );
            });
        } finally {
            await session.close();
        }

        return res.status(200).json({
            message: 'Scraping successful',
            data: { url, pageTitle },
        });
    } catch (error) {
        console.error(error);
        return res
            .status(500)
            .json({ message: 'Something went wrong', error: error.message });
    }
}
