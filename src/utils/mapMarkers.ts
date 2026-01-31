// Generate a custom marker icon using the design system's primary color
export const getRestaurantMarkerIcon = (): google.maps.Icon => {
  const primaryColor = "#FF5600"; // From tailwind.config.ts
  
  // Create an SVG marker with the primary color
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
      <circle cx="16" cy="16" r="10" fill="${primaryColor}" stroke="white" stroke-width="2"/>
      <circle cx="16" cy="16" r="4" fill="white"/>
    </svg>
  `;
  
  const encodedSvg = encodeURIComponent(svg);
  
  return {
    url: `data:image/svg+xml;charset=UTF-8,${encodedSvg}`,
    scaledSize: new google.maps.Size(32, 32),
    anchor: new google.maps.Point(16, 16),
  };
};

export const getUserMarkerIcon = (): google.maps.Icon => {
  return {
    url: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
  };
};
