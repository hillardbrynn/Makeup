import { useState } from 'react';

export default function Quiz() {
    const [answers, setAnswers] = useState({
        skinType: '',
        hairColor: '',
        preferredShades: '',
        coverage: '',
        productTypes: [],
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setAnswers({ ...answers, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const response = await fetch('/api/quiz', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(answers),
        });

        const result = await response.json();
        console.log('User embedding:', result.embedding);
    };

    return (
        <div className="max-w-lg mx-auto p-6">
            <h1 className="text-2xl font-bold mb-4">Makeup Markup Quiz</h1>
            <form onSubmit={handleSubmit}>
                <label className="block mb-2">
                    Skin Type:
                    <select name="skinType" onChange={handleChange} className="w-full border rounded p-2">
                        <option value="Dry">Dry</option>
                        <option value="Oily">Oily</option>
                        <option value="Combination">Combination</option>
                        <option value="Normal">Normal</option>
                    </select>
                </label>
                <label className="block mb-2">
                    Hair Color:
                    <input
                        type="text"
                        name="hairColor"
                        onChange={handleChange}
                        className="w-full border rounded p-2"
                    />
                </label>
                <label className="block mb-2">
                    Preferred Shades:
                    <input
                        type="text"
                        name="preferredShades"
                        onChange={handleChange}
                        className="w-full border rounded p-2"
                    />
                </label>
                <label className="block mb-2">
                    Coverage:
                    <select name="coverage" onChange={handleChange} className="w-full border rounded p-2">
                        <option value="Light">Light</option>
                        <option value="Medium">Medium</option>
                        <option value="Full">Full</option>
                    </select>
                </label>
                <button type="submit" className="mt-4 bg-blue-500 text-white px-4 py-2 rounded">
                    Submit
                </button>
            </form>
        </div>
    );
}
