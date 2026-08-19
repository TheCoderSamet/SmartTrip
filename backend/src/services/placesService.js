const searchNearbyPlaces = async ({
  latitude,
  longitude,
  type,
  radius = 3000,
}) => {
  const apiKey = process.env.GOOGLE_API_KEY;

  if (!apiKey) {
    throw new Error("Google API key is not configured");
  }

  const response = await fetch(
    "https://places.googleapis.com/v1/places:searchNearby",
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask":
          "places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.types",
      },

      body: JSON.stringify({
        includedTypes: [type],

        maxResultCount: 10,

        locationRestriction: {
          circle: {
            center: {
              latitude,
              longitude,
            },
            radius,
          },
        },
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.error?.message || "Google Places API request failed"
    );
  }

  return data.places || [];
};

module.exports = {
  searchNearbyPlaces,
};