const computeGoogleRoute = async ({
  origin,
  destination,
  intermediates = [],
  travelMode = "WALK",
}) => {
  const apiKey = process.env.GOOGLE_API_KEY;

  if (!apiKey) {
    throw new Error("Google API key is not configured");
  }

  const requestBody = {
    origin: {
      location: {
        latLng: {
          latitude: origin.latitude,
          longitude: origin.longitude,
        },
      },
    },

    destination: {
      location: {
        latLng: {
          latitude: destination.latitude,
          longitude: destination.longitude,
        },
      },
    },

    travelMode,
  };

  if (intermediates.length > 0) {
    requestBody.intermediates = intermediates.map((place) => ({
      location: {
        latLng: {
          latitude: place.latitude,
          longitude: place.longitude,
        },
      },
    }));
  }

  const response = await fetch(
    "https://routes.googleapis.com/directions/v2:computeRoutes",
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask":
          "routes.distanceMeters,routes.duration,routes.polyline.encodedPolyline",
      },

      body: JSON.stringify(requestBody),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.error?.message ||
        "Google Routes API request failed"
    );
  }

  if (!data.routes || data.routes.length === 0) {
    throw new Error(
      "No route returned by Google Routes API"
    );
  }

  return data.routes[0];
};

module.exports = {
  computeGoogleRoute,
};