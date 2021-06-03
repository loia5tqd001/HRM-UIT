import Footer from '@/components/Footer';
import { GoogleReCaptchaProvider, useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import { login } from '@/services/auth';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import ProForm, { ProFormText } from '@ant-design/pro-form';
import { Alert, message } from 'antd';
import React, { useState } from 'react';
import { FormattedMessage, history, Link, SelectLang, useIntl, useModel } from 'umi';
import styles from './index.less';
import { request } from 'umi';
import jwtUtils from '@/utils/jwt';

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

/** This method will jump to the location of the "redirect" parameter */
const goto = () => {
  if (!history) return;
  setTimeout(() => {
    const { query } = history.location;
    const { redirect } = query as { redirect: string };
    history.push(redirect || '/');
  }, 10);
};

const Login: React.FC = () => {
  const [loginState, setLoginState] = useState<'submitting' | 'error' | 'idle'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>();
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
    setLoginState('submitting');

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
      const { access: access_token, refresh: refresh_token } = await login({ ...values });
      jwtUtils.saveAccess(access_token);
      jwtUtils.saveRefresh(refresh_token);
      await fetchUserInfo();
      message.success(
        intl.formatMessage({
          id: 'pages.login.loginSuccesfully',
          defaultMessage: 'Login succesfully!',
        }),
      );
      goto();
      setLoginState('idle');
    } catch (err) {
      setErrorMessage('Login failed');
      setLoginState('error');
    }
  };
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
                loading: loginState === 'submitting',
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
            {loginState === 'error' && errorMessage && (
              <LoginMessage
                content={intl.formatMessage({
                  id: errorMessage,
                  defaultMessage: 'Incorrect username/password',
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
                defaultMessage: 'Username',
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
