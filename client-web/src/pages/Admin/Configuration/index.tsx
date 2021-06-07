import { getAppConfig, updateAppConfig } from '@/services/appConfig';
import ProForm, { ProFormDigit, ProFormSelect, ProFormSwitch } from '@ant-design/pro-form';
import { PageContainer } from '@ant-design/pro-layout';
import { Card, message } from 'antd';
import { range } from 'lodash';
import React, { useEffect, useState } from 'react';
import { useAccess } from 'umi';

export const Office: React.FC = () => {
  const [config, setConfig] = useState<API.AppConfig>();
  const [appConfigReady, setAppConfigReady] = useState(false);
  const access = useAccess();

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
          submitter={access['core.change_applicationconfig'] ? undefined : false}
          initialValues={config}
        >
          <ProForm.Group>
            <ProFormSelect
              rules={[{ required: true }]}
              width="md"
              options={range(1, 29).map((it) => ({ value: it, label: it }))}
              name="monthly_start_date"
              label="Monthly start date"
            />
            <ProFormDigit
              rules={[{ required: true }]}
              width="md"
              name="early_check_in_minutes"
              label="Early check in minutes"
              fieldProps={{ step: 5, min: 0 }}
            />
            <ProFormDigit
              rules={[{ required: true }]}
              width="md"
              name="ot_point_rate"
              label="OT Point rate"
              fieldProps={{ step: 0.5, min: 0 }}
            />
            <ProFormSwitch
              name="require_face_id"
              label="Require face id"
              rules={[{ required: true }]}
            />
          </ProForm.Group>
        </ProForm>
      </Card>
    </PageContainer>
  );
};

export default Office;
