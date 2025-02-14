//import { getUserEmbedding } from '../../lib/embedding'; // Generate vector from quiz answers

export default async function handler(req, res) {
    if (req.method === 'POST') {
        try {
            const answers = req.body;
            const userEmbedding = await getUserEmbedding(answers);

            // Save the embedding or use it to query similar products
            res.status(200).json({ message: 'User embedding generated', embedding: userEmbedding });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to process quiz' });
        }
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
}
