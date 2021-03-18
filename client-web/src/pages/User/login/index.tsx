import Footer from '@/components/Footer';
import { GoogleReCaptchaProvider, useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import { login } from '@/services/ant-design-pro/login';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import ProForm, { ProFormText } from '@ant-design/pro-form';
import { Alert, message } from 'antd';
import React, { useState } from 'react';
import { FormattedMessage, history, Link, SelectLang, useIntl, useModel } from 'umi';
import styles from './index.less';
import { request } from 'umi';

const LoginMessage: React.FC<{
  content: string;
}> = ({ content }) => (
  <Alert
    style={{
      marginBottom: 24,
    }}
    message={content}
    type="error"
    showIcon
  />
);

/** 此方法会跳转到 redirect 参数所在的位置 */
const goto = () => {
  if (!history) return;
  setTimeout(() => {
    const { query } = history.location;
    const { redirect } = query as { redirect: string };
    history.push(redirect || '/');
  }, 10);
};

const Login: React.FC = () => {
  const [submitting, setSubmitting] = useState(false);
  const [userLoginState, setUserLoginState] = useState<API.LoginResult>({});
  const { initialState, setInitialState } = useModel('@@initialState');
  const { executeRecaptcha } = useGoogleReCaptcha();

  const intl = useIntl();

  const fetchUserInfo = async () => {
    const userInfo = await initialState?.fetchUserInfo?.();
    if (userInfo) {
      setInitialState({
        ...initialState,
        currentUser: userInfo,
      });
    }
  };

  const handleSubmit = async (values: API.LoginParams) => {
    setSubmitting(true);

    const handleRecaptcha = async () => {
      try {
        const token = await executeRecaptcha('user/login');
        console.log('recaptcha token', token);

        // NOTE: We need a backend in order to complete the recaptcha verification
        // https://developers.google.com/recaptcha/docs/verify#api_request
        // otherwise, we will encounter CORS error/problem
        // https://developers.google.com/recaptcha/docs/v3#site_verify_response
        const verifyRecaptchaScoreOnBackend = async () => {
          const result = await request<any>('https://www.google.com/recaptcha/api/siteverify', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            data: {
              secret: 'recaptcha-secret-key',
              response: token,
            },
          });
          console.log(result);
        };
      } catch (err) {
        console.log('error when handling recaptcha', err);
      }
    };

    try {
      await handleRecaptcha();

      // Login
      const msg = await login({ ...values, type: 'account' });
      if (msg.status === 'ok') {
        message.success(
          intl.formatMessage({
            id: 'pages.login.loginSuccesfully',
            defaultMessage: 'Login succesfully!',
          }),
        );
        await fetchUserInfo();
        goto();
        return;
      }
      // If it fails, set to the user error message
      setUserLoginState(msg);
    } catch (error) {
      message.error(
        intl.formatMessage({
          id: 'pages.login.loginFailed',
          defaultMessage: 'Login failed, please try again!',
        }),
      );
    }
    setSubmitting(false);
  };
  const { status, type: loginType } = userLoginState;

  return (
    <div className={styles.container}>
      <div className={styles.lang}>{SelectLang && <SelectLang />}</div>
      <div className={styles.content}>
        <div className={styles.top}>
          <div className={styles.header}>
            <Link to="/">
              <img alt="logo" className={styles.logo} src="/logo-uit.svg" />
              <span className={styles.title}>UIT</span>
            </Link>
          </div>
          <div className={styles.desc}>
            <FormattedMessage
              id="pages.login.applicationName"
              defaultMessage="Human Resource Management Application"
            />
          </div>
        </div>
        <div className={styles.main}>
          <ProForm
            initialValues={{
              autoLogin: true,
            }}
            submitter={{
              searchConfig: {
                submitText: intl.formatMessage({
                  id: 'pages.login.submit',
                  defaultMessage: 'Login',
                }),
              },
              render: (_, dom) => dom.pop(),
              submitButtonProps: {
                loading: submitting,
                size: 'large',
                style: {
                  width: '100%',
                },
              },
            }}
            onFinish={async (values) => {
              handleSubmit(values as API.LoginParams);
            }}
          >
            {status === 'error' && loginType === 'account' && (
              <LoginMessage
                content={intl.formatMessage({
                  id: 'pages.login.accountLogin.errorMessage',
                  defaultMessage: 'Incorrect username/password（admin/uit.hrm)',
                })}
              />
            )}
            <ProFormText
              name="username"
              fieldProps={{
                size: 'large',
                prefix: <UserOutlined className={styles.prefixIcon} />,
              }}
              placeholder={intl.formatMessage({
                id: 'pages.login.username.placeholder',
                defaultMessage: 'Username: admin or user',
              })}
              rules={[
                {
                  required: true,
                  message: (
                    <FormattedMessage
                      id="pages.login.username.required"
                      defaultMessage="Please input your username!"
                    />
                  ),
                },
              ]}
            />
            <ProFormText.Password
              name="password"
              fieldProps={{
                size: 'large',
                prefix: <LockOutlined className={styles.prefixIcon} />,
              }}
              placeholder={intl.formatMessage({
                id: 'pages.login.password.placeholder',
                defaultMessage: 'Password: uit.hrm',
              })}
              rules={[
                {
                  required: true,
                  message: (
                    <FormattedMessage
                      id="pages.login.password.required"
                      defaultMessage="Please input your password!"
                    />
                  ),
                },
              ]}
            />
          </ProForm>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default () => {
  return (
    <GoogleReCaptchaProvider reCaptchaKey={process.env.REACT_APP_RECAPTCHA_KEY}>
      <Login />
    </GoogleReCaptchaProvider>
  );
};
