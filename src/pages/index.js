import React, { useRef, useEffect } from "react";
import { Helmet } from "react-helmet";
import L from "leaflet";
import { Marker, useMap } from "react-leaflet";

import { promiseToFlyTo, getCurrentLocation } from "lib/map";

import Layout from "components/Layout";
import Container from "components/Container";
import Map from "components/Map";
import Snippet from "components/Snippet";
import { useTracker } from 'hooks';

import gatsby_astronaut from "assets/images/gatsby-astronaut.jpg";

const LOCATION = {
  lat: 0,
  lng: 0
};
const CENTER = [LOCATION.lat, LOCATION.lng];
const DEFAULT_ZOOM = 2;
const ZOOM = 10;

const timeToZoom = 2000;
const timeToOpenPopupAfterZoom = 4000;
const timeToUpdatePopupAfterZoom = timeToOpenPopupAfterZoom + 3000;

const popupContentHello = `<p>Hello 👋</p>`;
const popupContentGatsby = `
  <div class="popup-gatsby">
    <div class="popup-gatsby-image">
      <img class="gatsby-astronaut" src=${gatsby_astronaut} />
    </div>
    <div class="popup-gatsby-content">
      <h1>Gatsby Leaflet Starter</h1>
      <p>Welcome to your new Gatsby site. Now go build something great!</p>
    </div>
  </div>
`;

/**
 * MapEffect
 * @description This is an example of creating an effect used to zoom in and set a popup on load
 */

const MapEffect = ({ markerRef}) => {
  const map = useMap();

  const { data: stats = {} } = useTracker({
    api: 'all'
  });
  
  console.log("stats:",stats);

  const { data: countries = [] } = useTracker({
    api: 'countries'
  });

  console.log("data::", countries);

  const hasCountries = Array.isArray(countries) && countries.length > 0;

  useEffect(() => {
    if (!markerRef.current || !map) return;

    (async function run() {
      console.log("inside");
      
      if (!hasCountries) return;

      const geoJson = {
        type: "FeatureCollection",
        features: countries.map((country = {}) => {
          const { countryInfo = {} } = country;
          const { lat, long: lng } = countryInfo;
          return {
            type: "Feature",
            properties: {
              ...country
            },
            geometry: {
              type: "Point",
              coordinates: [lng, lat]
            }
          };
        })
      };

      console.log(geoJson);

      const geoJsonLayers = new L.GeoJSON(geoJson, {
        pointToLayer: (feature = {}, latlng) => {
          const { properties = {} } = feature;
          let updatedFormatted;
          let casesString;
      
          const {
            country,
            updated,
            cases,
            deaths,
            recovered
          } = properties
      
          casesString = `${cases}`;
      
          if ( cases > 1000 ) {
            casesString = `${casesString.slice(0, -3)}k+`
          }
      
          if ( updated ) {
            updatedFormatted = new Date(updated).toLocaleString();
          }
      
          const html = `
            <span class="icon-marker">
              <span class="icon-marker-tooltip">
                <h2>${country}</h2>
                <ul>
                  <li><strong>Confirmed:</strong> ${cases}</li>
                  <li><strong>Deaths:</strong> ${deaths}</li>
                  <li><strong>Recovered:</strong> ${recovered}</li>
                  <li><strong>Last Update:</strong> ${updatedFormatted}</li>
                </ul>
              </span>
              ${ casesString }
            </span>
          `;
      
          return L.marker( latlng, {
            icon: L.divIcon({
              className: 'icon',
              html
            }),
            riseOnHover: true
          });
        }
      });

      geoJsonLayers.addTo(map);
      

      // const popup = L.popup({
      //   maxWidth: 800,
      // });

      // const location = await getCurrentLocation().catch(() => LOCATION);

      // const { current: marker } = markerRef || {};

      // marker.setLatLng(location);
      // popup.setLatLng(location);
      // popup.setContent(                                                                                                                                                          popupContentHello);

      // setTimeout(async () => {
      //   await promiseToFlyTo(map, {
      //     zoom: ZOOM,
      //     center: location,
      //   });

      //   marker.bindPopup(popup);

      //   setTimeout(() => marker.openPopup(), timeToOpenPopupAfterZoom);
      //   setTimeout(
      //     () => marker.setPopupContent(popupContentGatsby),
      //     timeToUpdatePopupAfterZoom
      //   );
      // }, timeToZoom);
    })();
  }, [map, markerRef]);

  return null;
};

const IndexPage = () => {
  const markerRef = useRef();

  const mapSettings = {
    center: CENTER,
    defaultBaseMap: "OpenStreetMap",
    zoom: DEFAULT_ZOOM
  };

  return (
    <Layout pageName="home">
      <Helmet>
        <title>Home Page</title>
      </Helmet>

      <Map {...mapSettings}>
        <MapEffect markerRef={markerRef}/>
        <Marker ref={markerRef} position={CENTER} />
      </Map>

      <Container type="content" className="text-center home-start">
        <h2>Still Getting Started?</h2>
        <p>Run the following in your terminal!</p>
        <Snippet>
          gatsby new [directory]
          https://github.com/colbyfayock/gatsby-starter-leaflet
        </Snippet>
        <p className="note">
          Note: Gatsby CLI required globally for the above command
        </p>
      </Container>
    </Layout>
  );
};

export default IndexPage;
