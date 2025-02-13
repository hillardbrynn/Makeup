// pages/api/pages.js

import driver from '../../lib/neo4j';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Only GET requests allowed' });
    }

    try {
        const session = driver.session();

        let result;
        try {
            result = await session.readTransaction(async (tx) => {
                return tx.run(`
          MATCH (p:Page)
          RETURN p.url as url, p.title as title
        `);
            });
        } finally {
            await session.close();
        }

        // result.records is an array of Neo4j records
        const pages = result.records.map((record) => {
            return {
                url: record.get('url'),
                title: record.get('title'),
            };
        });

        return res.status(200).json({ pages });
    } catch (error) {
        console.error(error);
        return res
            .status(500)
            .json({ message: 'Could not fetch pages', error: error.message });
    }
}
