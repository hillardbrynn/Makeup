require('dotenv').config();  // Add this line at the top
const neo4j = require('neo4j-driver');

const driver = neo4j.driver(
    process.env.NEO4J_URI,
    neo4j.auth.basic(process.env.NEO4J_USER, process.env.NEO4J_PASSWORD)
);

async function testConnection() {
    const session = driver.session();
    try {
        const result = await session.run('RETURN 1 AS number');
        console.log('Neo4j connection successful:', result.records[0].get('number'));
    } catch (error) {
        console.error('Neo4j connection failed:', error.message);
    } finally {
        await session.close();
        await driver.close();
    }
}

testConnection();
