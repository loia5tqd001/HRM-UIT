import { getAppConfig, updateAppConfig } from '@/services/appConfig';
import ProForm, { ProFormSelect } from '@ant-design/pro-form';
import { PageContainer } from '@ant-design/pro-layout';
import { Card, message } from 'antd';
import { range } from 'lodash';
import React, { useEffect, useState } from 'react';

export const Office: React.FC = () => {
  const [config, setConfig] = useState<API.AppConfig>();
  const [appConfigReady, setAppConfigReady] = useState(false);

  useEffect(() => {
    getAppConfig()
      .then((fetchData) => setConfig(fetchData))
      .finally(() => setAppConfigReady(true));
  }, []);

  return (
    <PageContainer title={false}>
      <Card loading={!appConfigReady} className="card-shadow">
        <ProForm<API.AppConfig>
          onFinish={async (values) => {
            try {
              await updateAppConfig({ ...config, ...values });
              message.success('Update succesffully');
            } catch {
              message.error('Update unsuccesffully');
            }
          }}
          initialValues={config}
        >
          <ProFormSelect
            rules={[{ required: true }]}
            width="md"
            options={range(1, 29).map((it) => ({ value: it, label: it }))}
            name="monthly_start_date"
            label="Monthly start date"
          />
        </ProForm>
      </Card>
    </PageContainer>
  );
};

export default Office;
