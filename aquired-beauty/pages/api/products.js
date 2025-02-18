import db from '../../lib/db'; // Your database connection
import { getEmbedding } from '../../lib/embedding'; // For generating vector embeddings

export default async function handler(req, res) {
    if (req.method === 'POST') {
        try {
            const { title, ingredients, skin_type, texture, category } = req.body;
            const embedding = await getEmbedding(title + ingredients.join(', '));

            const product = {
                title,
                ingredients,
                skin_type,
                texture,
                category,
                embedding,
            };

            await db.collection('products').insertOne(product);

            res.status(200).json({ message: 'Product added successfully', product });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to add product' });
        }
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
}
