import React from 'react';

export default function JsonLd() {
    const personJsonLd = {
        "@context": "https://schema.org",
        "@type": "Person",
        "name": "Francesco Mollica",
        "jobTitle": "Full Stack Engineer",
        "url": "https://francisomollica.it",
        "sameAs": [
            "https://github.com/francimolli",
            "https://instagram.com/francimolli",
            // "https://www.linkedin.com/in/francescomollica/" // Add if available
        ],
        "description": "Full Stack Engineer and Digital Architect specializing in Next.js, Three.js, and high-performance web applications.",
        "knowsAbout": [
            "Web Development",
            "Next.js",
            "React",
            "Three.js",
            "Cybersecurity",
            "Architect Engineer",
            "Go",
            "C++"
        ]
    };

    const websiteJsonLd = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "Francesco Mollica Portfolio",
        "url": "https://francismollica.it",
        "author": {
            "@type": "Person",
            "name": "Francesco Mollica"
        }
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
            />
        </>
    );
}
