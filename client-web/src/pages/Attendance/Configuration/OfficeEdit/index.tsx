import ProForm, { ProFormSelect, ProFormText } from '@ant-design/pro-form';
import { PageContainer } from '@ant-design/pro-layout';
import { Card, Checkbox, Col, Form, Row, Space } from 'antd';
import React from 'react';
import { useParams } from 'umi';
import GoogleMapReact from 'google-map-react';
import GooglePlacesAutocomplete from 'react-google-places-autocomplete';

const AnyReactComponent = ({ text }) => <div>{text}</div>;

export const OfficeEdit: React.FC = () => {
  const { id } = useParams<any>();

  return (
    <PageContainer title="Edit office">
      <Card style={{ height: '100%' }}>
        <ProForm>
          <Form.Item name="allow_outside">
            <Checkbox>Allow clock in/out outside the office</Checkbox>
          </Form.Item>
          <Row gutter={12}>
            <Col span="16">
              {/* <ProFormText name="accurate_address" label="Accurate address" /> */}
              <GooglePlacesAutocomplete apiKey="AIzaSyCJqpC7oo-YYJJ1pRVZJgf84qExlHZCWSc" />
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
              maxWidth: 1330,
              maxHeight: '80vh',
              marginBottom: 10,
            }}
          >
            <GoogleMapReact
              bootstrapURLKeys={{ key: 'AIzaSyA7EpBEIp80TiSD15D85_Kra8TLtbdsr1c' }}
              defaultCenter={{
                lat: 59.95,
                lng: 30.33,
              }}
              defaultZoom={11}
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
                  mapTypeId: maps.MapTypeId.SATELLITE,
                  mapTypeControlOptions: {
                    style: maps.MapTypeControlStyle.HORIZONTAL_BAR,
                    position: maps.ControlPosition.BOTTOM_CENTER,
                    mapTypeIds: [
                      maps.MapTypeId.ROADMAP,
                      maps.MapTypeId.SATELLITE,
                      maps.MapTypeId.HYBRID,
                    ],
                  },

                  zoomControl: true,
                  clickableIcons: false,
                };
              }}
            >
              <AnyReactComponent
                // lat={59.955413}
                // lng={30.337844}
                text="My Marker"
              />
            </GoogleMapReact>
          </div>
        </ProForm>
      </Card>
    </PageContainer>
  );
};

export default OfficeEdit;
