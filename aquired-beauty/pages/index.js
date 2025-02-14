import React from "react";
import Link from "next/link";

export default function Home() {
    return (
        <div className="min-h-screen bg-background text-foreground">
            <header className="w-full p-6 bg-primary text-white">
                <h1 className="text-3xl font-bold">Welcome to Makeup Finder</h1>
                <p className="mt-2 text-lg">Discover personalized recommendations tailored to you.</p>
            </header>

            <main className="flex flex-col items-center justify-center py-16 space-y-12">
                <section className="w-11/12 max-w-3xl bg-white rounded-lg shadow-md p-8 text-center">
                    <h2 className="text-2xl font-bold">Take the Makeup Quiz</h2>
                    <p className="mt-4 text-gray-600">
                        Answer a few questions about your skin type, preferences, and style to get personalized product recommendations.
                    </p>
                    <Link href="/quiz">
                        <button className="mt-6 px-6 py-3 bg-secondary text-white rounded-lg hover:bg-orange-600 transition-all">
                            Start the Quiz
                        </button>
                    </Link>
                </section>

                <section className="w-11/12 max-w-3xl">
                    <h2 className="text-xl font-semibold">Why Personalized Makeup?</h2>
                    <p className="mt-2 text-gray-700">
                        Finding the right makeup products can be overwhelming. With our personalized quiz, you’ll discover products that match
                        your unique style and needs—whether it’s foundation for dry skin or the perfect lipstick shade for your next event.
                    </p>
                </section>

                <section className="w-11/12 max-w-3xl">
                    <h2 className="text-xl font-semibold">Our Recommendations</h2>
                    <p className="mt-2 text-gray-700">
                        Our recommendations are powered by cutting-edge technology and real product data. Check out the latest makeup trends
                        and discover your new favorites.
                    </p>
                </section>
            </main>

            <footer className="w-full p-6 bg-gray-800 text-white text-center">
                <p>&copy; 2025 Makeup Finder. All rights reserved.</p>
            </footer>
        </div>
    );
}
