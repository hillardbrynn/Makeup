import driver from '../../lib/neo4j'; // Adjust path if necessary

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Only GET requests allowed' });
    }

    console.log('Starting connection to Neo4j...');

    try {
        const session = driver.session();
        console.log('Session created.');

        let result;
        try {
            result = await session.readTransaction(async (tx) => {
                console.log('Executing query...');
                return tx.run(`
          MATCH (p:Page)
          RETURN p.url as url, p.title as title
        `);
            });
        } finally {
            await session.close();
            console.log('Session closed.');
        }

        console.log('Query executed successfully.');

        const pages = result.records.map((record) => ({
            url: record.get('url'),
            title: record.get('title'),
        }));

        return res.status(200).json({ pages });
    } catch (error) {
        console.error('Error connecting to Neo4j:', error);
        return res.status(500).json({
            message: 'Could not fetch pages',
            error: error.message,
        });
    }
}
