import ProForm, { ProFormSelect, ProFormText } from '@ant-design/pro-form';
import { PageContainer } from '@ant-design/pro-layout';
import { Card, Checkbox, Col, Form, Row, Space } from 'antd';
import React, { useState } from 'react';
import { useParams } from 'umi';
import GoogleMapReact from 'google-map-react';
import GooglePlacesAutocomplete, {
  geocodeByAddress,
  geocodeByPlaceId,
  getLatLng,
} from 'react-google-places-autocomplete';
import { EnvironmentOutlined } from '@ant-design/icons';

const AnyReactComponent = () => {
  return (
    <div style={{ width: 300, height: '100%' }}>
      <img
        alt=""
        src="https://maps.gstatic.com/mapfiles/transparent.png"
        draggable="false"
        // usemap="#gmimap0"
        style={{
          width: '27px',
          height: '43px',
          userSelect: 'none',
          border: '0px',
          padding: '0px',
          margin: '0px',
          maxWidth: 'none',
        }}
      />sdfd
    </div>
  );
  // <EnvironmentOutlined
  //   style={{ color: 'red', fontSize: 30, transform: 'translate(-50%, -50%)' }}
  // />;
};

const googleApiKey = 'AIzaSyA7EpBEIp80TiSD15D85_Kra8TLtbdsr1c';

export const OfficeEdit: React.FC = () => {
  const { id } = useParams<any>();
  const [value, setValue] = useState<any>(null);
  const [center, setCenter] = useState<any>(null);
  const [marker, setMarker] = useState<any>(null);

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
                    value,
                    onChange: async (value) => {
                      geocodeByPlaceId(value.value.place_id)
                        .then((results) => getLatLng(results[0]))
                        .then(({ lat, lng }) => {
                          const pos = { lat, lng };
                          setCenter(pos);
                          setMarker(pos);
                        })
                        .catch((error) => console.error(error));
                    },
                    placeholder: 'Search for address...',
                    styles: {
                      control: (provided: any, state: any) => ({
                        ...provided,
                        background: '#fff',
                        // borderColor: '#9e9e9e',
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
              <ProFormSelect
                name="radius"
                label="Radius"
                options={[10, 25, 50, 100, 200, 500].map((it) => ({
                  value: it,
                  label: `${it} (meters)`,
                }))}
              />
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
                  mapTypeId: maps.MapTypeId.HYBRID,
                  mapTypeControlOptions: {
                    style: maps.MapTypeControlStyle.HORIZONTAL_BAR,
                    position: maps.ControlPosition.BOTTOM_CENTER,
                    mapTypeIds: [
                      maps.MapTypeId.ROADMAP,
                      // maps.MapTypeId.SATELLITE,
                      maps.MapTypeId.HYBRID,
                    ],
                  },
                  zoomControl: true,
                  clickableIcons: true,
                };
              }}
              onClick={({ lat, lng }) => setMarker({ lat, lng })}
              // onChildClick={() => console.log('childclick')}
              // yesIWantToUseGoogleMapApiInternals
              // onGoogleApiLoaded={({ map, maps }) => {
              //   console.log(map, maps);

              // }}
            >
              <AnyReactComponent {...marker} />
            </GoogleMapReact>
          </div>
        </ProForm>
      </Card>
    </PageContainer>
  );
};

export default OfficeEdit;
