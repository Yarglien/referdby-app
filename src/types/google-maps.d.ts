// Google Maps global callback for authentication failures
declare global {
  interface Window {
    gm_authFailure?: () => void;
  }
}

// Extended types for the new Places API (not yet in @types/google.maps)
declare namespace google.maps.places {
  interface AutocompleteSessionToken {
    constructor(): AutocompleteSessionToken;
  }

  interface PlacePrediction {
    placeId: string;
    text: { text: string };
    mainText?: { text: string };
    secondaryText?: { text: string };
    types?: string[];
    toPlace(): Place;
  }

  interface AutocompleteSuggestionResponse {
    placePrediction?: PlacePrediction;
  }

  interface FetchAutocompleteSuggestionsResult {
    suggestions: AutocompleteSuggestionResponse[];
  }

  interface AutocompleteRequestInput {
    input: string;
    includedPrimaryTypes?: string[];
    sessionToken?: AutocompleteSessionToken;
    locationBias?: {
      center: { lat: number; lng: number };
      radius: number;
    };
    locationRestriction?: {
      west: number;
      north: number;
      east: number;
      south: number;
    };
    origin?: { lat: number; lng: number };
    language?: string;
    region?: string;
  }

  interface AutocompleteSuggestion {
    fetchAutocompleteSuggestions(
      request: AutocompleteRequestInput
    ): Promise<FetchAutocompleteSuggestionsResult>;
  }
}

export {};
