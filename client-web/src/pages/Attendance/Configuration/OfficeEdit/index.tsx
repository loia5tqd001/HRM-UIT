import ProForm from '@ant-design/pro-form';
import { PageContainer } from '@ant-design/pro-layout';
import { Card, Checkbox, Col, Form, Row, Select } from 'antd';
import GoogleMapReact from 'google-map-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import GooglePlacesAutocomplete, {
  geocodeByLatLng,
  geocodeByPlaceId,
  getLatLng,
} from 'react-google-places-autocomplete';
import { useParams } from 'umi';

const googleApiKey = 'AIzaSyA7EpBEIp80TiSD15D85_Kra8TLtbdsr1c';

export const OfficeEdit: React.FC = () => {
  const { id } = useParams<any>();
  const [accurateAddress, setAccurateAddress] = useState<{ label: string; value: any }>();
  const [center, setCenter] = useState<google.maps.LatLngLiteral>();
  const mapRef = useRef<google.maps.Map>();
  const markerRef = useRef<google.maps.Marker>();
  const circleRef = useRef<google.maps.Circle>();
  const [radius, setRadius] = useState<10 | 25 | 50 | 100 | 200 | 500>(100);

  // how to add and remove marker google-map: https://developers.google.com/maps/documentation/javascript/examples/marker-remove
  const setMarker = useCallback(
    (coord: google.maps.LatLngLiteral) => {
      if (!mapRef.current) return;
      markerRef.current?.setMap(null); // remove old marker
      circleRef.current?.setMap(null); // remove old circle
      const map = mapRef.current;
      // add new marker
      markerRef.current = new google.maps.Marker({
        position: coord,
        map,
        title: accurateAddress?.label,
      });
      // add new circle
      circleRef.current = new google.maps.Circle({
        strokeColor: '#FF0000',
        strokeOpacity: 0.35,
        strokeWeight: 2,
        fillColor: '#FF0000',
        fillOpacity: 0.35,
        map,
        center: coord,
        radius,
      });
    },
    [mapRef, accurateAddress, radius],
  );

  useEffect(() => {
    const map = mapRef.current;
    circleRef.current?.setMap(null);
    circleRef.current = new google.maps.Circle({
      strokeColor: '#FF0000',
      strokeOpacity: 0.35,
      strokeWeight: 2,
      fillColor: '#FF0000',
      fillOpacity: 0.35,
      map,
      center: markerRef.current?.getPosition()?.toJSON(),
      radius,
    });
  }, [radius]);

  // const serRadius = useCallback((radius: number) => {
  //   setRadius(radius);
  //   const map = mapRef.current;
  //   circleRef.current?.setMap(null);
  //   circleRef.current = new google.maps.Circle({
  //     strokeColor: '#FF0000',
  //     strokeOpacity: 0.35,
  //     strokeWeight: 2,
  //     fillColor: '#FF0000',
  //     fillOpacity: 0.35,
  //     map,
  //     center: markerRef.current?.getPosition()?.toJSON(),
  //     radius,
  //   });
  // }, []);

  // function success(position: any) {
  //   const { latitude, longitude } = position.coords;
  //   setCenter({
  //     lat: latitude,
  //     lng: longitude,
  //   });
  // }

  // if (navigator.geolocation) {
  //   navigator.geolocation.getCurrentPosition(success);
  // }

  return (
    <PageContainer title={false}>
      <Card style={{ height: '100%' }}>
        <ProForm>
          <Form.Item name="allow_outside">
            <Checkbox>Allow clock in/out outside the office</Checkbox>
          </Form.Item>
          <Row gutter={12}>
            <Col span="16">
              <Form.Item label="Accurate address">
                <GooglePlacesAutocomplete
                  apiKey={googleApiKey}
                  selectProps={{
                    value: accurateAddress,
                    onChange: (newValue: any) => {
                      setAccurateAddress(newValue);
                      geocodeByPlaceId(newValue.value.place_id)
                        .then((results) => getLatLng(results[0]))
                        .then(({ lat, lng }) => {
                          setCenter({ lat, lng });
                          setMarker({ lat, lng });
                        });
                    },
                    placeholder: 'Search for address...',
                    styles: {
                      control: (provided: any, state: any) => ({
                        ...provided,
                        background: '#fff',
                        border: '1px solid #d9d9d9',
                        minHeight: '32px',
                        height: '32px',
                        boxShadow: state.isFocused ? null : null,
                        borderRadius: 2,
                      }),
                      valueContainer: (provided: any) => ({
                        ...provided,
                        height: '32px',
                        padding: '0 6px',
                      }),

                      input: (provided: any) => ({
                        ...provided,
                        margin: '0px',
                      }),
                      indicatorSeparator: () => ({
                        display: 'none',
                      }),
                      indicatorsContainer: (provided: any) => ({
                        ...provided,
                        height: '32px',
                      }),
                    },
                  }}
                />
              </Form.Item>
            </Col>
            <Col span="4">
              <Form.Item name="radius" label="Radius" initialValue={radius}>
                <Select
                  value={radius}
                  options={[10, 25, 50, 100, 200, 500].map((it) => ({
                    value: it,
                    label: `${it} (meters)`,
                  }))}
                  onChange={(value: any) => setRadius(value)}
                />
              </Form.Item>
            </Col>
          </Row>
          <div
            style={{
              height: '100vh',
              width: '100%',
              maxWidth: '70vw',
              maxHeight: '80vh',
              marginBottom: 10,
            }}
          >
            <GoogleMapReact
              bootstrapURLKeys={{ key: googleApiKey }}
              defaultCenter={{ lat: 10.869791956191703, lng: 106.8039046571532 }}
              center={center}
              defaultZoom={17}
              // How to enable satellite: https://github.com/google-map-react/google-map-react/issues/585#issuecomment-391702767
              options={(maps) => {
                return {
                  streetViewControl: false,
                  scaleControl: true,
                  fullscreenControl: false,
                  styles: [
                    {
                      featureType: 'poi.business',
                      elementType: 'labels',
                      stylers: [
                        {
                          visibility: 'off',
                        },
                      ],
                    },
                  ],
                  gestureHandling: 'greedy',
                  disableDoubleClickZoom: true,
                  minZoom: 11,
                  maxZoom: 18,
                  mapTypeControl: true,
                  // mapTypeId: maps.MapTypeId.HYBRID, // do not init mapTypeId, otherwise onClick will fuck it up
                  mapTypeControlOptions: {
                    style: maps.MapTypeControlStyle.HORIZONTAL_BAR,
                    position: maps.ControlPosition.TOP_CENTER,
                    mapTypeIds: [
                      maps.MapTypeId.HYBRID,
                      maps.MapTypeId.ROADMAP,
                      maps.MapTypeId.SATELLITE,
                    ],
                  },
                  zoomControl: true,
                  clickableIcons: true,
                };
              }}
              onClick={({ lat, lng }) => {
                setMarker({ lat, lng });
                geocodeByLatLng({ lat, lng }).then((results) => {
                  setAccurateAddress({
                    label: results[0].formatted_address,
                    value: results[0],
                  });
                });
              }}
              yesIWantToUseGoogleMapApiInternals
              onGoogleApiLoaded={({ map }) => {
                mapRef.current = map;
              }}
            />
          </div>
        </ProForm>
      </Card>
    </PageContainer>
  );
};

export default OfficeEdit;
