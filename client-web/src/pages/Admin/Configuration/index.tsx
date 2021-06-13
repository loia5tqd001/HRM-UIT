import { getAppConfig, updateAppConfig } from '@/services/appConfig';
import ProForm, { ProFormDigit, ProFormSelect, ProFormSwitch } from '@ant-design/pro-form';
import { PageContainer } from '@ant-design/pro-layout';
import { Card, message } from 'antd';
import { range } from 'lodash';
import React, { useEffect, useState } from 'react';
import { useAccess, useIntl } from 'umi';

export const Office: React.FC = () => {
  const [config, setConfig] = useState<API.AppConfig>();
  const [appConfigReady, setAppConfigReady] = useState(false);
  const access = useAccess();
  const intl = useIntl();

  useEffect(() => {
    getAppConfig()
      .then((fetchData) => setConfig(fetchData))
      .finally(() => setAppConfigReady(true));
  }, []);

  return (
    <PageContainer title={false}>
      <Card loading={!appConfigReady} className="card-shadow" title="Configuration">
        <ProForm<API.AppConfig>
          onFinish={async (values) => {
            try {
              await updateAppConfig({ ...config, ...values });
              message.success('Update succesffully');
            } catch {
              message.error('Update unsuccesffully');
            }
          }}
          submitter={access['change_applicationconfig'] ? undefined : false}
          initialValues={config}
        >
          <ProForm.Group>
            <ProFormSelect
              rules={[{ required: true }]}
              width="md"
              options={range(1, 29).map((it) => ({ value: it, label: it }))}
              name="monthly_start_date"
              label={intl.formatMessage({
                id: 'property.monthlyStartDate',
              })}
            />
            <ProFormDigit
              rules={[{ required: true }]}
              width="md"
              name="early_check_in_minutes"
              label={intl.formatMessage({
                id: 'property.earlyCheckinMinutes',
              })}
              fieldProps={{ step: 5, min: 0 }}
            />
            <ProFormDigit
              rules={[{ required: true }]}
              width="md"
              name="ot_point_rate"
              label={intl.formatMessage({
                id: 'property.otPointRate',
              })}
              fieldProps={{ step: 0.5, min: 0 }}
            />
            <ProFormSwitch
              name="require_face_id"
              label={intl.formatMessage({
                id: 'property.requireFaceId',
              })}
              rules={[{ required: true }]}
            />
            <ProFormSwitch
              name="allow_unrecognised_face"
              label={intl.formatMessage({
                id: 'property.allowUnrecognisedFace',
              })}
              rules={[{ required: true }]}
            />
          </ProForm.Group>
        </ProForm>
      </Card>
    </PageContainer>
  );
};

export default Office;
