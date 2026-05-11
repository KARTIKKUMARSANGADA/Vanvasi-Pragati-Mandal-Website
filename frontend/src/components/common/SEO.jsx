import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEO = ({ title, description, image, url }) => {
  const siteName = "Vanvasi Pragati Mandal";
  const fullTitle = title ? `${title} | ${siteName}` : siteName;
  const defaultDesc = "Vanvasi Pragati Mandal Pipaliya is dedicated to tribal empowerment, education, and healthcare in rural Gujarat.";
  const fullDesc = description || defaultDesc;
  const siteUrl = "https://vanvasipragati.org"; // Replace with actual domain
  const fullUrl = url ? `${siteUrl}${url}` : siteUrl;
  const defaultImage = `${siteUrl}/og-image.png`; // Replace with actual OG image path
  const fullImage = image || defaultImage;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={fullDesc} />
      <link rel="canonical" href={fullUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={fullDesc} />
      <meta property="og:image" content={fullImage} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={fullUrl} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={fullDesc} />
      <meta name="twitter:image" content={fullImage} />
    </Helmet>
  );
};

export default SEO;
