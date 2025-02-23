import '../styles/globals.css';

export default function Recommendations({ products }) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 p-6">
            {products.map((product, index) => (
                <div key={index} className="border rounded-lg p-4 bg-white shadow-md">
                    <h2 className="font-bold text-lg">{product.title}</h2>
                    <p className="text-gray-700">{product.category}</p>
                    <p className="text-sm text-gray-500">Skin Type: {product.skin_type.join(', ')}</p>
                </div>
            ))}
        </div>
    );
}

export async function getServerSideProps() {
    // Use mock data for now
    const mockProducts = [
        { title: "Fit Me Matte + Poreless Foundation", category: "Foundation", skin_type: ["Normal", "Oily"] },
        { title: "Double Wear Stay-in-Place Foundation", category: "Foundation", skin_type: ["Combination"] },
        { title: "SuperStay Matte Ink Liquid Lipstick", category: "Lipstick", skin_type: ["All"] },
        { title: "KVD Beauty Tattoo Liner", category: "Eyeliner", skin_type: ["All"] },
        { title: "NARS Radiant Creamy Concealer", category: "Concealer", skin_type: ["All"] },
    ];

    return { props: { products: mockProducts } };
}
