import React from 'react';
import '../styles/globals.css';

const teamMembers = [
  {
    name: 'Brynn Hillard',
    role: 'CTO, Co-Founder',
    imageUrl: 'https://media.licdn.com/dms/image/v2/D4E03AQETkTA9ZXrTUw/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1711731192744?e=1745452800&v=beta&t=SARrsZHi8gLGbxcld2zPcS1PtlNiyPRWJ3HGMgD7J8M',
    linkedInUrl: 'https://www.linkedin.com/in/brynn-hillard-85350418a/'
  },
  {
    name: 'Aerin Krebs',
    role: 'CTO, Co-Founder',
    imageUrl: 'https://media.licdn.com/dms/image/v2/D4E03AQG_RJsPzXwMDA/profile-displayphoto-shrink_100_100/B4EZRZG9FOHgAU-/0/1736661783617?e=1745452800&v=beta&t=T0qRcPZPXEeKIAUC8lIVHkOqJ3NeSoNXBb-o6Cl6euo',
    linkedInUrl: 'https://www.linkedin.com/in/aerin-krebs/'
  },
  {
    name: 'Raagul Sundaralingam',
    role: 'CTO, Co-Founder',
    imageUrl: 'https://media.licdn.com/dms/image/v2/D5603AQHIDzU9hcxUfA/profile-displayphoto-shrink_100_100/profile-displayphoto-shrink_100_100/0/1683294431381?e=1745452800&v=beta&t=W4D9UgOO2OhDcW5bV-aH0qMc5EE-mdNG15uyGE-Sn-o',
    linkedInUrl: 'https://www.linkedin.com/in/raagul-sundar/'
  },
  {
    name: 'Pranav Chati',
    role: 'CTO, Co-Founder',
    imageUrl: 'https://media.licdn.com/dms/image/v2/D5603AQH8U-kpNoh3tw/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1695836385829?e=1746057600&v=beta&t=-m6dfUEg_uX08Hj8tIh0--4GZNT7cFYjel5hxvpq8uU',
    linkedInUrl: 'https://www.linkedin.com/in/pranavchati/'
  }
];

export default function About() {
  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Hero Section */}
      <section className="relative h-[60vh] flex items-center justify-center overflow-hidden bg-gradient-to-b from-rose-100 to-neutral-50">
        <div className="relative z-10 text-center max-w-3xl mx-auto px-6">
          <h1 className="text-5xl font-serif font-bold text-black mb-6">
            Meet The Team
          </h1>
          <p className="text-lg text-neutral-700">
            The passionate people behind Acquired Beauty, bringing you the best in beauty recommendations.
          </p>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {teamMembers.map((member) => (
              <a
                key={member.name}
                href={member.linkedInUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-center p-4 rounded-lg bg-neutral-50 shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer"
              >
                <img
                  src={member.imageUrl}
                  alt={member.name}
                  className="w-24 h-24 object-cover rounded-full mx-auto mb-4 border-4 border-rose-500"
                />
                <h2 className="text-lg font-serif font-bold">{member.name}</h2>
                <p className="text-rose-500 font-medium">{member.role}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-24 bg-gradient-to-r from-rose-100 to-neutral-100 animate-fade-in">
        <div className="max-w-4xl mx-auto text-center px-6">
          <h2 className="text-4xl font-serif font-bold mb-6">Our Story</h2>
          <p className="text-lg text-neutral-700 leading-relaxed mb-6">
            We are a team of beauty enthusiasts dedicated to helping you find the perfect makeup products. Our journey started with a shared passion for cosmetics and a desire to simplify the beauty shopping experience.
          </p>
          <p className="text-lg text-neutral-700 leading-relaxed mb-6">
            Overwhelmed by the vast number of beauty products, we created Acquired Beauty to provide <strong>personalized, science-backed recommendations</strong> so you can discover products that truly work for you.
          </p>
          <p className="text-lg text-neutral-700 leading-relaxed">
            Our goal is to empower you with expert guidance, premium product selections, and ongoing support to make your beauty routine effortless and enjoyable.
          </p>
        </div>
      </section>
    </div>
  );
}
