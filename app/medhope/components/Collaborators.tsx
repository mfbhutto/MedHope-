'use client';

import Image from 'next/image';

const collaborators = [
  {
    name: 'Medicine Collaborator',
    logo: '/logo_green.png',
    type: 'medicine',
  },
  {
    name: 'Lab Test Collaborator',
    logo: '/dr-issa-logo.png',
    type: 'lab',
  },
];

export default function Collaborators() {
  // Duplicate the array for seamless infinite scroll
  const duplicatedCollaborators = [...collaborators, ...collaborators];

  return (
    <section className="py-8 bg-white border-y border-gray-200 overflow-hidden">
      <div className="section-container">
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-xl md:text-2xl font-bold text-gray-800 uppercase tracking-wide">
            Our Collaborators
          </h2>
        </div>

        {/* Scrolling Container */}
        <div className="relative overflow-hidden">
          {/* Gradient Overlays */}
          <div className="absolute left-0 top-0 bottom-0 w-20 md:w-32 bg-gradient-to-r from-white via-white to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-20 md:w-32 bg-gradient-to-l from-white via-white to-transparent z-10 pointer-events-none" />

          {/* Scrolling Content */}
          <div className="flex animate-scroll">
            {duplicatedCollaborators.map((collaborator, index) => (
              <div
                key={`${collaborator.name}-${index}`}
                className="flex-shrink-0 mx-8 md:mx-12 px-6 md:px-8"
              >
                <div className="relative w-48 h-32 md:w-64 md:h-40 opacity-70 hover:opacity-100 transition-opacity duration-300">
                  <Image
                    src={collaborator.logo}
                    alt={collaborator.name}
                    fill
                    className="object-contain"
                    sizes="(max-width: 768px) 200px, 250px"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

