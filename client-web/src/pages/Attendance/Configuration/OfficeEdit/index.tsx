import { readLocation, updateLocation } from '@/services/admin.organization.location';
import { SaveOutlined } from '@ant-design/icons';
import ProForm from '@ant-design/pro-form';
import { PageContainer } from '@ant-design/pro-layout';
import { Button, Card, Checkbox, Col, Form, message, Row, Select } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import GoogleMapReact from 'google-map-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import GooglePlacesAutocomplete, {
  geocodeByLatLng,
  geocodeByPlaceId,
  getLatLng,
} from 'react-google-places-autocomplete';
import { Access, useParams, useAccess, useIntl } from 'umi';

const googleApiKey = 'AIzaSyA7EpBEIp80TiSD15D85_Kra8TLtbdsr1c';

export const OfficeEdit: React.FC = () => {
  const { id } = useParams<any>();
  const [form] = useForm();
  const [office, setOffice] = useState<API.Location>();
  const [officeReady, setOfficeReady] = useState(false);
  const [officeInit, setOfficeInit] = useState(false);
  const [accurateAddress, setAccurateAddress] = useState<{ label: string; value: any }>();
  const [center, setCenter] = useState<google.maps.LatLngLiteral>();
  const [mapRef, setMapRef] = useState<google.maps.Map>();
  // const mapRef = useRef<google.maps.Map>();
  const markerRef = useRef<google.maps.Marker>();
  const circleRef = useRef<google.maps.Circle>();
  const access = useAccess();
  const intl = useIntl();

  useEffect(() => {
    setOfficeReady(false);
    readLocation(id)
      .then((fetchData) => setOffice(fetchData))
      .finally(() => setOfficeReady(true));
  }, [id]);

  const setCircle = useCallback(
    (radius: 10 | 25 | 50 | 100 | 200 | 500 = form.getFieldValue('radius')) => {
      if (!mapRef) return;
      circleRef.current?.setMap(null); // remove old circle
      circleRef.current = new google.maps.Circle({
        strokeColor: '#FF0000',
        strokeOpacity: 0.35,
        strokeWeight: 2,
        fillColor: '#FF0000',
        fillOpacity: 0.35,
        map: mapRef,
        center: markerRef.current?.getPosition()?.toJSON(),
        radius,
      });
    },
    [form, mapRef],
  );

  // how to add and remove marker google-map: https://developers.google.com/maps/documentation/javascript/examples/marker-remove
  const setMarker = useCallback(
    (coord: google.maps.LatLngLiteral) => {
      if (!mapRef) return;
      markerRef.current?.setMap(null); // remove old marker
      // add new marker
      markerRef.current = new google.maps.Marker({
        position: coord,
        map: mapRef,
        title: accurateAddress?.label,
      });
      setCircle();
    },
    [mapRef, accurateAddress, setCircle],
  );

  useEffect(() => {
    form.setFieldsValue({
      accurate_address: accurateAddress?.label,
    });
  }, [accurateAddress, form]);

  useEffect(() => {
    if (officeInit || !office || !mapRef) return undefined;
    const { lat, lng } = office;
    setCenter({ lat, lng });
    setAccurateAddress({
      label: office.accurate_address,
      value: {
        place_id: office.note,
      },
    });
    setMarker({ lat, lng });
    setCircle(office.radius as any);
    setOfficeInit(true);

    // Add an additional Marker in the manager's location on the Map
    let currentLocation: google.maps.Marker | null;
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
        currentLocation = new google.maps.Marker({
          position: { lat: latitude, lng: longitude },
          map: mapRef,
          title: 'Current location',
        });
      });
    }
    return () => {
      currentLocation = null;
    };
  }, [office, setMarker, officeInit, setCircle, mapRef]);

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
      <Card
        style={{ height: '100%' }}
        title={office?.name}
        loading={!officeReady}
        className="card-shadow"
        extra={
          <Access accessible={access['change_location']}>
            <Button
              type="primary"
              onClick={async () => {
                if (!markerRef.current?.getPosition()) return;
                try {
                  const record = {
                    ...office,
                    ...form.getFieldsValue(),
                    lat: markerRef.current?.getPosition()?.toJSON().lat,
                    lng: markerRef.current?.getPosition()?.toJSON().lng,
                    note: accurateAddress?.value.place_id,
                    enable_geofencing: true,
                  };
                  await updateLocation(record.id!, record);
                  message.success(
                    intl.formatMessage({
                      id: 'error.updateSuccessfully',
                      defaultMessage: 'Update successfully!',
                    }),
                  );
                } catch {
                  message.error(
                    intl.formatMessage({
                      id: 'error.updateUnsuccessfully',
                      defaultMessage: 'Update unsuccessfully!',
                    }),
                  );
                }
              }}
            >
              <SaveOutlined /> {intl.formatMessage({ id: 'component.button.save' })}
            </Button>
          </Access>
        }
      >
        <ProForm form={form} initialValues={office} submitter={false}>
          <Form.Item name="allow_outside" valuePropName="checked">
            <Checkbox>{intl.formatMessage({ id: 'property.allow_outside' })}</Checkbox>
          </Form.Item>
          <Row gutter={12} style={{ marginTop: -16 }}>
            <Col span="16">
              <Form.Item
                name="accurate_address"
                label={intl.formatMessage({ id: 'property.accurate_address' })}
                rules={[{ required: true }]}
              >
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
                        borderRadius: 5,
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
              <Form.Item
                name="radius"
                label={intl.formatMessage({ id: 'property.radius' })}
                rules={[{ required: true }]}
              >
                <Select
                  options={[10, 25, 50, 100, 200, 500].map((it) => ({
                    value: it,
                    label: `${it} (${intl.formatMessage({ id: 'property.office.meters' })})`,
                  }))}
                  onChange={(value: any) => setCircle(value)}
                />
              </Form.Item>
            </Col>
          </Row>
          <div
            style={{
              height: '500px',
              width: '100%',
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
                    // value: results[0],
                    value: {
                      place_id: results[0].place_id,
                    },
                  });
                });
              }}
              yesIWantToUseGoogleMapApiInternals
              onGoogleApiLoaded={({ map }) => {
                setMapRef(map);
              }}
            />
          </div>
        </ProForm>
      </Card>
    </PageContainer>
  );
};

export default OfficeEdit;
